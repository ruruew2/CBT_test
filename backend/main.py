import json
import os
import random
import re
from datetime import datetime
from typing import Optional

import jwt
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from passlib.context import CryptContext
from sqlmodel import Field, Session, SQLModel, create_engine, select, func

load_dotenv()

# ── DB 설정 (Supabase PostgreSQL 연결) ────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL 환경변수가 설정되지 않았습니다.")

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL)

# 메모리 캐시 변수
_cached_questions = []


# ── 비밀번호 & JWT 설정 ──────────────────────────────────────
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
SECRET_KEY = "cbt-secret-key"
ALGORITHM = "HS256"


def validate_password(password: str):
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="비밀번호는 8자 이상이어야 합니다.")
    if not re.search(r"[A-Za-z]", password):
        raise HTTPException(status_code=400, detail="비밀번호에 영문자를 1개 이상 포함해야 합니다.")
    if not re.search(r"\d", password):
        raise HTTPException(status_code=400, detail="비밀번호에 숫자를 1개 이상 포함해야 합니다.")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>_\-+=/\\\[\]]", password):
        raise HTTPException(status_code=400, detail="비밀번호에 특수문자를 1개 이상 포함해야 합니다.")


def validate_email(email: str):
    allowed_domains = {
        "gmail.com", "naver.com", "daum.net", "hanmail.net",
        "kakao.com", "nate.com", "outlook.com", "hotmail.com",
        "icloud.com", "yahoo.com",
    }
    if "@" not in email:
        raise HTTPException(status_code=400, detail="올바른 이메일 형식이 아닙니다.")

    domain = email.split("@")[-1].lower()
    if domain not in allowed_domains:
        raise HTTPException(status_code=400, detail="허용되지 않는 이메일 도메인입니다.")


