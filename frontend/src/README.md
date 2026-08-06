# 정보처리기사 CBT 시험 – 파일 구조

## 📁 src/

```
src/
├── App.tsx                        # 라우터 역할만 담당 (화면 전환)
│
├── types/
│   └── index.ts                   # 전역 타입 (Question, User, ExamResult 등)
│
├── utils/
│   └── index.ts                   # 순수 함수 (formatTime, calculateResult)
│
├── constants/
│   └── tips.ts                    # 과목별 학습 팁 데이터, 시험 제한 시간 상수
│
├── hooks/
│   └── useExam.ts                 # 🔑 핵심 훅 – 모든 상태 & 비즈니스 로직
│                                  #   (인증 체크, 타이머, 답안 처리, API 호출)
│
└── components/
    ├── AuthForm.tsx               # 로그인 / 회원가입 폼
    ├── ReadyScreen.tsx            # 시험 시작 화면 (모드 선택)
    ├── TestingScreen.tsx          # 시험 진행 화면 (문제 + OMR 답안지)
    ├── ResultScreen.tsx           # 시험 결과 화면 (레이더 차트 + 점수)
    ├── MyPageScreen.tsx           # 마이페이지 (취약 분석, 이력, 학습 팁)
    └── WrongAnswersScreen.tsx     # 오답 노트
```

## 🔄 데이터 흐름

```
App.tsx
  └── useExam() 훅으로 모든 상태/액션을 가져와서
      status 값에 따라 각 컴포넌트를 렌더링

useExam.ts
  ├── types/index.ts    (타입 참조)
  ├── utils/index.ts    (calculateResult, formatTime)
  ├── constants/tips.ts (EXAM_DURATION_SECONDS)
  └── mockData.ts       (MOCK_QUESTIONS)
```

## ✏️ 새 화면 추가 방법

1. `components/` 에 새 컴포넌트 파일 생성
2. `types/index.ts` 의 `AppStatus` 유니온 타입에 새 status 추가
3. `hooks/useExam.ts` 에 관련 상태/액션 추가 (필요 시)
4. `App.tsx` 에 `if (exam.status === '새status')` 블록 추가
