// src/lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Question, ExamResult } from '../types';

/**
 * Tailwind 클래스 병합 함수 (ReadyScreen 등에서 필수)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 시험 결과를 계산하는 함수 (questionNo 기반 채점)
 */
// src/lib/utils.ts (전면 수정)
export function calculateResult(questions: Question[], answers: Record<string | number, number>): ExamResult {
  let correctCount = 0;
  const totalQuestions = questions.length;
  const subjectMap: Record<string, { correct: number; total: number }> = {};
  const wrongQuestions: Question[] = []; // 틀린 문제를 담을 바구니

  questions.forEach((q) => {
    if (!subjectMap[q.subject]) {
      subjectMap[q.subject] = { correct: 0, total: 0 };
    }
    subjectMap[q.subject].total += 1;

    const userAnswer = answers[q.id]; // q.id로 사용자의 답을 찾음
    const dbAnswer = Number(q.answer);
    const isCorrect = userAnswer !== undefined && (Number(userAnswer) + 1) === dbAnswer;

    if (isCorrect) {
      correctCount++;
      subjectMap[q.subject].correct += 1;
    } else {
      // 틀린 문제거나 답을 안 한 문제라면 오답 리스트에 추가
      wrongQuestions.push(q);
    }
  });

  const finalScore = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  return {
    totalScore: finalScore,
    totalQuestions,
    correctCount,
    passed: finalScore >= 60,
    wrongQuestions, // ★ 이 데이터를 넘겨줘야 오답 노트에 뜹니다!
    subjectScores: Object.entries(subjectMap).map(([subject, stats]) => ({
      subject,
      score: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      total: stats.total,
      correct: stats.correct,
    })),
  };
}

/**
 * 초 단위 시간을 00:00 형식으로 변환
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}