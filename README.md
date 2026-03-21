This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Reborn

Reborn は、作品を読むためだけでなく、作品を寄せ、作品について集い、読みの記録を残していくための文学サイトです。

静かな図書館のような空間を目指し、SNS 的な速度や数値競争ではなく、一つ一つの作品と向き合う時間を大切にする設計で再構築しています。

## 現在の実装状況

現在、このプロジェクトでは以下が動作しています。

- 投稿フォームから作品を送信できる
- 投稿内容を Supabase の `submissions` テーブルに保存できる
- 管理画面で投稿を確認できる
- 管理画面で `保留 / 公開 / 却下 / 削除` ができる
- `published` の作品だけをトップページ・作品一覧・作品詳細に表示できる
- 管理画面はパスワードで保護されている
- 管理画面からログアウトできる

## 使用技術

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vercel
- shadcn/ui

## 主なページ構成

- `/` トップページ
- `/works` 作品一覧
- `/works/[slug]` 作品詳細
- `/submit` 投稿フォーム
- `/about` About
- `/contact` Contact
- `/terms` 利用規約
- `/privacy` プライバシーポリシー
- `/admin/login` 管理画面ログイン
- `/admin/submissions` 投稿管理画面

## ローカル起動方法

まず依存関係をインストールします。

```bash
npm install
```

次に開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで以下を開くと確認できます。

```text
http://localhost:3000
```

## 必要な環境変数

`.env.local` に最低限以下を設定します。

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
ADMIN_PASSWORD=your_admin_password
```

## Supabase 側で必要なこと

少なくとも `submissions` テーブルが必要です。

```sql
create table submissions (
  id bigint generated always as identity primary key,
  pen_name text not null,
  email text not null,
  title text not null,
  category text not null,
  summary text,
  content text not null,
  external_url text,
  allow_read_aloud boolean default false,
  allow_sns_promo boolean default false,
  status text default 'submitted',
  created_at timestamp with time zone default now()
);
```

## 管理画面について

管理画面は公開ナビには表示されません。

直接以下のURLへアクセスします。

```text
/admin/login
/admin/submissions
```

未ログイン時に `/admin/submissions` へアクセスすると、`/admin/login` へリダイレクトされます。

## デプロイについて

GitHub に push すると、Vercel 連携によりデプロイされる想定です。

Vercel 側にも以下の Environment Variables を設定する必要があります。

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ADMIN_PASSWORD`

## 今後の予定

- 管理画面の使い勝手改善
- 読書会機能の設計と実装
- 投稿規約 / プライバシーポリシーの精緻化
- UI / 文言の調整
- 作品と読書記録の整理機能追加