# ── DB 테이블 ─────────────────────────────────────────────────
class Question(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    subject: str
    question: str
    options: str  # DB의 jsonb 컬럼
    answer: int


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str = Field(unique=True)
    hashed_password: str


class ExamResult(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    total_score: float
    is_passed: bool
    subject_scores: str
    answers: str
    questions: str = Field(default="[]")
    created_at: datetime = Field(default_factory=datetime.now)


# ── DB 세션 ─────────────────────────────────────────────────
def get_session():
    with Session(engine) as session:
        yield session


# ── DB에서 문제 로드하는 함수 ───────────────────────────────
def load_questions_from_db():
    with Session(engine) as session:
        questions = session.exec(select(Question)).all()
        result = []
        for q in questions:
            # options가 문자열 형태일 경우 JSON 파싱 처리
            if isinstance(q.options, str):
                try:
                    options_data = json.loads(q.options)
                except Exception:
                    options_data = q.options
            else:
                options_data = q.options

            result.append({
                "id": q.id,
                "subject": q.subject,
                "questionText": q.question,
                "choices": options_data,
                "answer": q.answer
            })
        print(f"✅ DB에서 성공적으로 {len(result)}개 문제를 캐싱했습니다!")
        return result


# ── 요청 스키마 ───────────────────────────────────────────────
class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class UpdateUserRequest(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None


# ── FastAPI 앱 설정 ───────────────────────────────────────────
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── 단일 스타트업 이벤트 (DB 기반 문제 캐싱) ─────────────────
@app.on_event("startup")
def startup_load():
    global _cached_questions
    try:
        _cached_questions = load_questions_from_db()
    except Exception as e:
        print(f"❌ DB 질문 로드 실패: {e}")
        _cached_questions = []


# ── API 엔드포인트: 문제 관련 ─────────────────────────────────
@app.get("/questions/load-all")
def load_all_questions():
    return _cached_questions


@app.get("/questions/random")
def get_random_questions(count: int = Query(20, ge=1, le=100), session: Session = Depends(get_session)):
    # 1. 서버 메모리에 캐시가 있는 경우 즉시 반환 (속도 극대화)
    if _cached_questions:
        sample_count = min(count, len(_cached_questions))
        return random.sample(_cached_questions, sample_count)
    
    # 2. 캐시가 비어있을 경우 DB에서 직접 무작위 추출 (Fallback)
    statement = select(Question).order_by(func.random()).limit(count)
    questions = session.exec(statement).all()
    
    result = []
    for q in questions:
        options_data = json.loads(q.options) if isinstance(q.options, str) else q.options
        result.append({
            "id": q.id,
            "subject": q.subject,
            "questionText": q.question,
            "choices": options_data,
            "answer": q.answer
        })
    return result


@app.get("/questions/subject")
def get_subject_questions(subject: str = Query(...), count: int = Query(20, ge=1, le=100)):
    # 1. 프론트엔드가 보낸 과목명과 DB 과목명 모두 공백(Space) 및 여백 제거 후 비교
    target_clean = subject.replace(" ", "").strip()
    
    filtered = [
        q for q in _cached_questions 
        if q.get("subject") and q.get("subject").replace(" ", "").strip() == target_clean
    ]

    if not filtered:
        print(f"⚠️ 매칭 실패: 전달받은 subject='{subject}', 정제된 subject='{target_clean}'")
        return []

    count = min(count, len(filtered))
    return random.sample(filtered, count)


# ── API 엔드포인트: 결과 및 이력 ──────────────────────────────
@app.post("/results/save")
def save_exam_result(data: dict, session: Session = Depends(get_session)):
    try:
        new_result = ExamResult(
            user_id=data["userId"],
            total_score=data["result"]["totalScore"],
            is_passed=data["result"]["passed"],
            subject_scores=json.dumps(data["result"]["subjectScores"], ensure_ascii=False),
            answers=json.dumps(data["answers"], ensure_ascii=False),
            questions=json.dumps(data.get("questions", []), ensure_ascii=False),
        )
        session.add(new_result)
        session.commit()
        session.refresh(new_result)
        return {"status": "success", "id": new_result.id}
    except Exception as e:
        print(f"저장 에러: {str(e)}")
        return {"status": "error", "message": str(e)}


@app.get("/results/history/{user_id}")
def get_exam_history(user_id: int, session: Session = Depends(get_session)):
    results = session.exec(
        select(ExamResult)
        .where(ExamResult.user_id == user_id)
        .order_by(ExamResult.id.desc())
    ).all()

    history_list = []
    for r in results:
        history_list.append({
            "id": str(r.id),
            "result": {
                "totalScore": r.total_score,
                "passed": r.is_passed,
                "subjectScores": json.loads(r.subject_scores)
            },
            "answers": json.loads(r.answers),
            "questions": json.loads(r.questions),
            "createdAt": r.created_at.isoformat() if r.created_at else None
        })
    return history_list


# ── API 엔드포인트: 인증(Auth) ────────────────────────────────
@app.post("/auth/register")
def register(req: RegisterRequest, session: Session = Depends(get_session)):
    validate_email(req.email)
    validate_password(req.password)

    existing = session.exec(select(User).where(User.email == req.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 존재하는 이메일입니다.")

    user = User(
        username=req.username,
        email=req.email,
        hashed_password=pwd_context.hash(req.password)
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"message": "회원가입 성공"}


@app.post("/auth/login")
def login(req: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == req.email)).first()
    if not user or not pwd_context.verify(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다.")

    token = jwt.encode(
        {"user_id": user.id, "email": user.email},
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {"id": user.id, "email": user.email, "name": user.username}
    }


# ── API 엔드포인트: 개인정보 수정 ─────────────────────────────
@app.patch("/users/{user_id}")
def update_user_info(user_id: int, req: UpdateUserRequest, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    if req.username:
        user.username = req.username

    if req.password:
        validate_password(req.password)
        user.hashed_password = pwd_context.hash(req.password)

    session.add(user)
    session.commit()
    session.refresh(user)

    return {
        "status": "success",
        "user": {"id": user.id, "name": user.username, "email": user.email}
    }


# ── API 엔드포인트: 회원탈퇴 ──────────────────────────────────
@app.delete("/users/{user_id}", status_code=204)
def delete_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="사용자를 찾을 수 없습니다.")

    exam_results = session.exec(
        select(ExamResult).where(ExamResult.user_id == user_id)
    ).all()
    for result in exam_results:
        session.delete(result)

    session.delete(user)
    session.commit()


# ── 서버 실행 ──────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)