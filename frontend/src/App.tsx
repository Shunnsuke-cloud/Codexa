import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import StudyLogsPage from './pages/StudyLogsPage';
import { getDashboardSummary, getWeeklyReport, postGithubSync } from './services/reportsService';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OperationsPage from './pages/OperationsPage';
import { useAuth } from './hooks/useAuth';

function Shell() {
  const { user, logout } = useAuth();
  const [totalStudy, setTotalStudy] = React.useState<number | null>(null);
  const [studyDays, setStudyDays] = React.useState<number | null>(null);
  const [topTechnologies, setTopTechnologies] = React.useState<Array<{technology:string; totalTime:number; count:number}>>([]);
  const [weeklyReport, setWeeklyReport] = React.useState<{date:string; totalTime:number}[] | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await getDashboardSummary();
        if (!mounted) return;
        setTotalStudy(res.totalStudyTime ?? 0);
        setStudyDays(res.studyDays ?? 0);
        setTopTechnologies(res.topTechnologies ?? []);
      } catch (e) {
        if (!mounted) return;
        setTotalStudy(0);
        setStudyDays(0);
        setTopTechnologies([]);
      }
    }

    // only load when a user is logged in
    if (user) {
      load();
    } else {
      setTotalStudy(null);
      setStudyDays(null);
      setTopTechnologies([]);
    }

    const handler = () => { if (user) load(); };
    window.addEventListener('dashboard:refresh', handler as EventListener);
    return () => { mounted = false; window.removeEventListener('dashboard:refresh', handler as EventListener); };
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Codexa</p>
            <h1 className="text-xl font-semibold">Development Log Dashboard</h1>
          </div>
            <nav className="flex gap-4 items-center text-sm text-slate-300">
              <Link to="/">Home</Link>
              {user ? (
                <>
                  <Link to="/operations" className="ml-2 text-sm text-slate-200">{user.name}</Link>
                  <button onClick={() => logout()} className="ml-2 text-sm text-rose-400">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login">Sign In</Link>
                  <Link to="/register">新規登録</Link>
                </>
              )}
            </nav>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[1.5fr,1fr]">
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-indigo-500/20 p-8 shadow-2xl shadow-cyan-950/30">
            <p className="mb-3 text-sm text-cyan-200">Codexa サーバーの概要</p>
            <h2 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              このサーバーについて
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              この開発用サーバーは以下の機能を提供します：
              認証（JWT ベース）、学習ログの CRUD、ダッシュボード集計、外部サービス連携（例：GitHub）。
              操作系（ログの作成・編集・削除）は別画面の「Operations」から行ってください。
            </p>
            <p className="mt-3 text-sm text-slate-400">バックエンド状態の確認: <a className="text-cyan-300 underline" href="http://localhost:8080/api/health">/api/health</a></p>
            {!user && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/login" className="rounded-full border border-cyan-400/40 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-200">
                  Sign In
                </Link>
                <Link to="/register" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100">
                  新規登録
                </Link>
              </div>
            )}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Total Study</p>
                <p className="mt-2 text-3xl font-semibold">{totalStudy === null ? '—' : `${totalStudy}h`}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Study Days</p>
                <p className="mt-2 text-3xl font-semibold">{studyDays === null ? '—' : studyDays}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Commits</p>
                <p className="mt-2 text-3xl font-semibold">0</p>
              </div>
            </div>
          </section>

          <aside className="grid gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-lg font-semibold">GitHub 連携</h3>
                <p className="mt-3 text-sm text-slate-300">GitHub からリポジトリ情報を同期して、週間レポートの補完等に使います。</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={async () => {
                    setSyncing(true);
                    try { await postGithubSync(); } catch(e) { /* ignore */ } finally { setSyncing(false); }
                  }} className="rounded bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-900">{syncing ? '同期中...' : 'GitHub 同期'}</button>
                  <button onClick={async () => { const r = await getWeeklyReport(); setWeeklyReport(r.days); }} className="rounded border px-3 py-2 text-sm">週間取得</button>
                </div>
                {weeklyReport && (
                  <ul className="mt-3 text-sm text-slate-300">
                    {weeklyReport.map(d => (
                      <li key={d.date} className="flex justify-between">{d.date}<span className="text-slate-400">{d.totalTime}h</span></li>
                    ))}
                  </ul>
                )}
              </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Now Building</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>JWT 認証の導入</li>
                <li>学習ログ CRUD API</li>
                <li>GitHub REST API 連携</li>
                <li>週間レポート集計</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Top Technologies</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {topTechnologies.length === 0 ? (
                  <li className="text-slate-500">—</li>
                ) : (
                  topTechnologies.map(t => (
                    <li key={t.technology} className="flex justify-between">
                      <span>{t.technology}</span>
                      <span className="text-slate-400">{t.totalTime}h</span>
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
              <h3 className="text-lg font-semibold">Backend Status</h3>
              <p className="mt-3 text-sm text-slate-300">Spring Boot API は /api/health から確認できます。</p>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}


export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/logs" element={<StudyLogsPage />} />
      <Route path="/operations" element={<OperationsPage />} />
      <Route path="/*" element={<Shell />} />
    </Routes>
  );
}
