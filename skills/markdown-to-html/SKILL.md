---
name: markdown-to-html
description: '`marked.js`、`pandoc`、`gomarkdown/markdown` などを使って Markdown ファイルを HTML へ変換する、または Markdown を HTML に変換するカスタムスクリプトや `jekyll/jekyll`、`gohugoio/hugo` などの Web テンプレートシステムを扱う。Markdown 文書を HTML 出力へ変換する場合に使用する。「convert markdown to html」「transform md to html」「render markdown」「generate html from markdown」の依頼、および `.md` ファイルや Markdown を HTML に変換する Web テンプレートシステムを扱う場合に使う。GFM、CommonMark、標準 Markdown フレーバーの CLI および Node.js ワークフローをサポートする。'
---

# MarkdownからHTMLへの変換

`marked.js`ライブラリを使ってMarkdown文書をHTMLへ変換したり、[markedJS/marked](https://github.com/markedjs/marked)リポジトリに似たデータ変換スクリプトを書いたりするための専門Skill。カスタムスクリプトでは`marked.js`に限定せず、データ変換に[pandoc](https://github.com/jgm/pandoc)や[gomarkdown/markdown](https://github.com/gomarkdown/markdown)を、テンプレートシステムに[jekyll/jekyll](https://github.com/jekyll/jekyll)や[gohugoio/hugo](https://github.com/gohugoio/hugo)を活用する。

変換スクリプトまたはツールは、単一ファイル、バッチ変換、高度な構成を扱えるようにする。

## このSkillを使う場合

- User asks to "convert markdown to html" or "transform md files"
- User wants to "render markdown" as HTML output
- User needs to generate HTML documentation from .md files
- User is building static sites from Markdown content
- User is building template system that converts markdown to html
- User is working on a tool, widget, or custom template for an existing templating system
- User wants to preview Markdown as rendered HTML

## MarkdownをHTMLへ変換する

### 基本的な変換

詳細は[ basic-markdown-to-html.md](references/basic-markdown-to-html.md)を参照。

```text
    ```markdown
    # Level 1
    ## Level 2

    One sentence with a [link](https://example.com), and a HTML snippet like `<p>paragraph tag</p>`.

    - `ul` list item 1
    - `ul` list item 2

    1. `ol` list item 1
    2. `ol` list item 1

    | Table Item | Description |
    | One | One is the spelling of the number `1`. |
    | Two | Two is the spelling of the number `2`. |

    ```js
    var one = 1;
    var two = 2;

    function simpleMath(x, y) {
     return x + y;
    }
    console.log(simpleMath(one, two));
    ```
    ```

    ```html
    <h1>Level 1</h1>
    <h2>Level 2</h2>

    <p>One sentence with a <a href="https://example.com">link</a>, and a HTML snippet like <code>&lt;p&gt;paragraph tag&lt;/p&gt;</code>.</p>

    <ul>
     <li>`ul` list item 1</li>
     <li>`ul` list item 2</li>
    </ul>

    <ol>
     <li>`ol` list item 1</li>
     <li>`ol` list item 2</li>
    </ol>

    <table>
     <thead>
      <tr>
       <th>Table Item</th>
       <th>Description</th>
      </tr>
     </thead>
     <tbody>
      <tr>
       <td>One</td>
       <td>One is the spelling of the number `1`.</td>
      </tr>
      <tr>
       <td>Two</td>
       <td>Two is the spelling of the number `2`.</td>
      </tr>
     </tbody>
    </table>

    <pre>
     <code>var one = 1;
     var two = 2;

     function simpleMath(x, y) {
      return x + y;
     }
     console.log(simpleMath(one, two));</code>
    </pre>
    ```
```

### コードブロックの変換

詳細は[ code-blocks-to-html.md](references/code-blocks-to-html.md)を参照。

```text

    ```markdown
    your code here
    ```

    ```html
    <pre><code class="language-md">
    your code here
    </code></pre>
    ```

    ```js
    console.log("Hello world");
    ```

    ```html
    <pre><code class="language-js">
    console.log("Hello world");
    </code></pre>
    ```

    ```markdown
      ```

      ```
      visible backticks
      ```

      ```
    ```

    ```html
      <pre><code>
      ```

      visible backticks

      ```
      </code></pre>
    ```
```

### 折りたたみセクションの変換

詳細は[ collapsed-sections-to-html.md](references/collapsed-sections-to-html.md)を参照。

```text
    ```markdown
    <details>
    <summary>More info</summary>

    ### Header inside

    - Lists
    - **Formatting**
    - Code blocks

        ```js
        console.log("Hello");
        ```

    </details>
    ```

    ```html
    <details>
    <summary>More info</summary>

    <h3>Header inside</h3>

    <ul>
     <li>Lists</li>
     <li><strong>Formatting</strong></li>
     <li>Code blocks</li>
    </ul>

    <pre>
     <code class="language-js">console.log("Hello");</code>
    </pre>

    </details>
    ```
```

### 数式の変換

詳細は[ writing-mathematical-expressions-to-html.md](references/writing-mathematical-expressions-to-html.md)を参照。

```text
    ```markdown
    This sentence uses `$` delimiters to show math inline: $\sqrt{3x-1}+(1+x)^2$
    ```

    ```html
    <p>This sentence uses <code>$</code> delimiters to show math inline:
     <math-renderer><math xmlns="http://www.w3.org/1998/Math/MathML">
      <msqrt><mn>3</mn><mi>x</mi><mo>−</mo><mn>1</mn></msqrt>
      <mo>+</mo><mo>(</mo><mn>1</mn><mo>+</mo><mi>x</mi>
      <msup><mo>)</mo><mn>2</mn></msup>
     </math>
    </math-renderer>
    </p>
    ```

    ```markdown
    **The Cauchy-Schwarz Inequality**\
    $$\left( \sum_{k=1}^n a_k b_k \right)^2 \leq \left( \sum_{k=1}^n a_k^2 \right) \left( \sum_{k=1}^n b_k^2 \right)$$
    ```

    ```html
    <p><strong>The Cauchy-Schwarz Inequality</strong><br>
     <math-renderer>
      <math xmlns="http://www.w3.org/1998/Math/MathML">
       <msup>
        <mrow><mo>(</mo>
         <munderover><mo data-mjx-texclass="OP">∑</mo>
          <mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow><mi>n</mi>
         </munderover>
         <msub><mi>a</mi><mi>k</mi></msub>
         <msub><mi>b</mi><mi>k</mi></msub>
         <mo>)</mo>
        </mrow>
        <mn>2</mn>
       </msup>
       <mo>≤</mo>
       <mrow><mo>(</mo>
        <munderover><mo>∑</mo>
         <mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow>
         <mi>n</mi>
        </munderover>
        <msubsup><mi>a</mi><mi>k</mi><mn>2</mn></msubsup>
        <mo>)</mo>
       </mrow>
       <mrow><mo>(</mo>
         <munderover><mo>∑</mo>
          <mrow><mi>k</mi><mo>=</mo><mn>1</mn></mrow>
          <mi>n</mi>
         </munderover>
         <msubsup><mi>b</mi><mi>k</mi><mn>2</mn></msubsup>
         <mo>)</mo>
       </mrow>
      </math>
     </math-renderer></p>
    ```
```

### 表の変換

詳細は[ tables-to-html.md](references/tables-to-html.md)を参照。

```text
    ```markdown
    | First Header  | Second Header |
    | ------------- | ------------- |
    | Content Cell  | Content Cell  |
    | Content Cell  | Content Cell  |
    ```

    ```html
    <table>
     <thead><tr><th>First Header</th><th>Second Header</th></tr></thead>
     <tbody>
      <tr><td>Content Cell</td><td>Content Cell</td></tr>
      <tr><td>Content Cell</td><td>Content Cell</td></tr>
     </tbody>
    </table>
    ```

    ```markdown
    | Left-aligned | Center-aligned | Right-aligned |
    | :---         |     :---:      |          ---: |
    | git status   | git status     | git status    |
    | git diff     | git diff       | git diff      |
    ```

    ```html
    <table>
      <thead>
       <tr>
        <th align="left">Left-aligned</th>
        <th align="center">Center-aligned</th>
        <th align="right">Right-aligned</th>
       </tr>
      </thead>
      <tbody>
       <tr>
        <td align="left">git status</td>
        <td align="center">git status</td>
        <td align="right">git status</td>
       </tr>
       <tr>
        <td align="left">git diff</td>
        <td align="center">git diff</td>
        <td align="right">git diff</td>
       </tr>
      </tbody>
    </table>
    ```
```

## [`markedJS/marked`](references/marked.md)を使う

### 前提条件

- Node.jsをインストール済み（CLIまたはプログラム利用向け）
- CLI用にmarkedをグローバルインストール: `npm install -g marked`
- またはローカルインストール: `npm install marked`

### 簡易変換方法

[marked.md](references/marked.md)の**簡易変換方法**を参照。

### 手順別ワークフロー

[marked.md](references/marked.md)の**手順別ワークフロー**を参照。

### CLI構成

### 構成ファイルを使う

永続的なオプション用に`~/.marked.json`を作成する:

```json
{
  "gfm": true,
  "breaks": true
}
```

またはカスタム構成を使う:

```bash
marked -i input.md -o output.html -c config.json
```

### CLIオプションのリファレンス

| オプション | 説明 |
|--------|-------------|
| `-i, --input <file>` | 入力Markdownファイル |
| `-o, --output <file>` | 出力HTMLファイル |
| `-s, --string <string>` | ファイルではなく文字列を解析 |
| `-c, --config <file>` | カスタム構成ファイルを使う |
| `--gfm` | GitHub Flavored Markdownを有効化 |
| `--breaks` | 改行を`<br>`へ変換 |
| `--help` | すべてのオプションを表示 |

### セキュリティ警告

⚠️ **Marked does NOT sanitize output HTML.** For untrusted input, use a sanitizer:

```javascript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const unsafeHtml = marked.parse(untrustedMarkdown);
const safeHtml = DOMPurify.sanitize(unsafeHtml);
```

推奨サニタイザー:

- [DOMPurify](https://github.com/cure53/DOMPurify)（推奨）
- [sanitize-html](https://github.com/apostrophecms/sanitize-html)
- [js-xss](https://github.com/leizongmin/js-xss)

### サポートされるMarkdownフレーバー

| Flavor | Support |
|--------|---------|
| Original Markdown | 100% |
| CommonMark 0.31 | 98% |
| GitHub Flavored Markdown | 97% |

### トラブルシューティング

| Issue | Solution |
|-------|----------|
| Special characters at file start | Strip zero-width chars: `content.replace(/^[\u200B\u200C\u200D\uFEFF]/,"")` |
| Code blocks not highlighting | Add a syntax highlighter like highlight.js |
| Tables not rendering | Ensure `gfm: true` option is set |
| Line breaks ignored | Set `breaks: true` in options |
| XSS vulnerability concerns | Use DOMPurify to sanitize output |

## [`pandoc`](references/pandoc.md)を使う

### 前提条件

- Pandocをインストール済み（<https://pandoc.org/installing.html>からダウンロード）
- PDF出力にはLaTeXをインストール（macOSはMacTeX、WindowsはMiKTeX、Linuxはtexlive）
- ターミナル／コマンドプロンプトへアクセスできること

### 簡易変換方法

#### 方法1: CLIによる基本変換

```bash
# MarkdownをHTMLへ変換
pandoc input.md -o output.html

# スタンドアロン文書へ変換（ヘッダー／フッターを含む）
pandoc input.md -s -o output.html

# 形式を明示
pandoc input.md -f markdown -t html -s -o output.html
```

#### 方法2: フィルターモード（対話型）

```bash
# pandocをフィルターとして開始
pandoc

# Markdownを入力し、Ctrl-D（Linux/macOS）またはCtrl-Z+Enter（Windows）を押す
Hello *pandoc*!
# Output: <p>Hello <em>pandoc</em>!</p>
```

#### 方法3: 形式変換

```bash
# HTML to Markdown
pandoc -f html -t markdown input.html -o output.md

# Markdown to LaTeX
pandoc input.md -s -o output.tex

# Markdown to PDF (requires LaTeX)
pandoc input.md -s -o output.pdf

# Markdown to Word
pandoc input.md -s -o output.docx
```

### CLI構成

| Option | Description |
|--------|-------------|
| `-f, --from <format>` | Input format (markdown, html, latex, etc.) |
| `-t, --to <format>` | Output format (html, latex, pdf, docx, etc.) |
| `-s, --standalone` | Produce standalone document with header/footer |
| `-o, --output <file>` | Output file (inferred from extension) |
| `--mathml` | Convert TeX math to MathML |
| `--metadata title="Title"` | Set document metadata |
| `--toc` | Include table of contents |
| `--template <file>` | Use custom template |
| `--help` | Show all options |

### セキュリティ警告

⚠️ **Pandoc processes input faithfully.** When converting untrusted markdown:

- Use `--sandbox` mode to disable external file access
- Validate input before processing
- Sanitize HTML output if displayed in browsers

```bash
# Run in sandbox mode for untrusted input
pandoc --sandbox input.md -o output.html
```

### サポートされるMarkdownフレーバー

| Flavor | Support |
|--------|---------|
| Pandoc Markdown | 100% (native) |
| CommonMark | Full (use `-f commonmark`) |
| GitHub Flavored Markdown | Full (use `-f gfm`) |
| MultiMarkdown | Partial |

### トラブルシューティング

| Issue | Solution |
|-------|----------|
| PDF generation fails | Install LaTeX (MacTeX, MiKTeX, or texlive) |
| Encoding issues on Windows | Run `chcp 65001` before using pandoc |
| Missing standalone headers | Add `-s` flag for complete documents |
| Math not rendering | Use `--mathml` or `--mathjax` option |
| Tables not rendering | Ensure proper table syntax with pipes and dashes |

## [`gomarkdown/markdown`](references/gomarkdown.md)を使う

### 前提条件

- Go 1.18 or higher installed
- Install the library: `go get github.com/gomarkdown/markdown`
- For CLI tool: `go install github.com/gomarkdown/mdtohtml@latest`

### 簡易変換方法

#### 方法1: 単純変換（Go）

```go
package main

import (
    "fmt"
    "github.com/gomarkdown/markdown"
)

func main() {
    md := []byte("# Hello World\n\nThis is **bold** text.")
    html := markdown.ToHTML(md, nil, nil)
    fmt.Println(string(html))
}
```

#### 方法2: CLIツール

```bash
# Install mdtohtml
go install github.com/gomarkdown/mdtohtml@latest

# Convert file
mdtohtml input.md output.html

# Convert file (output to stdout)
mdtohtml input.md
```

#### 方法3: カスタムパーサーとレンダラー

```go
package main

import (
    "github.com/gomarkdown/markdown"
    "github.com/gomarkdown/markdown/html"
    "github.com/gomarkdown/markdown/parser"
)

func mdToHTML(md []byte) []byte {
    // Create parser with extensions
    extensions := parser.CommonExtensions | parser.AutoHeadingIDs | parser.NoEmptyLineBeforeBlock
    p := parser.NewWithExtensions(extensions)
    doc := p.Parse(md)

    // Create HTML renderer with extensions
    htmlFlags := html.CommonFlags | html.HrefTargetBlank
    opts := html.RendererOptions{Flags: htmlFlags}
    renderer := html.NewRenderer(opts)

    return markdown.Render(doc, renderer)
}
```

### CLI構成

The `mdtohtml` CLI tool has minimal options:

```bash
mdtohtml input-file [output-file]
```

For advanced configuration, use the Go library programmatically with parser and renderer options:

| Parser Extension | Description |
|------------------|-------------|
| `parser.CommonExtensions` | Tables, fenced code, autolinks, strikethrough, etc. |
| `parser.AutoHeadingIDs` | Generate IDs for headings |
| `parser.NoEmptyLineBeforeBlock` | No blank line needed before blocks |
| `parser.MathJax` | MathJax support for LaTeX math |

| HTML Flag | Description |
|-----------|-------------|
| `html.CommonFlags` | Common HTML output flags |
| `html.HrefTargetBlank` | Add `target="_blank"` to links |
| `html.CompletePage` | Generate complete HTML page |
| `html.UseXHTML` | Generate XHTML output |

### セキュリティ警告

⚠️ **gomarkdown does NOT sanitize output HTML.** For untrusted input, use Bluemonday:

```go
import (
    "github.com/microcosm-cc/bluemonday"
    "github.com/gomarkdown/markdown"
)

maybeUnsafeHTML := markdown.ToHTML(md, nil, nil)
html := bluemonday.UGCPolicy().SanitizeBytes(maybeUnsafeHTML)
```

Recommended sanitizer: [Bluemonday](https://github.com/microcosm-cc/bluemonday)

### サポートされるMarkdownフレーバー

| Flavor | Support |
|--------|---------|
| Original Markdown | 100% |
| CommonMark | High (with extensions) |
| GitHub Flavored Markdown | High (tables, fenced code, strikethrough) |
| MathJax/LaTeX Math | Supported via extension |
| Mmark | Supported |

### トラブルシューティング

| Issue | Solution |
|-------|----------|
| Windows/Mac newlines not parsed | Use `parser.NormalizeNewlines(input)` |
| Tables not rendering | Enable `parser.Tables` extension |
| Code blocks without highlighting | Integrate with syntax highlighter like Chroma |
| Math not rendering | Enable `parser.MathJax` extension |
| XSS vulnerabilities | Use Bluemonday to sanitize output |

## [`jekyll`](references/jekyll.md)を使う

### 前提条件

- Ruby version 2.7.0 or higher
- RubyGems
- GCC and Make (for native extensions)
- Install Jekyll and Bundler: `gem install jekyll bundler`

### 簡易変換方法

#### 方法1: 新しいサイトを作成

```bash
# Create a new Jekyll site
jekyll new myblog

# Change to site directory
cd myblog

# Build and serve locally
bundle exec jekyll serve

# Access at http://localhost:4000
```

#### 方法2: 静的サイトをビルド

```bash
# Build site to _site directory
bundle exec jekyll build

# Build with production environment
JEKYLL_ENV=production bundle exec jekyll build
```

#### 方法3: ライブリロード開発

```bash
# Serve with live reload
bundle exec jekyll serve --livereload

# Serve with drafts
bundle exec jekyll serve --drafts
```

### CLI構成

| Command | Description |
|---------|-------------|
| `jekyll new <path>` | Create new Jekyll site |
| `jekyll build` | Build site to `_site` directory |
| `jekyll serve` | Build and serve locally |
| `jekyll clean` | Remove generated files |
| `jekyll doctor` | Check for configuration issues |

| Serve Options | Description |
|---------------|-------------|
| `--livereload` | Reload browser on changes |
| `--drafts` | Include draft posts |
| `--port <port>` | Set server port (default: 4000) |
| `--host <host>` | Set server host (default: localhost) |
| `--baseurl <url>` | Set base URL |

### セキュリティ警告

⚠️ **Jekyll security considerations:**

- Avoid using `safe: false` in production
- Use `exclude` in `_config.yml` to prevent sensitive files from being published
- Sanitize user-generated content if accepting external input
- Keep Jekyll and plugins updated

```yaml
# _config.yml security settings
exclude:
  - Gemfile
  - Gemfile.lock
  - node_modules
  - vendor
```

### サポートされるMarkdownフレーバー

| Flavor | Support |
|--------|---------|
| Kramdown (default) | 100% |
| CommonMark | Via plugin (jekyll-commonmark) |
| GitHub Flavored Markdown | Via plugin (jekyll-commonmark-ghpages) |
| RedCarpet | Via plugin (deprecated) |

Configure markdown processor in `_config.yml`:

```yaml
markdown: kramdown
kramdown:
  input: GFM
  syntax_highlighter: rouge
```

### トラブルシューティング

| Issue | Solution |
|-------|----------|
| Ruby 3.0+ fails to serve | Run `bundle add webrick` |
| Gem dependency errors | Run `bundle install` |
| Slow builds | Use `--incremental` flag |
| Liquid syntax errors | Check for unescaped `{` in content |
| Plugin not loading | Add to `_config.yml` plugins list |

## [`hugo`](references/hugo.md)を使う

### Prerequisites

- Hugo installed (download from <https://gohugo.io/installation/>)
- Git (recommended for themes and modules)
- Go (optional, for Hugo Modules)

### 簡易変換方法

#### 方法1: 新しいサイトを作成

```bash
# Create a new Hugo site
hugo new site mysite

# Change to site directory
cd mysite

# Add a theme
git init
git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke themes/ananke
echo "theme = 'ananke'" >> hugo.toml

# Create content
hugo new content posts/my-first-post.md

# Start development server
hugo server -D
```

#### 方法2: 静的サイトをビルド

```bash
# Build site to public directory
hugo

# Build with minification
hugo --minify

# Build for specific environment
hugo --environment production
```

#### 方法3: 開発サーバー

```bash
# Start server with drafts
hugo server -D

# Start with live reload and bind to all interfaces
hugo server --bind 0.0.0.0 --baseURL http://localhost:1313/

# Start with specific port
hugo server --port 8080
```

### CLI構成

| Command | Description |
|---------|-------------|
| `hugo new site <name>` | Create new Hugo site |
| `hugo new content <path>` | Create new content file |
| `hugo` | Build site to `public` directory |
| `hugo server` | Start development server |
| `hugo mod init` | Initialize Hugo Modules |

| Build Options | Description |
|---------------|-------------|
| `-D, --buildDrafts` | Include draft content |
| `-E, --buildExpired` | Include expired content |
| `-F, --buildFuture` | Include future-dated content |
| `--minify` | Minify output |
| `--gc` | Run garbage collection after build |
| `-d, --destination <path>` | Output directory |

| Server Options | Description |
|----------------|-------------|
| `--bind <ip>` | Interface to bind to |
| `-p, --port <port>` | Port number (default: 1313) |
| `--liveReloadPort <port>` | Live reload port |
| `--disableLiveReload` | Disable live reload |
| `--navigateToChanged` | Navigate to changed content |

### セキュリティ警告

⚠️ **Hugo security considerations:**

- Configure security policy in `hugo.toml` for external commands
- Use `--enableGitInfo` carefully with public repositories
- Validate shortcode parameters for user-generated content

```toml
# hugo.toml security settings
[security]
  enableInlineShortcodes = false
  [security.exec]
    allow = ['^go$', '^npx$', '^postcss$']
  [security.funcs]
    getenv = ['^HUGO_', '^CI$']
  [security.http]
    methods = ['(?i)GET|POST']
    urls = ['.*']
```

### サポートされるMarkdownフレーバー

| Flavor | Support |
|--------|---------|
| Goldmark (default) | 100% (CommonMark compliant) |
| GitHub Flavored Markdown | Full (tables, strikethrough, autolinks) |
| CommonMark | 100% |
| Blackfriday (legacy) | Deprecated, not recommended |

Configure markdown in `hugo.toml`:

```toml
[markup]
  [markup.goldmark]
    [markup.goldmark.extensions]
      definitionList = true
      footnote = true
      linkify = true
      strikethrough = true
      table = true
      taskList = true
    [markup.goldmark.renderer]
      unsafe = false  # Set true to allow raw HTML
```

### トラブルシューティング

| Issue | Solution |
|-------|----------|
| "Page not found" on paths | Check `baseURL` in config |
| Theme not loading | Verify theme in `themes/` or Hugo Modules |
| Slow builds | Use `--templateMetrics` to identify bottlenecks |
| Raw HTML not rendering | Set `unsafe = true` in goldmark config |
| Images not loading | Check `static/` folder structure |
| Module errors | Run `hugo mod tidy` |

## 参照

### Markdownの記述とスタイル

- [basic-markdown.md](references/basic-markdown.md)
- [code-blocks.md](references/code-blocks.md)
- [collapsed-sections.md](references/collapsed-sections.md)
- [tables.md](references/tables.md)
- [writing-mathematical-expressions.md](references/writing-mathematical-expressions.md)
- Markdown Guide: <https://www.markdownguide.org/basic-syntax/>
- Styling Markdown: <https://github.com/sindresorhus/github-markdown-css>

### [`markedJS/marked`](references/marked.md)

- 公式ドキュメント: <https://marked.js.org/>
- 高度なオプション: <https://marked.js.org/using_advanced>
- 拡張性: <https://marked.js.org/using_pro>
- GitHubリポジトリ: <https://github.com/markedjs/marked>

### [`pandoc`](references/pandoc.md)

- Getting started: <https://pandoc.org/getting-started.html>
- Official documentation: <https://pandoc.org/MANUAL.html>
- Extensibility: <https://pandoc.org/extras.html>
- GitHub repository: <https://github.com/jgm/pandoc>

### [`gomarkdown/markdown`](references/gomarkdown.md)

- Official documentation: <https://pkg.go.dev/github.com/gomarkdown/markdown>
- Advanced configuration: <https://pkg.go.dev/github.com/gomarkdown/markdown@v0.0.0-20250810172220-2e2c11897d1a/html>
- Markdown processing: <https://blog.kowalczyk.info/article/cxn3/advanced-markdown-processing-in-go.html>
- GitHub repository: <https://github.com/gomarkdown/markdown>

### [`jekyll`](references/jekyll.md)

- Official documentation: <https://jekyllrb.com/docs/>
- Configuration options: <https://jekyllrb.com/docs/configuration/options/>
- Plugins: <https://jekyllrb.com/docs/plugins/>
  - [Installation](https://jekyllrb.com/docs/plugins/installation/)
  - [Generators](https://jekyllrb.com/docs/plugins/generators/)
  - [Converters](https://jekyllrb.com/docs/plugins/converters/)
  - [Commands](https://jekyllrb.com/docs/plugins/commands/)
  - [Tags](https://jekyllrb.com/docs/plugins/tags/)
  - [Filters](https://jekyllrb.com/docs/plugins/filters/)
  - [Hooks](https://jekyllrb.com/docs/plugins/hooks/)
- GitHub repository: <https://github.com/jekyll/jekyll>

### [`hugo`](references/hugo.md)

- Official documentation: <https://gohugo.io/documentation/>
- All Settings: <https://gohugo.io/configuration/all/>
- Editor Plugins: <https://gohugo.io/tools/editors/>
- GitHub repository: <https://github.com/gohugoio/hugo>
