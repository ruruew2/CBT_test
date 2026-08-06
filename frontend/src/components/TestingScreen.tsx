// ============================================================
// components/TestingScreen.tsx  –  시험 진행 화면
// ============================================================

import { AnimatePresence, motion } from 'motion/react';
import {
  Timer,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  LayoutDashboard,
  Send,
  X,
  Bell,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Question } from '../types';

interface Props {
  currentQuestion: Question | null;
  currentIndex: number;
  filteredQuestions: Question[];
  answers: Record<string | number, number>; // string(id)도 받을 수 있게 수정
  formattedTime: string;
  showToast: boolean;
  onAnswer: (answerIndex: number) => void; // 인자 하나로 통일
  onNext: () => void;
  onPrev: () => void;
  onFinish: () => void;
  onNavigate: (index: number) => void;
  onExitConfirm: () => void;
  onToastClose: () => void;
}

export default function TestingScreen({
  currentQuestion,
  currentIndex,
  filteredQuestions,
  answers,
  formattedTime,
  showToast,
  onAnswer,
  onNext,
  onPrev,
  onFinish,
  onNavigate,
  onExitConfirm,
  onToastClose,
}: Props) {
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-medium">문제를 불러오는 중입니다...</p>
      </div>
    );
  }

  const selectedAnswer = answers[currentQuestion.id];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-deep-blue text-white flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <button onClick={onExitConfirm} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <LayoutDashboard className="w-6 h-6 shrink-0" />
            <h1 className="font-bold text-base lg:text-lg hidden md:block">정보처리기사 CBT 시험</h1>
          </button>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2 font-mono text-sm md:text-xl bg-deep-blue-dark px-2 md:px-4 py-1 rounded-md border border-white/10 shrink-0">
            <Timer className="w-3.5 h-3.5 md:w-5 h-5 text-blue-300" />
            {formattedTime}
          </div>
          <button
            onClick={onFinish}
            className="bg-red-500 hover:bg-red-600 text-white px-2.5 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 md:gap-2 shrink-0"
          >
            <Send className="w-3.5 h-3.5 md:w-4 h-4" />
            <span>제출</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
          <div className="max-w-3xl mx-auto">
            <div className="mb-8">
              <span className="inline-block bg-blue-50 text-deep-blue px-3 py-1 rounded-full text-xs font-bold mb-4 border border-blue-200">
                {currentQuestion.subject}
              </span>
              <h2 className="text-xl md:text-2xl font-bold leading-relaxed">
                <span className="text-deep-blue mr-3">Q{currentIndex + 1}.</span>
                {currentQuestion.questionText}
              </h2>
            </div>

            <div className="space-y-3 mb-12">
              {currentQuestion.choices?.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => onAnswer(idx)}
                  className={cn(
                    'w-full text-left p-4 md:p-5 border-2 rounded-xl transition-all group flex items-start gap-4 h-auto min-h-[64px]',
                    selectedAnswer === idx
                      ? 'border-deep-blue bg-blue-50/50 shadow-md'
                      : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50'
                  )}
                >
                  <span
                    className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1 transition-colors',
                      selectedAnswer === idx
                        ? 'bg-deep-blue text-white'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                    )}
                  >
                    {idx + 1}
                  </span>

                  <span
                    className={cn(
                      'text-base md:text-lg leading-relaxed break-keep whitespace-normal flex-1',
                      selectedAnswer === idx ? 'text-deep-blue font-medium' : 'text-slate-700'
                    )}
                  >
                    {option}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-slate-200">
              <button
                onClick={onPrev}
                disabled={currentIndex === 0}
                className="px-6 py-2 bg-slate-200 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" /> 이전
              </button>

              <div className="text-slate-400 font-medium">
                <span className="text-slate-600 font-semibold">{currentIndex + 1}</span>
                <span className="mx-1">/</span>
                <span>{filteredQuestions?.length || 0}</span>
              </div>

              <button
                onClick={onNext}
                disabled={currentIndex === (filteredQuestions?.length || 0) - 1}
                className="px-6 py-2 bg-slate-200 text-slate-600 rounded-lg flex items-center gap-2 disabled:opacity-50"
              >
                다음 <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden md:block w-80 lg:w-96 bg-white border-l border-slate-300 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-deep-blue" />
              OMR 답안지
            </h3>
            <span className="text-xs font-medium text-slate-500">
              {Object.keys(answers).length} / {filteredQuestions?.length || 0} 완료
            </span>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {filteredQuestions?.map((q, idx) => {
              const hasAnswer = answers[q.id] !== undefined;
              return (
                <button
                  key={q.id}
                  onClick={() => onNavigate(idx)}
                  className={cn(
                    'h-12 flex flex-col items-center justify-center rounded-lg transition-all border',
                    currentIndex === idx ? 'border-deep-blue ring-2 ring-deep-blue/20' : 'border-transparent',
                    hasAnswer ? 'bg-deep-blue text-white' : 'bg-slate-100 text-slate-500'
                  )}
                >
                  <span className="text-xs font-bold">{idx + 1}</span>
                  {hasAnswer && (
                    <span className="text-[10px] opacity-80 mt-0.5">{answers[q.id] + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>
      </main>

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-50 flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl border border-white/10 min-w-[320px]"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-amber-400 animate-bounce" />
            </div>
            <div>
              <p className="font-bold text-sm">시험 시간이 종료되었습니다</p>
              <p className="text-xs text-slate-400">답안지가 자동으로 제출되었습니다.</p>
            </div>
            <button
              onClick={onToastClose}
              className="ml-auto text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}