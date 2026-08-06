import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    BarChart3,
    History,
    UserIcon,
    BookOpen,
    Lightbulb,
    LogOut,
    Settings,
    X,
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { AppStatus, ExamResultRecord, SubjectScore, User } from '../types';
import { SUBJECT_TIPS, DEFAULT_TIPS } from '../constants/tips';
import { API_BASE_URL } from '../config';

interface Props {
    user: User | null;
    history: ExamResultRecord[];
    cumulativeScores: SubjectScore[];
    weakestSubject: SubjectScore | null;
    onStatusChange: (s: AppStatus) => void;
    onViewRecord: (record: ExamResultRecord) => void;
    onLogout: () => void;
}

export default function MyPageScreen({
    user,
    history,
    cumulativeScores,
    weakestSubject,
    onStatusChange,
    onViewRecord,
    onLogout,
}: Props) {
    const [name, setName] = useState(user?.name || '');
    const [password, setPassword] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    const uniqueScores = useMemo(() => {
        if (!cumulativeScores) return [];
        return cumulativeScores.reduce((acc: SubjectScore[], current) => {
            const isExist = acc.find((item) => item.subject === current.subject);
            if (!isExist) {
                return acc.concat([current]);
            }
            return acc;
        }, []);
    }, [cumulativeScores]);

    const tips = weakestSubject ? (SUBJECT_TIPS[weakestSubject.subject] ?? DEFAULT_TIPS) : DEFAULT_TIPS;

    const totalPages = Math.max(1, Math.ceil(history.length / ITEMS_PER_PAGE));

    const paginatedHistory = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return history.slice(startIndex, endIndex);
    }, [history, currentPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;

        setIsUpdating(true);
        try {
            const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: name,
                    ...(password && { password }),
                }),
            });

            if (response.ok) {
                alert('정보가 성공적으로 수정되었습니다! 다시 로그인 해주세요.');
                setIsEditModalOpen(false);
                onLogout();
            } else {
                const errorData = await response.json();
                alert(errorData.detail || '수정에 실패했습니다.');
            }
        } catch (e) {
            console.error('업데이트 에러:', e);
            alert('서버 연결에 실패했습니다.');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="h-16 bg-white border-b border-slate-300 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
                <button
                    onClick={() => onStatusChange('ready')}
                    className="flex items-center gap-2 font-bold text-slate-900 hover:text-deep-blue transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" /> 마이페이지
                </button>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-700 hover:bg-slate-200 hover:text-deep-blue transition-all text-sm font-bold"
                    >
                        <Settings className="w-4 h-4" />
                        <span className="hidden sm:inline">정보 수정</span>
                    </button>
                    <button
                        onClick={() => {
                            if (window.confirm('정말 로그아웃 하시겠습니까?')) {
                                onLogout();
                            }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-100/60 transition-all text-sm font-semibold"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>로그아웃</span>
                    </button>
                </div>
            </header>

            <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 space-y-8">
                <section className="pt-12 pb-4 border-b border-slate-300">
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                            {user?.name}님,
                            <br className="md:hidden" /> 복습하러 오셨군요!
                        </h2>
                        <p className="text-slate-500 text-base md:text-lg leading-relaxed">
                            오늘도 합격을 향해 한 걸음 더 나아가 볼까요?
                        </p>
                    </div>
                </section>

                <div className="space-y-8">
                    <section className="cbt-card p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-deep-blue" /> 취약 과목 분석
                            </h2>
                            <p className="text-sm text-slate-600 font-medium mt-2">
                                그래프가 중심과 가까울수록 더 많은 공부가 필요한 과목이에요. (
                                <span className="text-red-500 font-bold">빨간색</span>: 60% 미만 취약)
                            </p>
                        </div>

                        {uniqueScores.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                    <div className="w-full h-[320px] min-h-[320px]" style={{ minWidth: 0 }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={uniqueScores}>
                                                <PolarGrid stroke="#cbd5e1" strokeWidth={1.2} />
                                                <PolarAngleAxis
                                                    dataKey="subject"
                                                    tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                                                />
                                                <PolarRadiusAxis
                                                    angle={30}
                                                    domain={[0, 100]}
                                                    tick={false}
                                                    axisLine={false}
                                                />
                                                <Radar
                                                    name="누적 정답률"
                                                    dataKey="score"
                                                    stroke="#1A3A5F"
                                                    fill="#1A3A5F"
                                                    fillOpacity={0.5}
                                                />
                                            </RadarChart>
                                        </ResponsiveContainer>
                                    </div>

                                    <div className="space-y-3">
                                        {uniqueScores.map((s) => (
                                            <div key={s.subject} className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-slate-700 font-semibold truncate mr-2">
                                                        {s.subject}
                                                    </span>
                                                    <span className="font-bold">{s.score.toFixed(0)}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${s.score}%` }}
                                                        className={cn(
                                                            'h-full',
                                                            s.score >= 60 ? 'bg-deep-blue' : 'bg-red-400',
                                                        )}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-2xl">
                                    <h3 className="font-bold mb-3 flex items-center gap-2 text-sm">
                                        <Lightbulb className="w-4 h-4 text-amber-400" />
                                        {weakestSubject ? `${weakestSubject.subject} 집중 공략 팁` : '오늘의 학습 팁'}
                                    </h3>
                                    <ul className="space-y-2">
                                        {tips.map((tip, i) => (
                                            <li key={i} className="text-xs text-slate-700 flex gap-2">
                                                <span className="text-deep-blue font-bold">•</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </>
                        ) : (
                            <div className="h-[300px] flex items-center justify-center text-slate-400">
                                시험 이력이 없습니다. 첫 시험을 시작해보세요!
                            </div>
                        )}
                    </section>

                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <History className="w-5 h-5 text-deep-blue" /> 시험 이력
                            </h2>
                            <button
                                onClick={() => onStatusChange('ready')}
                                className="text-xs font-bold text-deep-blue hover:underline flex items-center gap-1"
                            >
                                새 시험 시작 <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {history.length === 0 ? (
                                <div className="cbt-card p-12 text-center text-slate-400">
                                    아직 시험 이력이 없습니다.
                                </div>
                            ) : (
                                <>
                                    {paginatedHistory.map((record) => (
                                        <div
                                            key={record.id}
                                            className="cbt-card p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-deep-blue/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className={cn(
                                                        'w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0',
                                                        record.result.passed
                                                            ? 'bg-green-100 text-green-700'
                                                            : 'bg-red-100 text-red-700',
                                                    )}
                                                >
                                                    <span className="text-[10px] font-bold uppercase">
                                                        {record.result.passed ? 'Pass' : 'Fail'}
                                                    </span>
                                                    <span className="text-sm font-bold">
                                                        {record.result.totalScore.toFixed(0)}
                                                    </span>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-sm font-bold text-slate-900">
                                                            {record.result.subjectScores.length === 1
                                                                ? record.result.subjectScores[0].subject
                                                                : '전체 랜덤 모드'}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-semibold">
                                                            {new Date(record.createdAt).toLocaleDateString('ko-KR', {
                                                                month: 'long',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => onViewRecord(record)}
                                                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-sky-100 text-slate-700 text-xs font-bold hover:bg-deep-blue hover:text-white transition-all flex items-center justify-center gap-2"
                                            >
                                                <BookOpen className="w-4 h-4" /> 오답 확인
                                            </button>
                                        </div>
                                    ))}

                                    {totalPages > 1 && (
                                        <div className="pt-2">
                                            <div className="flex flex-wrap items-center justify-center gap-2">
                                                {/* 맨 앞 */}
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPage(1)}
                                                    disabled={currentPage === 1}
                                                    className={cn(
                                                        'h-10 px-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center',
                                                        currentPage === 1
                                                            ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed'
                                                            : 'bg-deep-blue text-white border-deep-blue hover:bg-slate-100/60 hover:text-deep-blue shadow-md',
                                                    )}
                                                >
                                                    <ChevronsLeft
                                                        className={cn(
                                                            'w-5 h-5 stroke-[2.5]',
                                                            currentPage === 1 ? 'text-slate-400/90' : '',
                                                        )}
                                                    />
                                                </button>

                                                {/* 이전 */}
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                                    disabled={currentPage === 1}
                                                    className={cn(
                                                        'h-10 px-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center',
                                                        currentPage === 1
                                                            ? 'bg-slate-200/80 border-slate-200/80 cursor-not-allowed'
                                                            : 'bg-deep-blue/80 text-white border-deep-blue/70 hover:bg-white hover:text-deep-blue shadow-sm',
                                                    )}
                                                >
                                                    <ChevronLeft
                                                        className={cn(
                                                            'w-5 h-5 stroke-[2.5]',
                                                            currentPage === 1 ? 'text-slate-400/70' : '',
                                                        )}
                                                    />
                                                </button>

                                                {/* 페이지 표시 */}
                                                <div className="h-10 px-4 rounded-xl border border-deep-blue/30 bg-white shadow-sm flex items-center gap-2">
                                                    <span className="text-base font-extrabold text-deep-blue">
                                                        {currentPage}
                                                    </span>
                                                    <span className="text-slate-300 font-semibold">/</span>
                                                    <span className="text-sm font-bold text-slate-500/80">
                                                        {totalPages}
                                                    </span>
                                                </div>

                                                {/* 다음 */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                                    }
                                                    disabled={currentPage === totalPages}
                                                    className={cn(
                                                        'h-10 px-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center',
                                                        currentPage === totalPages
                                                            ? 'bg-slate-200/80 border-slate-200/80 cursor-not-allowed'
                                                            : 'bg-deep-blue/80 text-white border-deep-blue/70 hover:bg-white hover:text-deep-blue shadow-sm',
                                                    )}
                                                >
                                                    <ChevronRight
                                                        className={cn(
                                                            'w-5 h-5 stroke-[2.5]',
                                                            currentPage === totalPages ? 'text-slate-400/70' : '',
                                                        )}
                                                    />
                                                </button>

                                                {/* 맨 뒤 */}
                                                <button
                                                    type="button"
                                                    onClick={() => setCurrentPage(totalPages)}
                                                    disabled={currentPage === totalPages}
                                                    className={cn(
                                                        'h-10 px-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center',
                                                        currentPage === totalPages
                                                            ? 'bg-slate-200 text-slate-400 border-slate-200 cursor-not-allowed'
                                                            : 'bg-deep-blue text-white border-deep-blue hover:bg-slate-100/60 hover:text-deep-blue shadow-md',
                                                    )}
                                                >
                                                    <ChevronsRight
                                                        className={cn(
                                                            'w-5 h-5 stroke-[2.5]',
                                                            currentPage === totalPages ? 'text-slate-400/90' : '',
                                                        )}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </section>
                </div>
            </main>

            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden z-10"
                        >
                            <div className="p-6 border-b border-slate-300 flex items-center justify-between">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <UserIcon className="w-5 h-5 text-deep-blue" /> 개인정보 수정
                                </h2>
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-500" />
                                </button>
                            </div>

                            <form className="p-6 space-y-4" onSubmit={handleUpdateProfile}>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        이름
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full p-3 rounded-lg border border-slate-400 bg-white text-slate-800 focus:border-deep-blue focus:ring-1 focus:ring-deep-blue/30 outline-none transition-all text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        이메일
                                    </label>
                                    <input
                                        type="email"
                                        defaultValue={user?.email || ''}
                                        disabled
                                        className="w-full p-3 rounded-lg border border-slate-400 bg-slate-100 text-slate-600 text-sm cursor-not-allowed"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        비밀번호 변경
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="새 비밀번호"
                                        className="w-full p-3 rounded-lg border border-slate-400 bg-white text-slate-800 focus:border-deep-blue focus:ring-1 focus:ring-deep-blue/30 outline-none transition-all text-sm"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="w-full cbt-button-primary py-3 text-sm mt-4 disabled:bg-slate-400"
                                >
                                    {isUpdating ? '처리 중...' : '정보 업데이트'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
