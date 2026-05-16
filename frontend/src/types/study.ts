export interface StudyLog {
  id: number;
  title: string;
  content: string;
  studyTime: number;
  technology: string;
  createdAt: string;
}

export interface StudyLogRequest {
  title: string;
  content: string;
  studyTime: number;
  technology: string;
}
