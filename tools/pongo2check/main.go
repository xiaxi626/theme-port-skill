// SPDX-License-Identifier: GPL-3.0-only
//
// Copyright (C) 2026  xiaxi626
//
// The SanitizingLoader preprocessing and custom-filter list are informed by
// Gridea-Pro/gridea-pro (GPL-3.0-or-later):
//   backend/internal/render/jinja2_loader.go   — sanitizeTemplate, reLoop* mapping
//   backend/internal/render/jinja2_renderer.go  — registerCustomFilters
//
// pongo2check — Gridea Pro 真 Pongo2 语法校验器
//
// 复刻 Gridea Pro 真机 (gridea-pro/backend/internal/render/) 的完整管线:
//  1. SanitizingLoader: 标签内换行清理 + Jinja2 loop.* → Pongo2 forloop.* 映射
//  2. 注册 9 个 Gridea Pro 自定义 filter (no-op, 仅用于 parse 通过)
//  3. pongo2/v6 v6.0.0 真解析, 遍历全部模板编译
//
// 与官方 validate_syntax.py (正则启发式) 相比:
//  - pongo2check 使用 Gridea Pro 真机同款解析器, 零假阳性
//  - 真机接受的模板一定通过, 真机拒绝的一定失败
//  - 只保证语法可编译, 不检查变量语义/视觉还原
//
// 用法:
//   go run ./tools/pongo2check <theme-dir>
//   cd tools/pongo2check && go build -o pongo2check && ./pongo2check <theme-dir>
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	pongo2 "github.com/flosch/pongo2/v6"
)

// ---- Gridea Pro custom filters (no-op, parse-only) -----------------------

func registerGrideaFilters() {
	pongo2.RegisterFilter("reading_time", noopFilter)
	pongo2.RegisterFilter("excerpt", noopFilter)
	pongo2.RegisterFilter("word_count", noopFilter)
	pongo2.RegisterFilter("strip_html", noopFilter)
	pongo2.RegisterFilter("relative", noopFilter)
	pongo2.RegisterFilter("timeago", noopFilter)
	pongo2.RegisterFilter("to_json", noopFilter)
	pongo2.RegisterFilter("group_by", noopFilter)
	pongo2.RegisterFilter("to_int", noopFilter)
}

func noopFilter(in *pongo2.Value, param *pongo2.Value) (*pongo2.Value, *pongo2.Error) {
	return pongo2.AsValue(""), nil
}

// ---- SanitizingLoader (replicates Gridea Pro jinja2_loader.go) ----------

// SanitizingLoader wraps template file loading with pre-processing:
//   - Strip newlines inside {{ }}, {% %}, {# #} tags (Pongo2 lexer is strict)
//   - Map Jinja2 loop.* → Pongo2 forloop.* variables
type SanitizingLoader struct {
	basePath string
}

func NewSanitizingLoader(basePath string) (*SanitizingLoader, error) {
	abs, err := filepath.Abs(basePath)
	if err != nil {
		return nil, fmt.Errorf("resolve templates path: %w", err)
	}
	if info, err := os.Stat(abs); err != nil || !info.IsDir() {
		return nil, fmt.Errorf("templates directory not found: %s", abs)
	}
	return &SanitizingLoader{basePath: abs}, nil
}

// ---- Regex patterns (order-sensitive: match longest sub-patterns first) ----

var (
	reTagBlock = regexp.MustCompile(`(?sU)(\{\{.+\}\}|\{%.+%\}|\{#.+#\})`)

	// Jinja2 loop → Pongo2 forloop (PascalCase) mapping
	reLoopIndex0    = regexp.MustCompile(`\bloop\.index0\b`)
	reLoopRevIndex0 = regexp.MustCompile(`\bloop\.revindex0\b`)
	reLoopIndex     = regexp.MustCompile(`\bloop\.index\b`)
	reLoopRevIndex  = regexp.MustCompile(`\bloop\.revindex\b`)
	reLoopFirst     = regexp.MustCompile(`\bloop\.first\b`)
	reLoopLast      = regexp.MustCompile(`\bloop\.last\b`)

	// Static reference check: {% include "..." %} / {% extends "..." %}
	reIncludeExtends = regexp.MustCompile(`\{%[- ]*\s*(?:include|extends)\s+["']([^"']+)["']`)
)

func sanitizeTemplate(content []byte) []byte {
	return reTagBlock.ReplaceAllFunc(content, func(match []byte) []byte {
		c := bytes.ReplaceAll(match, []byte("\n"), []byte(" "))
		c = bytes.ReplaceAll(c, []byte("\r"), []byte(" "))
		c = bytes.ReplaceAll(c, []byte("\t"), []byte(" "))
		return c
	})
}

// ---- TemplateLoader interface --------------------------------------------

func (l *SanitizingLoader) Abs(base, name string) string {
	if filepath.IsAbs(name) {
		return name
	}
	return filepath.Join(l.basePath, name)
}

