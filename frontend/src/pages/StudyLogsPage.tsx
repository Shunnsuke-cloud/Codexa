import React, { useEffect, useState } from 'react';
import { getLogs, createLog, updateLog, deleteLog } from '../services/studyService';
import type { StudyLog, StudyLogRequest } from '../types/study';
import StudyLogCard from '../components/StudyLogCard';
import { getGithubRepos, getGithubStatus, getGithubCommits } from '../services/reportsService';

type GithubRepo = {
  name: string;
  fullName: string;
  htmlUrl: string;
  description?: string;
  pushedAt?: string;
  private?: boolean;
};

type GithubCommit = {
  sha: string;
  message: string;
  htmlUrl: string;
  authorName: string;
  date: string;
};

export default function StudyLogsPage() {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StudyLog | null>(null);
  const [form, setForm] = useState<StudyLogRequest>({ title: '', content: '', studyTime: 1, technology: '', githubRepoFullName: null, githubRepoUrl: null });
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [reposLoading, setReposLoading] = useState(false);
  const [repoFilter, setRepoFilter] = useState('all');
  const [selectedRepoCommits, setSelectedRepoCommits] = useState<GithubCommit[]>([]);
  const [selectedRepoCommitLoading, setSelectedRepoCommitLoading] = useState(false);
  const [selectedRepoCommitError, setSelectedRepoCommitError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getLogs();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    (async () => {
      try {
        const status = await getGithubStatus();
        setGithubConnected(!!status?.connected);
        if (status?.connected) {
          setReposLoading(true);
          try {
            const data = await getGithubRepos();
            setRepos(data.repos || []);
          } finally {
            setReposLoading(false);
          }
        } else {
          setRepos([]);
        }
      } catch (error) {
        setGithubConnected(false);
        setRepos([]);
      }
    })();
  }, []);

  function resetForm() {
    setEditing(null);
    setForm({ title: '', content: '', studyTime: 1, technology: '', githubRepoFullName: null, githubRepoUrl: null });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await updateLog(editing.id, form);
    } else {
      await createLog(form);
    }
    await load();
    // notify dashboard to refresh aggregates
    try { window.dispatchEvent(new CustomEvent('dashboard:refresh')); } catch (e) { /* ignore */ }
    resetForm();
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this log?')) return;
    await deleteLog(id);
    await load();
    try { window.dispatchEvent(new CustomEvent('dashboard:refresh')); } catch (e) { /* ignore */ }
  }

  function handleEdit(log: StudyLog) {
    setEditing(log);
    setForm({
      title: log.title,
      content: log.content,
      studyTime: log.studyTime,
      technology: log.technology,
      githubRepoFullName: log.githubRepoFullName || null,
      githubRepoUrl: log.githubRepoUrl || null,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function loadRepoCommits(repoFullName: string) {
    if (!repoFullName || !githubConnected) {
      setSelectedRepoCommits([]);
      return;
    }

    setSelectedRepoCommitLoading(true);
    setSelectedRepoCommitError(null);
    try {
      const data = await getGithubCommits(repoFullName);
      setSelectedRepoCommits(data.commits || []);
    } catch (error: any) {
      setSelectedRepoCommits([]);
      setSelectedRepoCommitError('コミット一覧の取得に失敗しました');
    } finally {
      setSelectedRepoCommitLoading(false);
    }
  }

  function appendCommitToContent(commit: GithubCommit) {
    const chunk = `\n\n[GitHub] ${commit.message}\n${commit.htmlUrl}`;
    setForm(prev => ({
      ...prev,
      content: prev.content ? `${prev.content}${chunk}` : chunk.trimStart(),
    }));
  }

  const filteredLogs = logs.filter(log => {
    if (repoFilter === 'all') return true;
    if (repoFilter === 'unlinked') return !log.githubRepoFullName;
    return log.githubRepoFullName === repoFilter;
  });

  const repoOptions = Array.from(new Set(logs.map(log => log.githubRepoFullName).filter((value): value is string => !!value)));

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold">{editing ? 'Edit Study Log' : 'New Study Log'}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="p-2 rounded bg-white/3" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input className="p-2 rounded bg-white/3" placeholder="Technology" value={form.technology} onChange={e => setForm({ ...form, technology: e.target.value })} required />
          <textarea className="col-span-2 p-2 rounded bg-white/3" placeholder="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
          <input type="number" min={1} className="p-2 rounded bg-white/3" value={form.studyTime} onChange={e => setForm({ ...form, studyTime: Number(e.target.value) })} required />
          <div className="col-span-2 rounded-xl border border-white/10 bg-slate-950/30 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">GitHub リポジトリ連携</p>
                <p className="text-xs text-slate-400">連携済みの GitHub リポジトリをこの学習ログに紐づけます。</p>
              </div>
              {githubConnected ? (
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">Connected</span>
              ) : (
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-slate-300">Not connected</span>
              )}
            </div>
            <select
              className="w-full rounded bg-white/5 p-2 text-sm"
              value={form.githubRepoFullName || ''}
              onChange={e => {
                const selected = repos.find(repo => repo.fullName === e.target.value);
                setForm({
                  ...form,
                  githubRepoFullName: selected?.fullName || null,
                  githubRepoUrl: selected?.htmlUrl || null,
                });
                if (selected?.fullName) {
                  loadRepoCommits(selected.fullName);
                } else {
                  setSelectedRepoCommits([]);
                }
              }}
              disabled={!githubConnected || reposLoading}
            >
              <option value="">リポジトリを選択しない</option>
              {repos.map(repo => (
                <option key={repo.fullName} value={repo.fullName}>
                  {repo.fullName}
                </option>
              ))}
            </select>
            {reposLoading ? <p className="mt-2 text-xs text-slate-400">リポジトリ一覧を取得中...</p> : null}
            {form.githubRepoFullName ? <p className="mt-2 text-xs text-cyan-200">選択中: {form.githubRepoFullName}</p> : null}
          </div>

          {form.githubRepoFullName && (
            <div className="col-span-2 rounded-xl border border-white/10 bg-slate-950/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">最新コミット</p>
                  <p className="text-xs text-slate-400">選択中のリポジトリの直近コミットを本文に転用できます。</p>
                </div>
                <button
                  type="button"
                  className="rounded bg-white/10 px-3 py-2 text-xs font-semibold text-white"
                  onClick={() => loadRepoCommits(form.githubRepoFullName || '')}
                >
                  {selectedRepoCommitLoading ? '取得中...' : '再取得'}
                </button>
              </div>
              {selectedRepoCommitError ? <p className="mt-2 text-xs text-rose-300">{selectedRepoCommitError}</p> : null}
              {selectedRepoCommits.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {selectedRepoCommits.map(commit => (
                    <li key={commit.sha} className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-white">{commit.message}</p>
                          <p className="mt-1 text-xs text-slate-400">{commit.authorName || 'unknown'} · {commit.date ? new Date(commit.date).toLocaleString() : ''}</p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <a href={commit.htmlUrl} target="_blank" rel="noreferrer" className="rounded border border-cyan-400/30 px-2 py-1 text-xs text-cyan-200">
                            開く
                          </a>
                          <button
                            type="button"
                            className="rounded bg-cyan-500 px-2 py-1 text-xs font-semibold text-slate-900"
                            onClick={() => appendCommitToContent(commit)}
                          >
                            本文に追加
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : selectedRepoCommitLoading ? (
                <p className="mt-2 text-xs text-slate-400">コミットを読み込み中...</p>
              ) : (
                <p className="mt-2 text-xs text-slate-400">コミットがありません。</p>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <button className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900">{editing ? 'Update' : 'Create'}</button>
          <button type="button" className="rounded bg-white/5 px-4 py-2 text-sm" onClick={resetForm}>Cancel</button>
        </div>
      </form>

      <section>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Your Study Logs</h3>
            <p className="mt-1 text-xs text-slate-400">{filteredLogs.length} 件表示中 / 全 {logs.length} 件</p>
          </div>
          <div className="min-w-[240px]">
            <label className="mb-1 block text-xs text-slate-400">GitHub リポジトリで絞り込み</label>
            <select
              className="w-full rounded bg-white/5 p-2 text-sm"
              value={repoFilter}
              onChange={e => setRepoFilter(e.target.value)}
            >
              <option value="all">すべてのログ</option>
              <option value="unlinked">GitHub 未連携のみ</option>
              {repoOptions.map(repoName => (
                <option key={repoName} value={repoName}>{repoName}</option>
              ))}
            </select>
          </div>
        </div>
        {loading ? <p>Loading...</p> : (
          <div className="grid gap-4 sm:grid-cols-2">
            {filteredLogs.length === 0 ? <p className="text-sm text-slate-400">No logs yet.</p> : filteredLogs.map(log => (
              <StudyLogCard key={log.id} log={log} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
