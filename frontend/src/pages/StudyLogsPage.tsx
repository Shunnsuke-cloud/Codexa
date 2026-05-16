import React, { useEffect, useState } from 'react';
import { getLogs, createLog, updateLog, deleteLog } from '../services/studyService';
import type { StudyLog, StudyLogRequest } from '../types/study';
import StudyLogCard from '../components/StudyLogCard';

export default function StudyLogsPage() {
  const [logs, setLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<StudyLog | null>(null);
  const [form, setForm] = useState<StudyLogRequest>({ title: '', content: '', studyTime: 1, technology: '' });

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

  function resetForm() {
    setEditing(null);
    setForm({ title: '', content: '', studyTime: 1, technology: '' });
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
    setForm({ title: log.title, content: log.content, studyTime: log.studyTime, technology: log.technology });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <h3 className="text-lg font-semibold">{editing ? 'Edit Study Log' : 'New Study Log'}</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="p-2 rounded bg-white/3" placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input className="p-2 rounded bg-white/3" placeholder="Technology" value={form.technology} onChange={e => setForm({ ...form, technology: e.target.value })} required />
          <textarea className="col-span-2 p-2 rounded bg-white/3" placeholder="Content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required />
          <input type="number" min={1} className="p-2 rounded bg-white/3" value={form.studyTime} onChange={e => setForm({ ...form, studyTime: Number(e.target.value) })} required />
        </div>
        <div className="mt-4 flex gap-2">
          <button className="rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900">{editing ? 'Update' : 'Create'}</button>
          <button type="button" className="rounded bg-white/5 px-4 py-2 text-sm" onClick={resetForm}>Cancel</button>
        </div>
      </form>

      <section>
        <h3 className="mb-4 text-lg font-semibold">Your Study Logs</h3>
        {loading ? <p>Loading...</p> : (
          <div className="grid gap-4 sm:grid-cols-2">
            {logs.length === 0 ? <p className="text-sm text-slate-400">No logs yet.</p> : logs.map(log => (
              <StudyLogCard key={log.id} log={log} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
