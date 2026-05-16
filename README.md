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
