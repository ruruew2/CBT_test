import { LayoutDashboard, BookOpen, CheckCircle2, X, ChevronLeft, Printer } from 'lucide-react';
import { cn } from '../lib/utils';
import { Question } from '../types';

export default function WrongAnswersScreen({
  viewingRecord,
  allQuestions = [],
  currentAnswers = {},
  user,
  onBack,
  onGoMypage,
  onHome,
}: any) {
  const record = viewingRecord as any;

  const activeAnswers =
    record?.answers ||
    record?.result?.answers ||
    record?.userAnswers ||
    currentAnswers ||
    {};

  const sourceQuestions =
    (record?.questions?.length > 0 ? record.questions : null) ||
    (record?.result?.questions?.length > 0 ? record.result.questions : null) ||
    allQuestions ||
    [];

  const getOnlyWrongQuestions = (): Question[] => {
    if (record?.wrongQuestions && Array.isArray(record.wrongQuestions) && record.wrongQuestions.length > 0) {
      return record.wrongQuestions;
    }

    if (!sourceQuestions || sourceQuestions.length === 0) return [];

    return sourceQuestions.filter((q: any) => {
      const uAns = activeAnswers[q.id] ?? activeAnswers[String(q.id)] ?? activeAnswers[`question-${q.id}`];

      if (uAns === undefined || uAns === null) return false;

      const userSelection = Number(uAns);
      const correctAnswer = Number(q.answer);

      return (userSelection + 1) !== correctAnswer;
    });
  };

  const wrongQuestions = getOnlyWrongQuestions();

  console.log('확인된 소스 문제 수:', sourceQuestions.length);
  console.log('필터링된 오답 리스트:', wrongQuestions);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 bg-white border-b border-slate-300 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
        <div className="w-20 hidden md:block" />
        <button
          onClick={onHome}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <LayoutDashboard className="w-6 h-6 text-deep-blue shrink-0" />
          <span className="font-bold text-slate-900 text-lg">정보처리기사 CBT</span>
        </button>
        <div className="w-20" />
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="뒤로 가기"
            >
              <ChevronLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
              <BookOpen className="w-7 h-7 text-red-500" /> 오답 노트
            </h2>
          </div>

          {user && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-200 transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                프린트
              </button>
              <button
                onClick={onGoMypage}
                className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-200 transition-all"
              >
                마이페이지로
              </button>
            </div>
          )}
        </div>

        {wrongQuestions.length === 0 ? (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-slate-200 shadow-sm">
            <div className="text-5xl mb-4">✨</div>
            <p className="text-xl font-bold text-slate-700 mb-2">기록된 오답이 없습니다!</p>
            <p className="text-slate-400">모든 문제를 맞히셨거나 데이터를 불러오는 중입니다.</p>
          </div>
        ) : (
          <div className="space-y-8 pb-20">
            {wrongQuestions.map((q: any, idx: number) => {
              const uAns = activeAnswers[q.id] ?? activeAnswers[String(q.id)] ?? activeAnswers[`question-${q.id}`];

              return (
                <div
                  key={`wrong-card-${q.id}-${idx}`}
                  className="bg-white rounded-3xl p-6 md:p-10 shadow-md border border-slate-100"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      WRONG
                    </span>
                    <span className="text-slate-400 text-xs font-bold">{q.subject}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-8 leading-snug text-slate-800">
                    <span className="text-red-500 mr-2">Q.</span>
                    {q.questionText}
                  </h3>

                  <div className="grid gap-3">
                    {q.choices?.map((opt: string, oIdx: number) => {
                      const isCorrect = (oIdx + 1) === Number(q.answer);
                      const isUserChoice = oIdx === Number(uAns);

                      return (
                        <div
                          key={`opt-${q.id}-${oIdx}`}
                          className={cn(
                            'group p-5 rounded-2xl border-2 text-[15px] flex items-start gap-4 transition-all duration-200',
                            isCorrect
                              ? 'border-green-500 bg-green-50/50 text-green-800 font-semibold'
                              : isUserChoice
                                ? 'border-red-400 bg-red-50 text-red-700'
                                : 'border-slate-200 bg-slate-50/50 text-slate-600'
                          )}
                        >
                          <div
                            className={cn(
                              'w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-sm',
                              isCorrect
                                ? 'bg-green-500 text-white'
                                : isUserChoice
                                  ? 'bg-red-500 text-white'
                                  : 'bg-white text-slate-500 border border-slate-300'
                            )}
                          >
                            {oIdx + 1}
                          </div>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                          {isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 self-center" />}
                          {isUserChoice && !isCorrect && <X className="w-5 h-5 text-red-500 shrink-0 self-center" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanations?.[0] && (
                    <div className="mt-10 p-6 bg-blue-50/50 rounded-2xl border border-blue-100/50 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                      <h4 className="text-blue-700 font-black text-xs mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                        EXPLANATION
                      </h4>
                      <p
                        className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap"
                        style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
                      >
                        {q.explanations[0]
                          .replace(/ - /g, ' ')
                          .replace(/\. /g, '.\n')
                          .replace(/다\. /g, '다.\n')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}