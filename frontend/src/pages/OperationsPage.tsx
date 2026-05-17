import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
  import { useState } from 'react';
  import { postGithubPoll, getGithubHistory, getWeeklyReport, getGithubStatus, getGithubRepos } from '../services/reportsService';

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
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm">
            <h3 className="font-semibold">GitHub 連携（Operations）</h3>
            <p className="mt-2 text-sm text-slate-300">リポジトリ情報を手動でポーリングして同期します。</p>
            {!user ? (
              <p className="mt-3 text-sm text-slate-400">同期はログイン後に利用できます。<Link to="/login" className="text-cyan-300 underline ml-2">Sign In</Link></p>
            ) : (
              <GithubOperations />
            )}
          </div>
      </div>
    </div>
  );
}

function GithubOperations() {
  const [syncing, setSyncing] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<{ date: string; totalTime: number }[] | null>(null);
  const [history, setHistory] = useState<any[] | null>(null);
  const [connected, setConnected] = useState(false);
  const [githubLogin, setGithubLogin] = useState<string | null>(null);
  const [connectedAt, setConnectedAt] = useState<string | null>(null);
  const [repos, setRepos] = useState<{ name: string; fullName: string; htmlUrl: string; description?: string; pushedAt?: string; private?: boolean }[] | null>(null);
  const [reposLoading, setReposLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      // show success message if redirected from OAuth
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('github_connected') === '1') {
          setNotice('GitHub 連携が完了しました');
          // remove the query param to clean URL
          const url = new URL(window.location.href);
          url.searchParams.delete('github_connected');
          window.history.replaceState({}, document.title, url.toString());
        }
      } catch (e) {}

      // fetch connection status only when auth token exists
      try {
        const token = localStorage.getItem('codexa_token');
        if (token) {
          const st = await getGithubStatus();
          setConnected(!!st?.connected);
          setGithubLogin(st?.githubLogin || null);
          setConnectedAt(st?.createdAt || null);
        } else {
          setConnected(false);
          setGithubLogin(null);
          setConnectedAt(null);
          setRepos(null);
        }
      } catch (e) {
        setConnected(false);
        setGithubLogin(null);
        setConnectedAt(null);
        setRepos(null);
      }
    })();
  }, []);

  return (
    <div>
      <div className="mt-3 flex gap-2">
        {!connected && (
          <button onClick={async () => {
            const token = localStorage.getItem('codexa_token');
            if (!token) { window.location.href = '/login'; return; }
            try {
              const r = await fetch((import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '/api/github/oauth/start', { headers: { Authorization: `Bearer ${token}` } });
              const data = await r.json();
              if (data?.url) window.location.href = data.url;
            } catch (e) {
              // ignore
            }
          }} className="rounded bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-900">Connect GitHub</button>
        )}
        {connected && (
          <div className="rounded-2xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50 shadow-[0_0_0_1px_rgba(16,185,129,0.08),0_12px_30px_rgba(16,185,129,0.12)]">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200">
                Connected
              </span>
              <span className="text-base font-semibold text-white">GitHub 連携済み</span>
            </div>
            <div className="mt-2 text-base font-semibold text-white">
              {githubLogin ? `@${githubLogin}` : 'GitHub アカウント情報を取得中'}
            </div>
            <div className="mt-1 text-xs text-emerald-200/90">
              {connectedAt ? `連携日時: ${new Date(connectedAt).toLocaleString()}` : '連携日時を取得中'}
            </div>
          </div>
        )}
        <button onClick={async () => {
          setSyncing(true);
          try {
            await postGithubPoll();
            const h = await getGithubHistory();
            setHistory(h);
          } catch (e) {
            // ignore
          } finally { setSyncing(false); }
        }} className="rounded bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900">{syncing ? '同期中...' : 'GitHub 同期'}</button>
        <button onClick={async () => { const r = await getWeeklyReport(); setWeeklyReport(r.days); }} className="rounded border px-3 py-2 text-sm">週間取得</button>
        <button onClick={async () => { const h = await getGithubHistory(); setHistory(h); }} className="rounded border px-3 py-2 text-sm">履歴取得</button>
      </div>

      {connected && (
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-white">最近の GitHub リポジトリ</h4>
              <p className="mt-1 text-xs text-slate-400">連携済みアカウントの更新順リポジトリを表示します。</p>
            </div>
            <button
              onClick={async () => {
                setReposLoading(true);
                try {
                  const data = await getGithubRepos();
                  setRepos(data.repos || []);
                } finally {
                  setReposLoading(false);
                }
              }}
              className="rounded bg-white/10 px-3 py-2 text-xs font-semibold text-white"
            >
              {reposLoading ? '取得中...' : '一覧を取得'}
            </button>
          </div>

          {repos && (
            <ul className="mt-3 space-y-2 text-sm">
              {repos.length === 0 ? (
                <li className="text-slate-400">リポジトリが見つかりませんでした。</li>
              ) : (
                repos.map((repo) => (
                  <li key={repo.fullName} className="rounded-xl border border-white/10 bg-slate-950/40 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-white">
                          {repo.fullName}
                          {repo.private ? <span className="ml-2 rounded-full bg-amber-400/20 px-2 py-0.5 text-[11px] text-amber-200">private</span> : null}
                        </div>
                        {repo.description ? <div className="mt-1 text-xs text-slate-400">{repo.description}</div> : null}
                        {repo.pushedAt ? <div className="mt-1 text-[11px] text-slate-500">更新: {new Date(repo.pushedAt).toLocaleString()}</div> : null}
                      </div>
                      <a href={repo.htmlUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-cyan-400/30 px-3 py-1.5 text-xs font-semibold text-cyan-200 hover:bg-cyan-400/10">
                        開く
                      </a>
                    </div>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      )}

      {weeklyReport && (
        <ul className="mt-3 text-sm text-slate-300">
          {weeklyReport.map(d => (
            <li key={d.date} className="flex justify-between">{d.date}<span className="text-slate-400">{d.totalTime}h</span></li>
          ))}
        </ul>
      )}

      {history && (
        <div className="mt-3 text-sm text-slate-300">
          <h4 className="font-semibold">同期履歴</h4>
          <ul className="mt-2">
            {history.map((h, idx) => (
              <li key={idx} className="flex justify-between">
                <span>{new Date(h.startedAt).toLocaleString()}</span>
                <span className="text-slate-400">{h.status} {h.syncedCount ? `(${h.syncedCount})` : ''}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