func (l *SanitizingLoader) Get(path string) (io.Reader, error) {
	absPath := path
	if !filepath.IsAbs(absPath) {
		absPath = filepath.Join(l.basePath, path)
	}
	absPath = filepath.Clean(absPath)
	if !strings.HasPrefix(strings.ToLower(absPath), strings.ToLower(l.basePath)) {
		return nil, os.ErrNotExist
	}

	content, err := os.ReadFile(absPath)
	if err != nil {
		return nil, err
	}

	cleaned := sanitizeTemplate(content)

	// Replace order must be longest-first to avoid truncation artifacts
	cleaned = reLoopIndex0.ReplaceAll(cleaned, []byte("forloop.Counter0"))
	cleaned = reLoopRevIndex0.ReplaceAll(cleaned, []byte("forloop.Revcounter0"))
	cleaned = reLoopIndex.ReplaceAll(cleaned, []byte("forloop.Counter"))
	cleaned = reLoopRevIndex.ReplaceAll(cleaned, []byte("forloop.Revcounter"))
	cleaned = reLoopFirst.ReplaceAll(cleaned, []byte("forloop.First"))
	cleaned = reLoopLast.ReplaceAll(cleaned, []byte("forloop.Last"))

	return bytes.NewReader(cleaned), nil
}

// ---- Static include/extends check ----------------------------------------

func checkStaticRefs(templatesDir, filePath string, content []byte) (warns []string) {
	for _, m := range reIncludeExtends.FindAllSubmatch(content, -1) {
		ref := string(m[1])
		refPath := filepath.Join(templatesDir, ref)
		if _, err := os.Stat(refPath); os.IsNotExist(err) {
			rel, _ := filepath.Rel(templatesDir, filePath)
			warns = append(warns, fmt.Sprintf("templates/%s → referenced file not found: %s", rel, ref))
		}
	}
	return
}

// ---- Main ----------------------------------------------------------------

func main() {
	if len(os.Args) < 2 {
		fmt.Fprintf(os.Stderr, "Usage: pongo2check <theme-directory>\n")
		os.Exit(2)
	}
	themeDir, _ := filepath.Abs(os.Args[1])
	configPath := filepath.Join(themeDir, "config.json")

	// Detect engine
	engine := ""
	if data, err := os.ReadFile(configPath); err == nil {
		var cfg struct {
			Engine string `json:"engine"`
		}
		if json.Unmarshal(data, &cfg) == nil {
			engine = strings.ToLower(cfg.Engine)
		}
		fmt.Printf("config.json engine: %s\n", engine)
	} else {
		fmt.Println("warn: config.json not found, assuming jinja2/pongo2")
	}
	if engine != "" && engine != "jinja2" && engine != "pongo2" {
		fmt.Printf("skip: engine '%s' is not jinja2/pongo2\n", engine)
		os.Exit(0)
	}

	// Register Gridea Pro custom filters (global, one-shot)
	registerGrideaFilters()

	// Set up the sanitizing loader + pongo2 template set
	templatesDir := filepath.Join(themeDir, "templates")
	loader, err := NewSanitizingLoader(templatesDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "FATAL: %v\n", err)
		os.Exit(1)
	}
	set := pongo2.NewSet("pongo2check", loader)
	set.Debug = false

	// Collect template files
	var tmplFiles []string
	err = filepath.Walk(templatesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		ext := strings.ToLower(filepath.Ext(path))
		if ext == ".html" || ext == ".ejs" || ext == ".tmpl" {
			tmplFiles = append(tmplFiles, path)
		}
		return nil
	})
	if err != nil {
		fmt.Fprintf(os.Stderr, "FATAL: walking templates: %v\n", err)
		os.Exit(1)
	}
	if len(tmplFiles) == 0 {
		fmt.Println("SKIP: no template files found in templates/")
		os.Exit(0)
	}

	// Parse each template
	passed := 0
	failed := 0
	var warns []string

	for _, file := range tmplFiles {
		rel, _ := filepath.Rel(templatesDir, file)
		rel = filepath.ToSlash(rel)

		// --- static include/extends check ---
		if raw, err := os.ReadFile(file); err == nil {
			warns = append(warns, checkStaticRefs(templatesDir, file, raw)...)
		}

		// --- real Pongo2 parse ---
		_, perr := set.FromFile(rel)
		if perr != nil {
			fmt.Printf("FAIL  templates/%s  %s\n", rel, perr.Error())
			failed++
		} else {
			fmt.Printf("PASS  templates/%s\n", rel)
			passed++
		}
	}

	// Static warnings
	for _, w := range warns {
		fmt.Println("WARN ", w)
	}
	if len(warns) > 0 {
		fmt.Println()
	}

	// Summary
	bar := strings.Repeat("=", 44)
	fmt.Println(bar)
	fmt.Printf("  PASS: %d  FAIL: %d  WARN: %d\n", passed, failed, len(warns))
	fmt.Println(bar)

	if failed > 0 {
		fmt.Println("\n  Fix the FAIL items above. The real Gridea Pro parser would also reject them.")
		os.Exit(1)
	}
	if len(warns) > 0 {
		fmt.Println("\n  All templates parsed. WARN items are advisory — consider fixing them.")
	} else {
		fmt.Println("\n  All templates pass the real Pongo2 parser.")
	}
}
