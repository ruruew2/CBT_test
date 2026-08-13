import { motion } from 'motion/react';
import { useExam } from './hooks/useExam';
import { useEffect } from 'react';

import AuthForm from './components/AuthForm';
import ReadyScreen from './components/ReadyScreen';
import TestingScreen from './components/TestingScreen';
import ResultScreen from './components/ResultScreen';
import MyPageScreen from './components/MyPageScreen';
import WrongAnswersScreen from './components/WrongAnswersScreen';

export default function App() {
    const exam = useExam();

    useEffect(() => {
        // 오답노트 화면일 때는 절대로 히스토리를 다시 부르지 않도록!
        if (exam.status === 'mypage' && !exam.viewingRecord) {
            exam.fetchHistory();
        }
    }, [exam.status, exam.viewingRecord]);

    // ── 로딩 스피너 ──────────────────────────────────────────
    if (exam.isAuthChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-8 h-8 border-4 border-deep-blue border-t-transparent rounded-full"
                />
            </div>
        );
    }

    // ── 인증 화면 ─────────────────────────────────────────────
    if (exam.status === 'login' || exam.status === 'signup') {
        return <AuthForm type={exam.status} onStatusChange={exam.setStatus} onUserChange={exam.setUser} />;
    }

// ── 시험 시작 화면 ───────────────────────────────────────
if (exam.status === 'ready') {
    return (
        <ReadyScreen
            user={exam.user}
            subjects={exam.subjects || []}
            selectedSubject={exam.selectedSubject}
            filteredQuestionsLength={exam.filteredQuestions?.length || 0}
            
            // 💡 [수정 포인트 1] 과목 변경 시 즉시 20문제를 불러오도록 수정
            onSubjectChange={async (subject) => {
                exam.setSelectedSubject(subject);
                // 과목이 선택되었으면 해당 과목 문제 20개를 바로 로딩
                if (subject !== '') {
                    await exam.loadQuestions(subject); 
                }
            }}
            
            onLogout={exam.handleLogout}
            onFetchHistory={exam.fetchHistory}
            
            // 💡 [수정 포인트 2] 시작 버튼 클릭 시
            onStatusChange={async (newStatus) => {
                if (newStatus === 'testing') {
                    // 이미 filteredQuestions에 문제 20개가 차있지 않다면 한번 더 로드
                    if (!exam.filteredQuestions || exam.filteredQuestions.length === 0) {
                        await exam.loadQuestions();
                    }
                    exam.setStatus('testing');
                } else {
                    exam.setStatus(newStatus);
                }
            }}
        />
    );
}

    // ── 마이페이지 ───────────────────────────────────────────
    if (exam.status === 'mypage') {
        return (
            <MyPageScreen
                user={exam.user}
                history={exam.history || []}
                cumulativeScores={exam.cumulativeScores || []}
                weakestSubject={exam.weakestSubject}
                onStatusChange={exam.setStatus}
                onLogout={exam.handleLogout} // 로그아웃 연결
                onViewRecord={(record) => {
                    const recordData = record as any;

                    const enrichedRecord = {
                        ...recordData,
                        answers: recordData.answers || recordData.result?.answers || {},
                        questions:
                            recordData.questions && recordData.questions.length > 0
                                ? recordData.questions
                                : recordData.result?.questions && recordData.result.questions.length > 0
                                  ? recordData.result.questions
                                  : exam.questions || [],
                    };

                    // 오답 화면 넘어가기 전 스크롤 초기화
                    window.scrollTo(0, 0);

                    exam.setViewingRecord(enrichedRecord);
                    exam.setStatus('wrong-answers');
                }}
            />
        );
    }

    // ── 오답 노트 ─────────────────────────────────────────────
    if (exam.status === 'wrong-answers') {
        return (
            <WrongAnswersScreen
                viewingRecord={exam.viewingRecord}
                allQuestions={exam.questions || []}
                currentAnswers={exam.answers || {}}
                user={exam.user} // <-- 이 줄을 반드시 추가하세요!
                onHome={() => {
                    exam.setViewingRecord(null);
                    exam.setStatus('ready');
                }}
                onBack={() => {
                    if (exam.viewingRecord) {
                        exam.setStatus('mypage');
                    } else {
                        exam.setStatus('finished');
                    }
                }}
                onGoMypage={() => {
                    exam.setStatus('mypage');
                    exam.setViewingRecord(null);
                }}
            />
        );
    }

    // ── 결과 화면 ─────────────────────────────────────────────
    if (exam.status === 'finished' && exam.result) {
        return (
            <ResultScreen
                result={exam.result}
                // [수정] 데이터 리셋 후 'ready'(메인) 화면으로 이동하도록 변경
                onReset={() => {
                    exam.handleReset(); // 1. 점수 및 답안 초기화
                    exam.setStatus('ready'); // 2. 메인 화면으로 이동
                }}
                onWrongAnswers={() => exam.setStatus('wrong-answers')}
                onHome={() => exam.setStatus('ready')}
            />
        );
    }

    // ── 시험 진행 화면 ────────────────────────────────────────
    if (!exam.filteredQuestions || exam.filteredQuestions.length === 0) {
        return <div className="min-h-screen flex items-center justify-center">데이터를 불러오는 중...</div>;
    }

    return (
        <TestingScreen
            currentQuestion={exam.currentQuestion}
            currentIndex={exam.currentIndex}
            filteredQuestions={exam.filteredQuestions || []}
            answers={exam.answers || {}}
            formattedTime={exam.formattedTime}
            showToast={exam.showToast}
            onAnswer={exam.handleAnswer}
            onNext={exam.handleNext}
            onPrev={exam.handlePrev}
            onFinish={exam.handleFinish}
            onNavigate={exam.setCurrentIndex}
            onExitConfirm={() => {
                if (window.confirm('시험을 중단하고 메인 화면으로 돌아가시겠습니까?')) {
                    exam.handleReset(); // 데이터만 깔끔하게 비움
                    exam.setStatus('ready'); // 화면 전환
                }
            }}
            onToastClose={() => exam.setShowToast(false)}
        />
    );
}
