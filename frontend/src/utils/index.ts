import { ExamResult, Question } from '../types';

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function calculateResult(
  filteredQuestions: Question[],
  answers: Record<number, number>
): ExamResult {
  const activeSubjects = Array.from(new Set(filteredQuestions.map((q) => q.subject)));
  const subjectScores = activeSubjects.map((subject) => {
    const subjectQuestions = filteredQuestions.filter((q) => q.subject === subject);
    const correctCount = subjectQuestions.filter(
      (q) => answers[q.id] === q.correctAnswer
    ).length;
    return { subject, score: (correctCount / subjectQuestions.length) * 100, total: subjectQuestions.length };
  });
  const totalCorrect = filteredQuestions.filter((q) => answers[q.id] === q.correctAnswer).length;
  const totalScore = (totalCorrect / filteredQuestions.length) * 100;
  return { subjectScores, totalScore, isPassed: totalScore >= 60 };
}