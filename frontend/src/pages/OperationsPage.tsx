import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function OperationsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-semibold">Operations</h2>
      <p className="mt-3 text-sm text-slate-300">
        {user ? `ログイン中: ${user.name} (${user.email})` : 'ログインして操作してください。'}
      </p>

      <div className="mt-6 grid gap-4">
        <Link to="/logs" className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-sm">学習ログの一覧・作成・編集</Link>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
          追加の管理機能は今後ここに実装します。
        </div>
      </div>
    </div>
  );
}
