# Codexa

エンジニアやプログラミング学習者向けに、GitHub活動・学習記録・技術成長を可視化する開発ログ管理サービスです。

## 初期構成

- `frontend`: React + TypeScript + Tailwind CSS + Axios + React Router
- `backend`: Spring Boot + Spring Web + Spring Data JPA + Lombok + PostgreSQL Driver
- `postgres`: PostgreSQL 16

## 起動手順

1. `.env.example` を `.env` にコピーして値を確認します。
2. `docker compose up --build` を実行します。
3. フロントエンドは `http://localhost:3000`、バックエンドは `http://localhost:8080` で確認します。

## 次に実装するもの

- JWT 認証
- 学習ログ CRUD
- GitHub API 連携
- 週間レポート
- Contribution 風カレンダー

## 実装済み API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`

JWT は `Authorization: Bearer <token>` で送信します。

## ローカルでの確認手順（手短なガイド）

1. Docker Compose でサービスを起動します（バックグラウンド）。Docker Desktop を先に起動してください。

```bash
docker compose up -d --build
```

2. 動作確認

- フロントエンド（静的コンテンツ）: http://localhost:3000
- バックエンド ヘルスチェック: http://localhost:8080/api/health

ヘルスチェックはコマンドでも確認できます:

```bash
curl http://localhost:8080/api/health
```

3. バックエンドのログをフォローして起動状況を見る

```bash
docker compose logs --follow backend
```

4. バックエンドの単体テストを実行する

（ローカルに Maven がある場合）
```bash
cd backend
mvn test
```

（ローカルに Maven が無い場合は Docker 経由でも実行可能）
```bash
docker compose run --rm backend mvn test
```

5. API を手動で叩いて確認する（認証付き）

- まず登録またはログインして JWT を取得します。

```bash
curl -s -X POST http://localhost:8080/api/auth/login \
	-H 'Content-Type: application/json' \
	-d '{"email":"you@example.com","password":"your_password"}'
```

レスポンスの `token` を取り出したら、`/api/reports/summary` を呼び出します:

```bash
curl http://localhost:8080/api/reports/summary \
	-H "Authorization: Bearer <token>"
```

6. フロント開発サーバーでホットリロードを使いたいとき

```bash
cd frontend
npm install
npm run dev
# ブラウザで表示される URL（例: http://localhost:5173）を確認
```

7. 停止

```bash
docker compose down
```

---

問題が起きたら、まず `docker compose logs backend` でログを確認してください。データベース接続エラーが出る場合は `postgres` コンテナが起動しているか、`5432` ポートの競合や `.env` の設定を確認してください。

必要ならこの README に「トラブルシュート」セクションを追記します。どの項目を追加しますか？
