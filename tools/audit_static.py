#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gridea Pro 主题静态资源闭合审计工具（theme-port-skill 专用）

用途：
    在不修改/依赖 gridea-theme-builder 的前提下，直接审计目标 Gridea 主题目录，
    检查模板、CSS、JS 中的本地静态资源引用是否与 assets/ 目录闭合。

用法：
    python tools/audit_static.py <theme-dir> [--report <报告路径>] [--json]

退出码：
    0 —— 没有 P0 问题（WARN 不阻塞）
    1 —— 存在 P0 问题

审计原理：
    Gridea Pro 的静态资源规则是确定性的：
        assets/styles/main.css  ->  /styles/main.css
        assets/media/xx.png     ->  /media/xx.png
    因此无需渲染输出目录，直接解析目标主题目录即可完成闭合检查。

P0（必须修复）：
    - 字面量静态引用指向的本地文件在 assets/ 中不存在
    - 模板/CSS/JS 中出现了 /assets/ 前缀
    - 模板中静态资源使用相对路径（嵌套输出页会失效）
    - CSS @import / url() / @font-face 依赖缺失
    - 明显残留的 Hexo source/ 路径

WARN（人工确认）：
    - 动态变量引用（{{ config.avatar }}、{{ post.feature }}、theme_config.xxx 等）
    - 外部 CDN 引用
    - JS 中无法 100% 判定为静态资源的路径字符串
    - Gridea 引擎自动产物（/api/search.json、/feed.xml 等）已内置白名单
