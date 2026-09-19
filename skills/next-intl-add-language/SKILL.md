---
name: next-intl-add-language
description: 'next-intl-add-language に関する作業を支援する Skill です。対象のファイルや設定を確認し、必要な手順、検証方法、注意点を案内します。対象技術の調査、実装、運用、トラブルシューティングに使用します。'
---

This is a guide to add a new language to a Next.js project using next-intl for internationalization,

- For i18n, the application uses next-intl.
- All translations are in the directory `./messages`.
- The UI component is `src/components/language-toggle.tsx`.
- Routing and middleware configuration are handled in:
  - `src/i18n/routing.ts`
  - `src/middleware.ts`

When adding a new language:

- Translate all the content of `en.json` to the new language. The goal is to have all the JSON entries in the new language for a complete translation.
- Add the path in `routing.ts` and `middleware.ts`.
- Add the language to `language-toggle.tsx`.
