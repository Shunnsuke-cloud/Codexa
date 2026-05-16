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
      <p className="mt-3 text-sm text-slate-200">{log.content}</p>
      <p className="mt-3 text-xs text-slate-400">{new Date(log.createdAt).toLocaleString()}</p>
    </div>
  );
}
