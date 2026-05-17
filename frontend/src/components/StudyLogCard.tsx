import React from 'react';
import type { StudyLog } from '../types/study';

export default function StudyLogCard({ log, onEdit, onDelete }: { log: StudyLog; onEdit: (l: StudyLog) => void; onDelete: (id: number) => void }) {
  return (
    <div className="rounded-xl border border-white/8 bg-white/3 p-4">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold">{log.title}</h4>
          <p className="mt-1 text-sm text-slate-300">{log.technology} • {log.studyTime}h</p>
        </div>
        <div className="flex gap-2">
          <button className="text-sm text-cyan-300" onClick={() => onEdit(log)}>Edit</button>
          <button className="text-sm text-rose-400" onClick={() => onDelete(log.id)}>Delete</button>
        </div>
      </div>
      {log.githubRepoFullName && (
        <div className="mt-3 rounded-lg border border-cyan-400/20 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-100">
          <div className="font-semibold text-cyan-200">GitHub リポジトリ</div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <span className="truncate">{log.githubRepoFullName}</span>
            {log.githubRepoUrl ? (
              <a href={log.githubRepoUrl} target="_blank" rel="noreferrer" className="shrink-0 text-cyan-300 underline">
                開く
              </a>
            ) : null}
          </div>
        </div>
      )}
      <p className="mt-3 text-sm text-slate-200">{log.content}</p>
      <p className="mt-3 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
    </div>
  );
}