"""

from __future__ import annotations

import argparse
import json
import posixpath
import re
import sys
import urllib.parse
from pathlib import Path

# ---------------------------------------------------------------------------
# 常量
# ---------------------------------------------------------------------------

# Gridea 引擎自动生成的产物，不需要出现在 assets/ 中
ENGINE_OUTPUT_URLS = {
    "/api/search.json",
    "/feed.xml",
    "/atom.xml",
    "/sitemap.xml",
    "/robots.txt",
    "/manifest.json",
}

# 模板中需要抽取 URL 的属性
TEMPLATE_URL_ATTRS = (
    "href",
    "src",
    "poster",
    "data-src",
    "data-bg",
    "data-background",
    "data-image",
    "data-cover",
    "data-original",
)

# 模板文件扩展名
TEMPLATE_EXTS = {".html", ".ejs", ".tmpl"}

# 可扫描的样式文件扩展名
CSS_EXTS = {".css", ".less"}

# JS 字符串中如果以这些扩展名结尾，按静态资源候选处理
ASSET_LIKE_EXTS = (
    ".css", ".js", ".mjs", ".json", ".png", ".jpg", ".jpeg", ".gif", ".webp",
    ".svg", ".ico", ".woff", ".woff2", ".ttf", ".otf", ".eot", ".mp4",
    ".webm", ".mp3", ".wav", ".xml", ".txt",
)

# 动态模板标记
TEMPLATE_MARKERS = ("{{", "{%", "{#", "<%=", "<%-", "<%")


class Issue:
    def __init__(self, severity: str, location: str, message: str):
        self.severity = severity  # P0 / WARN
        self.location = location
        self.message = message

    def to_dict(self):
        return {
            "severity": self.severity,
            "location": self.location,
            "message": self.message,
        }


class AssetIndex:
    """主题 assets/ 目录 -> 输出 URL 索引。"""

    def __init__(self, theme_dir: Path):
        self.theme_dir = theme_dir
        self.assets_dir = theme_dir / "assets"
        # 输出 URL（如 /styles/main.css） -> 主题内绝对路径
        self.by_url: dict[str, Path] = {}
        # 去掉扩展名后的 URL stem -> 源文件（用于 .less -> .css 的编译产物判定）
        self.compiled_stems: dict[str, Path] = {}
        self.files: list[Path] = []

    def build(self) -> "AssetIndex":
        if not self.assets_dir.is_dir():
            return self
        for path in sorted(self.assets_dir.rglob("*")):
            if not path.is_file():
                continue
            rel = path.relative_to(self.assets_dir).as_posix()
            url = "/" + rel
            self.by_url[url] = path
            self.files.append(path)
            suffix = path.suffix.lower()
            if suffix == ".less":
                self.compiled_stems["/" + rel[: -len(suffix)]] = path
        return self

    def resolve_output_url(self, url: str) -> Path | None:
        """把输出 URL 解析为 assets/ 中的实际文件。"""
        if url in self.by_url:
            return self.by_url[url]
        # Gridea 会编译 .less -> .css
        stem = re.sub(r"\.css$", "", url)
        if stem in self.compiled_stems:
            return self.compiled_stems[stem]
        return None

    def iter_css_sources(self):
        """所有可扫描的样式文件（.css / .less），产出 (输出URL, 文件路径)。"""
        for url, path in self.by_url.items():
            if path.suffix.lower() in CSS_EXTS:
                if path.suffix.lower() == ".less":
                    # 主题中写 main.less，输出 URL 为 main.css
                    yield re.sub(r"\.less$", ".css", url), path
                else:
                    yield url, path


# ---------------------------------------------------------------------------
# URL 辅助函数
# ---------------------------------------------------------------------------

def split_query_hash(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"[\?#].*$", "", raw)
    return urllib.parse.unquote(raw)


def is_external(raw: str) -> bool:
    """是否不需要进入本地资源闭合检查。"""
    s = raw.strip()
    if not s:
        return True
    if s.startswith("#"):
        return True
    if s.startswith("//"):
        return True
    if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*:", s):
        # data: / http: / https: / mailto: / tel: / javascript: 等
        return True
    return False


def is_dynamic_template_ref(raw: str) -> bool:
    return any(marker in raw for marker in TEMPLATE_MARKERS)


def is_root_relative(raw: str) -> bool:
    return raw.startswith("/") and not raw.startswith("//")


def resolve_css_relative(base_output_url: str, ref: str) -> str:
    """CSS 内相对引用：相对于 CSS 的输出 URL 目录解析。"""
    base_dir = posixpath.dirname(base_output_url)
    joined = posixpath.join(base_dir, ref)
    return posixpath.normpath(joined) if not joined.startswith("/") else joined


# ---------------------------------------------------------------------------
# 扫描器
# ---------------------------------------------------------------------------

class StaticAuditor:
    def __init__(self, theme_dir: Path):
        self.theme_dir = theme_dir
        self.index = AssetIndex(theme_dir).build()
        self.issues: list[Issue] = []
        self.dynamic_refs: set[tuple[str, str]] = set()
        self.external_refs: set[tuple[str, str]] = set()

    # ---- 报告 ----

    def _err(self, location: str, message: str):
        self.issues.append(Issue("P0", location, message))

    def _warn(self, location: str, message: str):
        self.issues.append(Issue("WARN", location, message))

    def _check_output_url(self, location: str, url: str) -> bool:
        """检查根相对输出 URL 是否命中资产索引；命中返回 True。"""
        norm = split_query_hash(url)
        if norm in ENGINE_OUTPUT_URLS:
            return True
        if norm.startswith("/assets/"):
            self._err(
                location,
                f"引用中包含被 Gridea 去除的 assets/ 前缀: {url}。"
                f"应改为 {norm[len('/assets/'):]} 或对应输出 URL。",
            )
            return False
        if norm.startswith("/source/") or "/themes/" in norm:
            self._err(
                location,
                f"疑似 Hexo 源主题路径残留: {url}。请改为目标主题 assets/ 对应的输出 URL。",
            )
            return False
        if self.index.resolve_output_url(norm) is not None:
            return True
        self._err(
            location,
            f"静态资源未找到: {url}（主题 assets/ 中没有对应文件，"
            f"也不在引擎自动产物白名单中）",
        )
        return False

    # ---- 模板 ----

    def scan_templates(self):
        templates_dir = self.theme_dir / "templates"
        if not templates_dir.is_dir():
            self._err(str(templates_dir), "templates/ 目录不存在")
            return

        for tpl in sorted(templates_dir.rglob("*")):
            if tpl.suffix.lower() not in TEMPLATE_EXTS:
                continue
            rel = tpl.relative_to(self.theme_dir).as_posix()
            try:
                text = tpl.read_text(encoding="utf-8")
            except (OSError, UnicodeDecodeError) as e:
                self._err(rel, f"无法读取文件: {e}")
                continue
            self._scan_template_text(rel, text)

    def _scan_template_text(self, rel: str, text: str):
        # 1) HTML 属性引用
        attr_re = re.compile(
            r"(" + "|".join(TEMPLATE_URL_ATTRS) + r""")\s*=\s*["']([^"']*)["']""",
            re.IGNORECASE,
        )
        for m in attr_re.finditer(text):
            attr = m.group(1).lower()
            raw = m.group(2).strip()
            if not raw:
                continue
            self._handle_attr_ref(rel, attr, raw)

        # 2) style="...url(...)"（内联样式）
        for m in re.finditer(r"""style\s*=\s*["']([^"']*)["']""", text, re.IGNORECASE):
            self._scan_css_text(rel, m.group(1), base_output_url="/")

        # 3) 内联 <style>...</style>
        for m in re.finditer(r"<style[^>]*>(.*?)</style>", text, re.IGNORECASE | re.DOTALL):
            self._scan_css_text(rel, m.group(1), base_output_url="/")

    def _handle_attr_ref(self, rel: str, attr: str, raw: str):
        # srcset 是逗号分隔的多 URL
        if attr == "srcset":
            for part in raw.split(","):
                candidate = part.strip().split()[0] if part.strip() else ""
                if candidate:
                    self._classify_template_url(rel, candidate)
            return

        # data-* 有些是 JSON/语义值，只处理明显像路径的
        if attr.startswith("data-"):
            if not (raw.startswith("/") or raw.startswith("./") or raw.startswith("../")):
                return

        self._classify_template_url(rel, raw)

    @staticmethod
    def _looks_like_page_link(raw: str) -> bool:
        """页面内部链接（/、/archives/、/post/foo/ 等）不是静态资源。"""
        path = re.sub(r"[\?#].*$", "", raw.strip())
        if path in ("/", ""):
            return True
        if path.startswith("/#"):
            return True
        last = path.rstrip("/").rsplit("/", 1)[-1]
        return "." not in last

    def _classify_template_url(self, rel: str, raw: str):
        if is_external(raw):
            self.external_refs.add((rel, raw))
            return
        if is_dynamic_template_ref(raw):
            self.dynamic_refs.add((rel, raw))
            self._warn(
                rel,
                f"动态资源引用需人工确认: {raw}。请核对运行时生成的 URL 与 assets/ 输出路径一致。",
            )
            return
        if is_root_relative(raw) and self._looks_like_page_link(raw):
            return
        if raw.startswith("./") or raw.startswith("../"):
            self._err(
                rel,
                f"模板静态资源使用了相对路径: {raw}。"
                f"Gridea 的 /post/<slug>/ 等嵌套页面会使相对路径失效，请改为根相对输出 URL。",
            )
            return
        if is_root_relative(raw):
            self._check_output_url(rel, raw)
            return
        # 无协议的裸路径（如 css/main.css）在模板中同样危险
        self._err(
            rel,
            f"模板静态资源使用了裸路径: {raw}。请改为以 / 开头的输出 URL。",
        )

    # ---- CSS ----

    def scan_css(self):
        scanned: set[Path] = set()
        for output_url, path in self.index.iter_css_sources():
            self._scan_css_file(path, output_url, scanned)

    def _scan_css_file(self, path: Path, output_url: str, scanned: set[Path]):
        if path in scanned:
            return
        scanned.add(path)
        rel = path.relative_to(self.theme_dir).as_posix()
        try:
            text = path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError) as e:
            self._err(rel, f"无法读取文件: {e}")
            return

        self._scan_css_text(rel, text, base_output_url=output_url)

        # 递归扫描 @import 进来的本地 CSS
        for m in re.finditer(r"@import\s+(?:url\()?\s*['\"]?([^'\")]+)['\"]?\s*\)?", text, re.IGNORECASE):
            ref = m.group(1).strip()
            if is_external(ref) or is_dynamic_template_ref(ref):
                continue
            target = resolve_css_relative(output_url, ref) if not is_root_relative(ref) else split_query_hash(ref)
            target_path = self.index.resolve_output_url(split_query_hash(target))
            if target_path is not None and target_path.suffix.lower() in CSS_EXTS:
                target_output_url = (
                    re.sub(r"\.less$", ".css", target) if target_path.suffix.lower() == ".less" else target
                )
                self._scan_css_file(target_path, target_output_url, scanned)

    def _scan_css_text(self, rel: str, text: str, base_output_url: str):
        # url(...)
        for m in re.finditer(r"url\(\s*['\"]?([^'\")]+)['\"]?\s*\)", text, re.IGNORECASE):
            ref = m.group(1).strip()
            if is_external(ref) or is_dynamic_template_ref(ref):
                continue
            if ref.startswith("/"):
                self._check_output_url(rel, ref)
            else:
                target = resolve_css_relative(base_output_url, ref)
                if self.index.resolve_output_url(split_query_hash(target)) is None:
                    self._err(
                        rel,
                        f"CSS 依赖未找到: {ref}（解析为 {target}）",
                    )

        # @import 非 url() 形式
        for m in re.finditer(r"@import\s+['\"]([^'\"]+)['\"]", text, re.IGNORECASE):
            ref = m.group(1).strip()
            if is_external(ref) or is_dynamic_template_ref(ref):
                continue
            target = resolve_css_relative(base_output_url, ref) if not is_root_relative(ref) else split_query_hash(ref)
            if self.index.resolve_output_url(split_query_hash(target)) is None:
                self._err(
                    rel,
                    f"CSS @import 未找到: {ref}（解析为 {target}）",
                )

    # ---- JS ----

    def scan_js(self):
        for url, path in self.index.by_url.items():
            if path.suffix.lower() not in {".js", ".mjs"}:
                continue
            rel = path.relative_to(self.theme_dir).as_posix()
            try:
                text = path.read_text(encoding="utf-8")
            except (OSError, UnicodeDecodeError) as e:
                self._err(rel, f"无法读取文件: {e}")
                continue
            self._scan_js_text(rel, text, output_url=url)

    def _scan_js_text(self, rel: str, text: str, output_url: str):
        # 单/双引号字符串。JS 里误报风险高，因此只对“路径特征明显”的字符串做检查。
        string_re = re.compile(r"([\"'])((?:\\.|(?!\1).)*)\1")
        seen: set[str] = set()
        for m in string_re.finditer(text):
            raw = m.group(2).strip()
            # 仅处理 JS 中常见的转义斜杠；不做 unicode_escape，避免破坏中文路径
            raw = raw.replace("\\/", "/")
            if not raw or is_external(raw) or raw in seen:
                continue
            seen.add(raw)

            if not (is_root_relative(raw) or raw.startswith("./") or raw.startswith("../")):
                # 只把带资源扩展名的裸路径纳入检查，避免普通字符串误报
                if not raw.lower().endswith(ASSET_LIKE_EXTS):
                    continue
                if "/" not in raw:
                    continue

            if is_root_relative(raw):
                norm = split_query_hash(raw)
                if norm in ENGINE_OUTPUT_URLS:
                    continue
                if norm.startswith("/assets/"):
                    self._err(rel, f"JS 中引用包含 assets/ 前缀: {raw}")
                    continue
                if self.index.resolve_output_url(norm) is None:
                    self._warn(
                        rel,
                        f"JS 字符串路径在 assets/ 中未直接命中（可能是动态路径）: {raw}",
                    )
            else:
                target = resolve_css_relative(output_url, raw)
                if self.index.resolve_output_url(split_query_hash(target)) is None:
                    self._warn(
                        rel,
                        f"JS 相对路径在 assets/ 中未直接命中（可能是动态路径）: {raw}（解析为 {target}）",
                    )

    # ---- 汇总 ----

    def run(self) -> list[Issue]:
        self.scan_templates()
        self.scan_css()
        self.scan_js()
        return self.issues


# ---------------------------------------------------------------------------
# 输出
# ---------------------------------------------------------------------------

def print_report(theme_dir: Path, auditor: StaticAuditor):
    p0 = [i for i in auditor.issues if i.severity == "P0"]
    warns = [i for i in auditor.issues if i.severity == "WARN"]

    line = "=" * 62
    print()
    print(line)
    print("  Gridea 主题静态资源闭合审计")
    print(line)
    print(f"  主题目录: {theme_dir}")
    print(f"  assets/ 资产文件: {len(auditor.index.files)} 个")
    print(f"  P0: {len(p0)}   WARN: {len(warns)}")
    print(line)

    if p0:
        print()
        print("  [P0] 必须修复:")
        for issue in p0:
            print(f"    - {issue.location}: {issue.message}")

    if warns:
        print()
        print("  [WARN] 人工确认:")
        for issue in warns:
            print(f"    - {issue.location}: {issue.message}")

    if auditor.dynamic_refs:
        print()
        print("  动态引用汇总（需人工确认）:")
        for loc, ref in sorted(auditor.dynamic_refs):
            print(f"    - {loc}: {ref}")

    print()
    print(line)
    if p0:
        print("  结论: FAIL（存在未闭合的静态资源引用）")
    else:
        print("  结论: PASS（无 P0；WARN 不阻塞）")
    print(line)
    print()


def write_json_report(report_path: Path, theme_dir: Path, auditor: StaticAuditor):
    payload = {
        "theme_dir": str(theme_dir),
        "asset_count": len(auditor.index.files),
        "p0": [i.to_dict() for i in auditor.issues if i.severity == "P0"],
        "warn": [i.to_dict() for i in auditor.issues if i.severity == "WARN"],
        "dynamic_refs": [
            {"location": loc, "ref": ref}
            for loc, ref in sorted(auditor.dynamic_refs)
        ],
        "external_refs": [
            {"location": loc, "ref": ref}
            for loc, ref in sorted(auditor.external_refs)
        ],
        "passed": not any(i.severity == "P0" for i in auditor.issues),
    }
    report_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main():
    parser = argparse.ArgumentParser(
        description="Gridea Pro 主题静态资源闭合审计（不依赖 theme-builder-skill）"
    )
    parser.add_argument("theme_dir", help="目标 Gridea 主题目录")
    parser.add_argument(
        "--report",
        default=None,
        help="把 JSON 报告写入指定文件（默认不写）",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="同时向 stdout 输出 JSON 报告",
    )
    args = parser.parse_args()

    theme_dir = Path(args.theme_dir).resolve()
    if not theme_dir.is_dir():
        print(f"❌ 主题目录不存在: {theme_dir}", file=sys.stderr)
        return 1

    auditor = StaticAuditor(theme_dir)
    auditor.run()
    print_report(theme_dir, auditor)

    if args.report:
        write_json_report(Path(args.report).resolve(), theme_dir, auditor)
        print(f"  JSON 报告已写入: {Path(args.report).resolve()}")
    if args.json:
        print(json.dumps({
            "theme_dir": str(theme_dir),
            "p0": [i.to_dict() for i in auditor.issues if i.severity == "P0"],
            "warn": [i.to_dict() for i in auditor.issues if i.severity == "WARN"],
            "passed": not any(i.severity == "P0" for i in auditor.issues),
        }, ensure_ascii=False, indent=2))

    return 1 if any(i.severity == "P0" for i in auditor.issues) else 0


if __name__ == "__main__":
    raise SystemExit(main())
