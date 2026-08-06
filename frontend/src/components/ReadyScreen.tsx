// ============================================================
// components/ReadyScreen.tsx  –  시험 시작 화면
// ============================================================

import { motion } from 'motion/react';
import { LayoutDashboard, BookOpen, LogIn, LogOut, UserIcon, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AppStatus, User } from '../types';

interface Props {
    user: User | null;
    subjects: string[];
    selectedSubject: string | 'all';
    filteredQuestionsLength: number;
    onStatusChange: (s: AppStatus) => void;
    onSubjectChange: (subject: string | 'all') => void;
    onLogout: () => void;
    onFetchHistory: () => void;
}

export default function ReadyScreen({
    user,
    subjects,
    selectedSubject,
    filteredQuestionsLength,
    onStatusChange,
    onSubjectChange,
    onLogout,
    onFetchHistory,
}: Props) {
    const isAllMode = selectedSubject === 'all';
    const isSubjectMode = selectedSubject !== 'all' && selectedSubject !== '';
    const displayCount = isAllMode ? 100 : filteredQuestionsLength;
    const displayTime = isAllMode ? 150 : 30;

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <header className="h-16 bg-white border-b border-slate-300 flex items-center justify-between px-4 md:px-8">
                <div className="flex-1 md:flex-none md:w-48 hidden md:block" />
                <button
                    onClick={() => onStatusChange('ready')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                    <LayoutDashboard className="w-6 h-6 text-deep-blue shrink-0" />
                    <span className="font-bold text-slate-900 text-sm md:text-base">정보처리기사 CBT 시험</span>
                </button>
                <div className="flex items-center gap-4 flex-1 md:flex-none md:w-65 justify-end">
                    {user ? (
                        <>
                            <button
                                onClick={() => {
                                    onFetchHistory();
                                    onStatusChange('mypage');
                                }}
                                className="text-slate-700 hover:text-deep-blue flex items-center gap-2 text-sm font-semibold"
                            >
                                <UserIcon className="w-4 h-4" /> 마이페이지
                            </button>
                            <button onClick={onLogout} className="text-slate-400 hover:text-red-500">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => onStatusChange('login')}
                            className="text-deep-blue hover:underline text-sm font-bold flex items-center gap-2"
                        >
                            <LogIn className="w-4 h-4" /> 로그인
                        </button>
                    )}
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full cbt-card p-8 text-center"
                >
                    <div className="w-16 h-16 bg-deep-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-8 h-8 text-deep-blue" />
                    </div>

                    <h1 className="text-2xl font-bold mb-2">
                        {user ? `안녕하세요, ${user.name}님!` : '정보처리기사 CBT 시험'}
                    </h1>

                    <div className="text-slate-600 mb-8 whitespace-pre-line text-sm md:text-base">
                        {user
                            ? '준비가 되셨다면 시험을 시작해 주세요.'
                            : '로그인 없이도 시험 응시가 가능합니다.\n(단, 결과는 저장되지 않습니다.)'}
                        <div className="mt-2 font-semibold text-deep-blue bg-blue-100/70 py-2 rounded-lg inline-block px-4">
                            총 {displayCount}문제 / 제한시간 {displayTime}분
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-500 text-left uppercase tracking-wider">
                                시험 모드 선택
                            </label>
                            <button
                                onClick={() => onSubjectChange('all')}
                                className={cn(
                                    'p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between group',
                                    isAllMode
                                        ? 'border-deep-blue bg-blue-50 text-deep-blue'
                                        : 'border-slate-300 hover:border-slate-400 text-slate-600',
                                )}
                            >
                                <div>
                                    <div className="font-bold">전체 랜덤 모드</div>
                                    <div className="text-xs font-semibold opacity-80">
                                        실제 시험과 동일하게 100문항이 출제됩니다.
                                    </div>
                                </div>
                                {isAllMode && <CheckCircle2 className="w-5 h-5" />}
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-slate-500 text-left uppercase tracking-wider">
                                과목별 집중 연습
                            </label>
                            <select
                                value={isAllMode ? '' : selectedSubject}
                                onChange={(e) => onSubjectChange(e.target.value || 'all')}
                                className={cn(
                                    'ready-select w-full p-4 pr-14 rounded-xl border-2 outline-none transition-all',
                                    isSubjectMode
                                        ? 'border-deep-blue bg-blue-50 text-deep-blue font-semibold'
                                        : 'border-slate-400 bg-white text-slate-600 font-medium focus:border-deep-blue',
                                )}
                            >
                                <option value="">과목을 선택하세요</option>
                                {subjects.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={() => onStatusChange('testing')}
                        className="w-full cbt-button-primary py-4 text-lg"
                    >
                        {isAllMode ? '전체 시험 시작' : `${selectedSubject} 시작`}
                    </button>
                </motion.div>
            </main>
        </div>
    );
}
