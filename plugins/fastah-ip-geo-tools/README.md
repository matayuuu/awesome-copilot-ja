# Fastah Inc. の IP Geolocation Tools

RFC 8805 形式の IP 地理位置情報フィードを調整・公開したいネットワーク運用エンジニア向けのプラグインです。地理位置情報の地名を実在する都市へジオコードして精度を高める AI Skill と、関連する MCP server で構成されています。

## インストール

```sh
# Using Copilot CLI
copilot plugin install fastah-ip-geo-tools@awesome-copilot
```

## What's Included

### Skills

| Skill | Description |
|-------|-------------|
| `geofeed-tuner` | Validates, tunes, and improves IP geolocation feeds in CSV format following RFC 8805 with opinionated best practices from real-world deployments. Uses Fastah MCP for tuning data lookup. |

## Prerequisites

- **Python 3** is required for running generated validation and tuning scripts.

## Source

This plugin is part of [Awesome Copilot](https://github.com/github/awesome-copilot), a community-driven collection of GitHub Copilot extensions.

Originally developed at [fastah/ip-geofeed-skills](https://github.com/fastah/ip-geofeed-skills).

## License

Apache-2.0
