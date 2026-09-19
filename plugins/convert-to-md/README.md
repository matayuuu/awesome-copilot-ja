# Convert to Markdown プラグイン

一般的な文書形式を Markdown に変換し、内容を正確に分析、要約、検索、抽出できるようにする Copilot skills のコレクションです。必要なことを Copilot に伝えるだけで、適切な skill が自動的に呼び出され、変換がバックグラウンドで行われます。

## インストール

```bash
copilot plugin install convert-to-md@awesome-copilot
```

## 含まれるもの

This plugin includes Word, Excel, and PDF conversion skills, detailed below.

## Source

This plugin is part of [Awesome Copilot](https://github.com/github/awesome-copilot).

## Skills

### convert-word-to-md

Converts Word (`.docx`) documents to Markdown. Use it any time you want to read, summarize, review, compare, or extract information from a `.docx` file — even if you don't say "convert" explicitly.

> "Summarize this Word document."
> "Extract all the action items from report.docx."
> "Compare these two contracts."

### convert-excel-to-md

Converts Excel (`.xlsx`) workbooks to Markdown, rendering each sheet as a table. Use it any time you want to analyze, query, or summarize data in a spreadsheet — single file or a whole folder at once.

> "What are the top 5 rows by revenue in this spreadsheet?"
> "Summarize all the worksheets in this workbook."
> "Process every Excel file in this folder."

### convert-pdf-to-md

Converts PDF (`.pdf`) documents to Markdown, extracting both text and embedded images. Use it any time you want to read, summarize, or pull data from a PDF report, invoice, paper, or form.

> "Summarize this PDF."
> "Extract all the dates mentioned in this contract."
> "Process all the PDFs in this folder."

## License

MIT
