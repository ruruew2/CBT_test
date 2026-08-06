# 📌 CBT 프로젝트 - 백엔드 개발 가이드

## 1. JSON 데이터 구조

```json
{
  "subject": "소프트웨어 설계",
  "questionNo": 1,
  "questionText": "문제 텍스트",
  "choices": ["보기1", "보기2", "보기3", "보기4"],
  "answer": 2,
  "explanations": ["해설1", "해설2"]
}
```

- `answer`는 **1~4 숫자** (0부터 시작하는 배열 인덱스 아님)
- `explanations`는 **배열** — 해설이 여러 개일 수 있음

---

## 2. DB 테이블 구조

### questions
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | 자동증가 |
| subject | VARCHAR | 과목명 |
| question_no | INT | 원본 문제번호 |
| question_text | TEXT | 문제 텍스트 |
| choice_1 | TEXT | 보기 1 |
| choice_2 | TEXT | 보기 2 |
| choice_3 | TEXT | 보기 3 |
| choice_4 | TEXT | 보기 4 |
| answer | INT | 정답 (1~4) |
| exam_date | VARCHAR | 출처 회차 (예: 20220424) |

### explanations
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | 자동증가 |
| question_id | INT FK | questions.id 참조 |
| content | TEXT | 해설 내용 |

### users
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | 자동증가 |
| username | VARCHAR | 이름 |
| email | VARCHAR | 이메일 |
| password | VARCHAR | 해시 저장 |

### results
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | 자동증가 |
| user_id | INT FK | users.id 참조 |
| mode | VARCHAR | random / subject |
| subject | VARCHAR | 과목별이면 과목명, 랜덤이면 null |
| score | FLOAT | 점수 |
| created_at | DATETIME | 시험 일시 |

### result_answers
| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | INT PK | 자동증가 |
| result_id | INT FK | results.id 참조 |
| question_id | INT FK | questions.id 참조 |
| selected | INT | 사용자가 선택한 답 (1~4) |
| is_correct | BOOLEAN | 정답 여부 |

---

## 3. API 명세

### 문제 조회

#### GET /questions/random — 랜덤 문제 조회
```
Query params: count=20
```
```json
// Response
[
  {
    "id": 1,
    "subject": "소프트웨어 설계",
    "questionNo": 1,
    "questionText": "문제 텍스트",
    "choices": ["보기1", "보기2", "보기3", "보기4"],
    "answer": 2,
    "explanations": ["해설1", "해설2"]
  }
]
```

#### GET /questions/subject — 과목별 문제 조회
```
Query params: subject=소프트웨어 설계&count=20
```
```json
// Response (위와 동일)
```

---

### 결과 저장 및 조회

#### POST /results — 시험 결과 저장
```json
// Request
{
  "user_id": 1,
  "mode": "random",
  "subject": null,
  "answers": [
    { "question_id": 1, "selected": 2, "is_correct": true }
  ]
}

// Response
{
  "result_id": 1,
  "score": 75.0,
  "subject_scores": {
    "소프트웨어 설계": 80.0,
    "소프트웨어 개발": 60.0
  }
}
```

#### GET /results/{user_id} — 시험 이력 조회
```json
// Response
[
  {
    "result_id": 1,
    "date": "2026-04-15",
    "mode": "random",
    "score": 75.0
  }
]
```

#### GET /results/{result_id}/wrong — 회차별 오답 조회
```json
// Response
[
  {
    "question_id": 1,
    "questionText": "문제 텍스트",
    "subject": "소프트웨어 설계",
    "selected": 3,
    "answer": 2,
    "explanations": ["해설"]
  }
]
```

---

### 인증

#### POST /auth/register — 회원가입
```json
// Request
{ "username": "미현", "email": "example@email.com", "password": "비밀번호" }
```

#### POST /auth/login — 로그인
```json
// Response
{ "access_token": "jwt토큰", "token_type": "bearer" }
```

---

## 4. 과목명 통일 (중요!)

DB에 넣을 때 아래 5개로 통일할 것 (띄어쓰기 주의)

- 소프트웨어 설계
- 소프트웨어 개발
- 데이터베이스 구축
- 프로그래밍 언어 활용
- 정보시스템 구축 관리
