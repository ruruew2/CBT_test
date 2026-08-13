import { useState, useEffect, useMemo, useCallback } from 'react';
import { Question, User, ExamResultRecord, SubjectScore } from '../types';
import { calculateResult, formatTime } from '../lib/utils';
import { API_BASE_URL } from '../config';

const EXAM_STORAGE_KEY = 'cbt_exam_state';

type SavedExamState = {
    status: string;
    currentIndex: number;
    answers: Record<string | number, number>;
    timeLeft: number;
    questions: Question[];
    selectedSubject: string;
    viewingRecord: ExamResultRecord | null;
};

export function useExam() {
    const [status, setStatus] = useState('ready');
    const [user, setUserState] = useState<User | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string | number, number>>({});
    const [timeLeft, setTimeLeft] = useState(1800);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('all');
    const [history, setHistory] = useState<ExamResultRecord[]>([]);
    const [viewingRecord, setViewingRecord] = useState<ExamResultRecord | null>(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [showToast, setShowToast] = useState(false);

    const filteredQuestions = useMemo<Question[]>(() => {
        return questions;
    }, [questions]);

    const cumulativeScores = useMemo<SubjectScore[]>(() => {
        if (!history.length) return [];
        const subjectMap: Record<string, { total: number; correct: number }> = {};

        history.forEach((record) => {
            if (!record.result || !record.result.subjectScores) return;
            record.result.subjectScores.forEach((ss) => {
                if (!subjectMap[ss.subject]) {
                    subjectMap[ss.subject] = { total: 0, correct: 0 };
                }
                subjectMap[ss.subject].total += ss.total ?? 0;
                subjectMap[ss.subject].correct += ss.correct ?? 0;
            });
        });

        return Object.entries(subjectMap).map(([subject, data]) => ({
            subject,
            score: data.total > 0 ? (data.correct / data.total) * 100 : 0,
            total: data.total,
            correct: data.correct,
        }));
    }, [history]);

    const weakestSubject = useMemo(() => {
        if (!cumulativeScores.length) return null;
        return [...cumulativeScores].sort((a, b) => a.score - b.score)[0];
    }, [cumulativeScores]);

    const saveExamState = useCallback(
        (override?: Partial<SavedExamState>) => {
            const data: SavedExamState = {
                status,
                currentIndex,
                answers,
                timeLeft,
                questions,
                selectedSubject,
                viewingRecord,
                ...override,
            };
            localStorage.setItem(EXAM_STORAGE_KEY, JSON.stringify(data));
        },
        [status, currentIndex, answers, timeLeft, questions, selectedSubject, viewingRecord],
    );

    const clearExamState = useCallback(() => {
        localStorage.removeItem(EXAM_STORAGE_KEY);
    }, []);

const loadQuestions = useCallback(async (targetSubject?: string) => {
    try {
        const currentSubject = targetSubject ?? selectedSubject;
        const isAll = currentSubject === 'all';
        const count = isAll ? 100 : 20;

        const url = isAll
        ? `${API_BASE_URL}/questions/random?count=${count}`
        : `${API_BASE_URL}/questions/subject?subject=${encodeURIComponent(currentSubject)}&count=${count}`;

        console.log("요청 보내는 URL:", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        if (data && data.length > 0) {
            setQuestions(data);
            setTimeLeft(isAll ? 150 * 60 : 30 * 60);
        } else {
            console.warn("불러온 문제 데이터가 0개입니다.");
            setQuestions([]);
        }
    } catch (e) {
        console.error('데이터 로딩 실패:', e);
        setQuestions([]);
    }
}, [selectedSubject]);

    const fetchHistory = useCallback(async () => {
        if (!user) return;
        try {
            const res = await fetch(`${API_BASE_URL}/results/history/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (e) {
            console.error('이력 불러오기 실패:', e);
        }
    }, [user]);

    const handleFinish = async () => {
        if (!filteredQuestions.length) return;

        const finalResult = calculateResult(filteredQuestions, answers);

        if (user) {
            try {
                await fetch(`${API_BASE_URL}/results/save`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: user.id,
                        result: finalResult,
                        answers,
                        questions: filteredQuestions,
                    }),
                });
                await fetchHistory();
            } catch (e) {
                console.error('결과 저장 중 에러:', e);
            }
        }

        setStatus('finished');
    };

    const handleReset = useCallback(() => {
        setCurrentIndex(0);
        setAnswers({});
        setQuestions([]);
        setViewingRecord(null);
        setShowToast(false);
        setTimeLeft(selectedSubject === 'all' ? 150 * 60 : 30 * 60);
        clearExamState();
    }, [selectedSubject, clearExamState]);

    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        const savedExam = localStorage.getItem(EXAM_STORAGE_KEY);

        if (savedUser) {
            try {
                setUserState(JSON.parse(savedUser));
            } catch (e) {
                console.error('유저 복구 실패:', e);
                localStorage.removeItem('user');
            }
        }

        if (savedExam) {
            try {
                const parsed: SavedExamState = JSON.parse(savedExam);
                setStatus(parsed.status ?? (savedUser ? 'ready' : 'login'));
                setCurrentIndex(parsed.currentIndex ?? 0);
                setAnswers(parsed.answers ?? {});
                setTimeLeft(parsed.timeLeft ?? 1800);
                setQuestions(parsed.questions ?? []);
                setSelectedSubject(parsed.selectedSubject ?? 'all');
                setViewingRecord(parsed.viewingRecord ?? null);
            } catch (e) {
                console.error('시험 상태 복구 실패:', e);
                setStatus(savedUser ? 'ready' : 'login');
                localStorage.removeItem(EXAM_STORAGE_KEY);
            }
        } else {
            setStatus('ready');
        }

        setIsAuthChecking(false);
    }, []);

    // 저장된 시험 상태가 없을 때만 ready에서 새 문제 불러오기
    useEffect(() => {
        if (isAuthChecking) return;
        
        // ready 상태에서 과목이 변경되면 해당 과목 20개 문제를 즉시 가져옴
        if (status === 'ready') {
            loadQuestions(selectedSubject);
        }
    }, [selectedSubject, status, isAuthChecking, loadQuestions]);

    useEffect(() => {
        if (isAuthChecking) return;

        saveExamState();
    }, [
        status,
        currentIndex,
        answers,
        timeLeft,
        questions,
        selectedSubject,
        viewingRecord,
        isAuthChecking,
        saveExamState,
    ]);

    useEffect(() => {
        let timer: number;

        if (status === 'testing' && timeLeft > 0) {
            timer = window.setInterval(() => {
                setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
            }, 1000);
        } else if (timeLeft === 0 && status === 'testing') {
            setShowToast(true);
            handleFinish();
        }

        return () => clearInterval(timer);
    }, [status, timeLeft]);

    return {
        status,
        setStatus,
        user,
        setUser: (u: User | null) => {
            setUserState(u);
            if (u) {
                localStorage.setItem('user', JSON.stringify(u));
            } else {
                localStorage.removeItem('user');
            }
        },
        currentIndex,
        setCurrentIndex,
        questions,
        filteredQuestions,
        currentQuestion: filteredQuestions[currentIndex],
        answers,
        timeLeft,
        result: status === 'finished' ? calculateResult(filteredQuestions, answers) : null,
        formattedTime: formatTime(timeLeft),
        handleAnswer: (idx: number) => {
            const q = filteredQuestions[currentIndex];
            if (!q) return;

            const isSameAnswer = answers[q.id] === idx;

            let nextAnswers = { ...answers };

            if (isSameAnswer) {
                delete nextAnswers[q.id]; // 다시 누르면 선택 해제
            } else {
                nextAnswers[q.id] = idx; // 다른 선택이면 변경
            }

            setAnswers(nextAnswers);

            localStorage.setItem(
                EXAM_STORAGE_KEY,
                JSON.stringify({
                    status,
                    currentIndex,
                    answers: nextAnswers,
                    timeLeft,
                    questions,
                    selectedSubject,
                    viewingRecord,
                }),
            );
        },
        handleNext: () => currentIndex < filteredQuestions.length - 1 && setCurrentIndex((c) => c + 1),
        handlePrev: () => currentIndex > 0 && setCurrentIndex((c) => c - 1),
        handleFinish,
        handleReset,
        subjects: [
            '소프트웨어 설계',
            '소프트웨어 개발',
            '데이터베이스 구축',
            '프로그래밍 언어 활용',
            '정보시스템 구축관리',
        ],
        selectedSubject,
        setSelectedSubject,
        handleLogout: () => {
            setUserState(null);
            localStorage.removeItem('user');
            clearExamState();
            setViewingRecord(null);
            setHistory([]);
            setQuestions([]);
            setAnswers({});
            setCurrentIndex(0);
            setStatus('login');
        },
        fetchHistory,
        history,
        viewingRecord,
        setViewingRecord,
        showToast,
        setShowToast,
        isAuthChecking,
        cumulativeScores,
        weakestSubject,
        loadQuestions,
        saveExamState,
    };
}
