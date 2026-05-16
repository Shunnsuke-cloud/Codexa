import { Link, Route, Routes } from 'react-router-dom';

function Shell() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Codexa</p>
            <h1 className="text-xl font-semibold">Development Log Dashboard</h1>
          </div>
          <nav className="flex gap-4 text-sm text-slate-300">
            <Link to="/">Home</Link>
            <a href="http://localhost:8080/api/health">API</a>
          </nav>
        </header>

        <main className="grid flex-1 gap-6 lg:grid-cols-[1.5fr,1fr]">
          <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/20 via-slate-900 to-indigo-500/20 p-8 shadow-2xl shadow-cyan-950/30">
            <p className="mb-3 text-sm text-cyan-200">Progress visibility for engineers and learners</p>
            <h2 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
              学習・GitHub活動・技術成長をひとつに集約する基盤をつくる
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              まずは認証、学習ログ、ダッシュボード、GitHub 連携、週次レポート、ヒートマップを順に積み上げられる最小構成を用意しています。
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                ['Total Study', '0h'],
                ['Study Days', '0'],
                ['Commits', '0'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{label}</p>
                  <p className="mt-2 text-3xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <aside className="grid gap-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold">Now Building</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                <li>JWT 認証の導入</li>
                <li>学習ログ CRUD API</li>
                <li>GitHub REST API 連携</li>
                <li>週間レポート集計</li>
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
      <Route path="/*" element={<Shell />} />
    </Routes>
  );
}
