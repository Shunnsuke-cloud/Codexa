export interface StudyLog {
  id: number;
  title: string;
  content: string;
  studyTime: number;
  technology: string;
  githubRepoFullName?: string | null;
  githubRepoUrl?: string | null;
  createdAt: string;
}

export interface StudyLogRequest {
  title: string;
  content: string;
  studyTime: number;
  technology: string;
  githubRepoFullName?: string | null;
  githubRepoUrl?: string | null;
}
