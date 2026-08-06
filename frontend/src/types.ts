export type AppStatus = 'login' | 'signup' | 'ready' | 'testing' | 'finished' | 'mypage' | 'wrong-answers';

export interface Question {
  id: string;
  subject: string;
  questionNo: number;
  questionText: string;
  choices: string[];
  explanations: string[];
  answer: number;
}

// 1. SubjectScore 인터페이스를 밖으로 빼서 정의 (MyPage에서 import 가능하게)
export interface SubjectScore {
  subject: string;
  score: number;   // 백분율 (0~100)
  total: number;   // 과목 총 문제 수
  correct: number; // 과목 맞은 개수
}

export interface ExamResult {
  subjectScores: SubjectScore[]; // 위에서 만든 인터페이스 사용
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  passed: boolean; // 여기는 유지 (MyPage 코드를 수정하는 게 더 깔끔합니다)
  wrongQuestions: Question[]; 
}

export type ExamStatus = 'ready' | 'testing' | 'finished';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface ExamResultRecord {
  id: string;
  userId: string;
  result: ExamResult;
  answers: Record<string | number, number>;
  createdAt: string;
}