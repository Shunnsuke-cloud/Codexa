# Codexa

Codexa は GitHub 活動や学習記録を統合して可視化する開発ログ管理サービスです。

## 構成 (開発)

- frontend: React + TypeScript + Tailwind
- backend: Spring Boot (Java 21)
- db: PostgreSQL 16

## 必要な環境変数

設定はプロジェクトルートの `.env` で行います。安全のため、実運用ではシークレットは環境変数やシークレットマネージャで管理してください。

- `GITHUB_CLIENT_ID` — GitHub OAuth App の Client ID
- `GITHUB_CLIENT_SECRET` — GitHub OAuth App の Client Secret
- `GITHUB_OAUTH_CALLBACK` — OAuth コールバック URL（例: `http://localhost:8080/api/github/oauth/callback`）
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `JWT_SECRET` — JWT 用の秘密鍵
- `VITE_API_BASE_URL` — フロントが呼ぶバックエンドの URL（開発時は `http://localhost:8080`）

`.env.example` をコピーしてローカルで編集してください。

## クイックスタート

1. `.env.example` をコピーして必要な値を設定します:

```bash
cp .env.example .env
```

2. Docker Compose で起動します (開発用):

```bash
docker compose up -d --build
```

3. アプリケーション確認

- フロントエンド: `http://localhost:3000`
- バックエンド: `http://localhost:8080`

4. 停止

```bash
docker compose down
```

## 開発ワークフロー

- フロントのホットリロードを使う場合:

```bash
cd frontend
npm install
npm run dev
```

- バックエンドのテスト（ローカル Maven がある場合）:

```bash
cd backend
mvn test
```

## 実装済みの主な機能

- ユーザー登録 / ログイン (JWT)
- 学習ログ CRUD
- GitHub OAuth 連携（リポジトリ一覧、コミット取得、同期）

## トラブルシュート（簡易）

- 起動しない場合: `docker compose logs backend` でログを確認してください。
- DB 接続エラー: `postgres` コンテナが正常に起動しているか、`.env` の接続文字列とポートを確認してください。
- フロントが API にアクセスできない場合: ブラウザの DevTools Network でリクエスト先（Origin / Request URL）と CORS エラーを確認してください。

不明点や追加で書いてほしい項目があれば教えてください。
