// ============================================================
// types/index.ts  –  앱 전역 타입 정의
// ============================================================

export interface Question {
  id: number;
  subject: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface User {
  name: string;
  email: string;
}

export interface SubjectScore {
  subject: string;
  score: number;
  total: number;
}

export interface ExamResult {
  totalScore: number;
  totalQuestions: number;
  correctCount: number;
  passed: boolean;
  subjectScores: any[]; 
  wrongQuestions: Question[]; // ★ 추가됨
}

export interface ExamResultRecord {
  id: string;
  date: string;
  score: number;
  answers: Record<string | number, number>;
  wrongQuestions: Question[]; // ★ 이 줄을 추가해야 viewingRecord 에러가 사라집니다!
}


export type ExamStatus = 'ready' | 'testing' | 'finished';
export type AppStatus = ExamStatus | 'login' | 'signup' | 'mypage' | 'wrong-answers';
