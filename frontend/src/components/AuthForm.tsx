// ============================================================
// components/AuthForm.tsx  –  로그인 / 회원가입 폼
// ============================================================

import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, LogIn } from 'lucide-react';
import { AppStatus, User } from '../types';
import { API_BASE_URL } from '../config';

interface Props {
    type: 'login' | 'signup';
    onStatusChange: (s: AppStatus) => void;
    onUserChange: (u: User) => void;
}

export default function AuthForm({ type, onStatusChange, onUserChange }: Props) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');

        // 1. API_BASE_URL을 사용하고, type에 따라 경로만 결정합니다.
        const endpoint = type === 'login' ? '/auth/login' : '/auth/register';
        const url = `${API_BASE_URL}${endpoint}`;

        const body = type === 'login' ? { email, password } : { username: name, email, password };

        try {
            // 3. url 변수를 사용하여 요청 보냅니다.
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                if (type === 'login') {
                    localStorage.setItem('token', data.access_token);
                    onUserChange(data.user);
                    onStatusChange('ready');
                } else {
                    // 회원가입 성공 시 메시지를 띄워주면 좋겠죠?
                    alert('회원가입이 완료되었습니다. 로그인을 진행해 주세요!');
                    onStatusChange('login');
                }
            } else {
                // 서버에서 보내주는 에러 메시지 표시
                setError(data.detail || '인증에 실패했습니다.');
            }
        } catch (e) {
            setError('로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <header className="h-16 bg-white border-b border-slate-300 flex items-center justify-center px-4 md:px-8 sticky top-0 z-30">
                <button
                    onClick={() => onStatusChange('ready')}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity whitespace-nowrap"
                >
                    <LayoutDashboard className="w-6 h-6 text-deep-blue shrink-0" />
                    <span className="font-bold text-slate-900 text-sm md:text-base">정보처리기사 CBT 시험</span>
                </button>
            </header>

            <div className="flex-1 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full cbt-card p-8"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-deep-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <LogIn className="w-8 h-8 text-deep-blue" />
                        </div>
                        <h1 className="text-2xl font-bold">{type === 'login' ? '로그인' : '회원가입'}</h1>
                        <p className="text-slate-600">정보처리기사 CBT 시험에 오신 것을 환영합니다.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {type === 'signup' && (
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">이름</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-400 bg-white text-slate-800 rounded-lg focus:border-deep-blue focus:ring-1 focus:ring-deep-blue/30 outline-none transition-all"
                                    required
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">이메일</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-400 bg-white text-slate-800 rounded-lg focus:border-deep-blue focus:ring-1 focus:ring-deep-blue/30 outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">비밀번호</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-400 bg-white text-slate-800 rounded-lg focus:border-deep-blue focus:ring-1 focus:ring-deep-blue/30 outline-none transition-all"
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <button type="submit" className="w-full cbt-button-primary py-3">
                            {type === 'login' ? '로그인' : '가입하기'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-slate-500">
                        {type === 'login' ? (
                            <p>
                                계정이 없으신가요?{' '}
                                <button onClick={() => onStatusChange('signup')} className="text-deep-blue font-bold">
                                    회원가입
                                </button>
                            </p>
                        ) : (
                            <p>
                                이미 계정이 있으신가요?{' '}
                                <button onClick={() => onStatusChange('login')} className="text-deep-blue font-bold">
                                    로그인
                                </button>
                            </p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
