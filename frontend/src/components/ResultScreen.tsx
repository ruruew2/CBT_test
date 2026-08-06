// ============================================================
// components/ResultScreen.tsx  –  시험 결과 화면
// ============================================================

import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Trophy,
  AlertCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import { cn } from '../lib/utils';
import { ExamResult } from '../types';

interface Props {
  result: ExamResult;
  onReset: () => void;
  onWrongAnswers: () => void;
  onHome: () => void;
}

export default function ResultScreen({ result, onReset, onWrongAnswers, onHome }: Props) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
        <div className="w-20 hidden md:block" />
        <button onClick={onHome} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <LayoutDashboard className="w-6 h-6 text-deep-blue shrink-0" />
          <span className="font-bold text-slate-900">정보처리기사 CBT 시험</span>
        </button>
        <div className="w-20" />
      </header>

      <div className="flex-1 p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cbt-card p-6 md:p-8 lg:p-10 text-center bg-white rounded-2xl shadow-sm border border-slate-200"
          >
            <div
              className={cn(
                'w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6',
                result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              )}
            >
              {result.passed ? <Trophy className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
            </div>

            <h2 className="text-3xl font-bold mb-2">
              {result.passed ? '합격을 축하합니다!' : '아쉽게도 불합격입니다.'}
            </h2>
            <p className="text-slate-500 mb-6 md:mb-8">
              총점: <span className="font-bold text-slate-900">{result.totalScore}점</span> (합격 60점 기준)
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-12 items-center border-t border-slate-100 pt-8">
              <div className="h-[340px] md:h-[380px] w-full flex items-center justify-center overflow-visible">
                <ResponsiveContainer width="100%" height="100%" debounce={300}>
                  <RadarChart
                    cx="50%"
                    cy="50%"
                    outerRadius="86%"
                    data={result.subjectScores}
                  >
                    <PolarGrid stroke="#cbd5e1" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="점수"
                      dataKey="score"
                      stroke="#1A3A5F"
                      fill="#1A3A5F"
                      fillOpacity={0.5}
                      isAnimationActive={true}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4 text-left min-w-0">
                <h3 className="font-semibold text-lg mb-4">과목별 상세 점수</h3>

                {result.subjectScores.map((s) => (
                  <div key={s.subject} className="space-y-1.5">
                    <div className="flex items-start justify-between gap-4 text-sm">
                      <span className="text-slate-800 font-medium break-keep">
                        {s.subject}
                      </span>
                      <span className="font-semibold text-slate-900 shrink-0">
                        {s.score}% ({s.correct}/{s.total})
                      </span>
                    </div>

                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${s.score}%` }}
                        className={cn('h-full', s.score >= 40 ? 'bg-deep-blue' : 'bg-red-400')}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={onReset}
                className="flex-1 cbt-button-secondary flex items-center justify-center gap-2 py-4 border-2 border-slate-300/70 rounded-xl font-bold hover:bg-slate-100"
              >
                <RotateCcw className="w-4 h-4" /> 다시 도전하기
              </button>
              <button
                onClick={onWrongAnswers}
                className="flex-1 bg-deep-blue text-white flex items-center justify-center gap-2 py-4 rounded-xl font-bold hover:bg-opacity-90"
              >
                <BookOpen className="w-4 h-4" /> 오답 노트로 이동
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}