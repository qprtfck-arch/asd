from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
import os, json

# ── CONFIG ─────────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("SECRET_KEY", "studybridge-secret-key-change-in-prod-2024")
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24 * 7  # 7 дней

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./studybridge.db")
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
pwd = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
bearer = HTTPBearer(auto_error=False)

# ── MODELS ─────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"
    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String, nullable=False)
    email          = Column(String, unique=True, index=True, nullable=False)
    password_hash  = Column(String, nullable=False)
    plan           = Column(String, default="free")      # free | pro | mentor+
    streak         = Column(Integer, default=1)
    last_activity  = Column(DateTime, nullable=True)
    goal_score     = Column(Integer, default=90)
    exam_subject   = Column(String, default="Математика")
    exam_date      = Column(String, nullable=True)
    rating_rank    = Column(Integer, default=0)
    created_at     = Column(DateTime, default=datetime.utcnow)

    tasks    = relationship("Task",          back_populates="user", cascade="all, delete")
    progress = relationship("TopicProgress", back_populates="user", cascade="all, delete")
    sessions = relationship("MentorSession", back_populates="user", cascade="all, delete")
    quizzes  = relationship("QuizAnswer",    back_populates="user", cascade="all, delete")


class Task(Base):
    __tablename__ = "tasks"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    title      = Column(String, nullable=False)
    emoji      = Column(String, default="📋")
    completed  = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="tasks")


class TopicProgress(Base):
    __tablename__ = "topic_progress"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    topic      = Column(String, nullable=False)
    percentage = Column(Float, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="progress")


class Mentor(Base):
    __tablename__ = "mentors"
    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    subjects   = Column(String)
    rating     = Column(Float, default=4.8)
    reviews    = Column(Integer, default=0)
    experience = Column(String)
    price      = Column(String)
    avatar     = Column(String)
    tag        = Column(String, nullable=True)
    students   = Column(Integer, default=0)
    university = Column(String)

    sessions = relationship("MentorSession", back_populates="mentor")


class MentorSession(Base):
    __tablename__ = "mentor_sessions"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    mentor_id  = Column(Integer, ForeignKey("mentors.id"))
    status     = Column(String, default="confirmed")  # confirmed | completed | cancelled
    notes      = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user   = relationship("User",   back_populates="sessions")
    mentor = relationship("Mentor", back_populates="sessions")


class QuizAnswer(Base):
    __tablename__ = "quiz_answers"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    answers    = Column(Text)   # JSON
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quizzes")


class Payment(Base):
    __tablename__ = "payments"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    plan       = Column(String)
    amount     = Column(Float)
    status     = Column(String, default="completed")
    created_at = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# ── SCHEMAS ────────────────────────────────────────────────────────────────────
class RegisterIn(BaseModel):
    name: str
    email: str
    password: str

class LoginIn(BaseModel):
    email: str
    password: str

class TaskCreate(BaseModel):
    title: str
    emoji: str = "📋"

class ProgressUpdate(BaseModel):
    percentage: float

class BookIn(BaseModel):
    notes: Optional[str] = None

class QuizIn(BaseModel):
    answers: dict

class PaymentIn(BaseModel):
    plan: str   # pro | mentor+

class ProfileUpdate(BaseModel):
    goal_score:    Optional[int] = None
    exam_subject:  Optional[str] = None
    exam_date:     Optional[str] = None

# ── HELPERS ────────────────────────────────────────────────────────────────────
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def make_token(user_id: int) -> str:
    exp = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def current_user(
    creds: HTTPAuthorizationCredentials = Depends(bearer),
    db: Session = Depends(get_db),
) -> User:
    if not creds:
        raise HTTPException(401, "Требуется авторизация")
    try:
        payload = jwt.decode(creds.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        uid = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(401, "Недействительный токен")
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(401, "Пользователь не найден")
    return user

def user_dict(u: User):
    return {"id": u.id, "name": u.name, "email": u.email, "plan": u.plan,
            "streak": u.streak, "goal_score": u.goal_score, "exam_subject": u.exam_subject}

def _seed_mentors(db: Session):
    if db.query(Mentor).count():
        return
    mentors = [
        dict(name="Михаил Андреев",  subjects="Математика, Физика",          rating=4.9, reviews=128, experience="8 лет", price="2 500 ₽/сессия", avatar="МА", tag="Топ-ментор",   students=240, university="МФТИ"),
        dict(name="Екатерина Волкова", subjects="Русский язык, Литература",   rating=4.8, reviews=94,  experience="6 лет", price="2 000 ₽/сессия", avatar="ЕВ", tag="Эксперт ЕГЭ", students=180, university="МГУ"),
        dict(name="Артём Смирнов",   subjects="Химия, Биология",             rating=4.9, reviews=76,  experience="5 лет", price="2 200 ₽/сессия", avatar="АС", tag="Олимпиадник",  students=130, university="Сеченовский"),
        dict(name="Анна Козлова",    subjects="Обществознание, История",      rating=4.7, reviews=112, experience="7 лет", price="1 800 ₽/сессия", avatar="АК", tag="",             students=200, university="ВШЭ"),
    ]
    for m in mentors:
        db.add(Mentor(**m))
    db.commit()

def _seed_user_data(db: Session, uid: int):
    for t, e in [("Тригонометрия: тест 12 задач","📐"), ("Разбор пробника с ментором","📋"),
                 ("Теория вероятностей: урок","📖"), ("Повторение: производные","🔄")]:
        db.add(Task(user_id=uid, title=t, emoji=e))
    for topic, pct in [("Алгебра",95), ("Геометрия",72), ("Тригонометрия",48),
                       ("Стереометрия",25), ("Теория вероятностей",15)]:
        db.add(TopicProgress(user_id=uid, topic=topic, percentage=pct))
    db.commit()

# ── APP ────────────────────────────────────────────────────────────────────────
app = FastAPI(title="StudyBridge API", version="1.0.0", docs_url="/api/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    db = SessionLocal()
    _seed_mentors(db)
    db.close()

# ── AUTH ───────────────────────────────────────────────────────────────────────
@app.post("/api/auth/register")
def register(data: RegisterIn, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email уже зарегистрирован")
    import random
    user = User(
        name=data.name, email=data.email,
        password_hash=pwd.hash(data.password),
        streak=1, last_activity=datetime.utcnow(),
        rating_rank=random.randint(10, 400),
    )
    db.add(user); db.commit(); db.refresh(user)
    _seed_user_data(db, user.id)
    return {"token": make_token(user.id), "user": user_dict(user)}


@app.post("/api/auth/login")
def login(data: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not pwd.verify(data.password, user.password_hash):
        raise HTTPException(401, "Неверный email или пароль")
    return {"token": make_token(user.id), "user": user_dict(user)}


@app.get("/api/auth/me")
def me(user: User = Depends(current_user)):
    return user_dict(user)

# ── DASHBOARD ─────────────────────────────────────────────────────────────────
@app.get("/api/dashboard")
def dashboard(user: User = Depends(current_user), db: Session = Depends(get_db)):
    tasks    = db.query(Task).filter(Task.user_id == user.id).all()
    progress = db.query(TopicProgress).filter(TopicProgress.user_id == user.id).all()
    sessions = db.query(MentorSession).filter(
        MentorSession.user_id == user.id,
        MentorSession.status  != "cancelled"
    ).order_by(MentorSession.created_at.desc()).all()

    total_pct = round(sum(p.percentage for p in progress) / len(progress)) if progress else 0
    completed = sum(1 for t in tasks if t.completed)

    next_sess = None
    if sessions:
        s = sessions[0]
        m = db.query(Mentor).filter(Mentor.id == s.mentor_id).first()
        if m:
            next_sess = {"mentor_name": m.name, "mentor_avatar": m.avatar, "status": s.status}

    return {
        "user":       user_dict(user),
        "stats": {
            "progress":        total_pct,
            "goal_score":      user.goal_score,
            "completed_tasks": completed,
            "total_tasks":     len(tasks),
            "rating":          user.rating_rank or 12,
        },
        "tasks":       [{"id":t.id,"title":t.title,"emoji":t.emoji,"completed":t.completed} for t in tasks],
        "progress":    [{"topic":p.topic,"percentage":p.percentage} for p in progress],
        "next_session": next_sess,
    }

# ── TASKS ─────────────────────────────────────────────────────────────────────
@app.get("/api/tasks")
def get_tasks(user: User = Depends(current_user), db: Session = Depends(get_db)):
    tasks = db.query(Task).filter(Task.user_id == user.id).all()
    return [{"id":t.id,"title":t.title,"emoji":t.emoji,"completed":t.completed} for t in tasks]


@app.post("/api/tasks", status_code=201)
def create_task(data: TaskCreate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    t = Task(user_id=user.id, title=data.title, emoji=data.emoji)
    db.add(t); db.commit(); db.refresh(t)
    return {"id":t.id,"title":t.title,"emoji":t.emoji,"completed":t.completed}


@app.put("/api/tasks/{task_id}/complete")
def toggle_task(task_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    t = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()
    if not t:
        raise HTTPException(404, "Задача не найдена")
    t.completed = not t.completed
    db.commit()
    return {"id": t.id, "completed": t.completed}


@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    t = db.query(Task).filter(Task.id == task_id, Task.user_id == user.id).first()
    if not t:
        raise HTTPException(404, "Задача не найдена")
    db.delete(t); db.commit()
    return {"ok": True}

# ── PROGRESS ──────────────────────────────────────────────────────────────────
@app.get("/api/progress")
def get_progress(user: User = Depends(current_user), db: Session = Depends(get_db)):
    return [{"topic":p.topic,"percentage":p.percentage}
            for p in db.query(TopicProgress).filter(TopicProgress.user_id == user.id).all()]


@app.put("/api/progress/{topic}")
def update_progress(topic: str, data: ProgressUpdate,
                    user: User = Depends(current_user), db: Session = Depends(get_db)):
    p = db.query(TopicProgress).filter(
        TopicProgress.user_id == user.id, TopicProgress.topic == topic
    ).first()
    if p:
        p.percentage = min(100, max(0, data.percentage))
        p.updated_at = datetime.utcnow()
    else:
        p = TopicProgress(user_id=user.id, topic=topic, percentage=data.percentage)
        db.add(p)
    db.commit()
    return {"topic": p.topic, "percentage": p.percentage}

# ── MENTORS ───────────────────────────────────────────────────────────────────
@app.get("/api/mentors")
def get_mentors(db: Session = Depends(get_db)):
    return [{"id":m.id,"name":m.name,"subjects":m.subjects,"rating":m.rating,
             "reviews":m.reviews,"experience":m.experience,"price":m.price,
             "avatar":m.avatar,"tag":m.tag,"students":m.students,"university":m.university}
            for m in db.query(Mentor).all()]


@app.post("/api/mentors/{mentor_id}/book", status_code=201)
def book_mentor(mentor_id: int, data: BookIn,
                user: User = Depends(current_user), db: Session = Depends(get_db)):
    m = db.query(Mentor).filter(Mentor.id == mentor_id).first()
    if not m:
        raise HTTPException(404, "Ментор не найден")
    s = MentorSession(user_id=user.id, mentor_id=mentor_id, notes=data.notes)
    db.add(s); db.commit(); db.refresh(s)
    return {"id": s.id, "mentor_name": m.name, "mentor_avatar": m.avatar, "status": s.status}


@app.get("/api/sessions")
def get_sessions(user: User = Depends(current_user), db: Session = Depends(get_db)):
    sessions = db.query(MentorSession).filter(MentorSession.user_id == user.id).all()
    result = []
    for s in sessions:
        m = db.query(Mentor).filter(Mentor.id == s.mentor_id).first()
        result.append({
            "id": s.id, "status": s.status, "notes": s.notes,
            "mentor_name":   m.name   if m else "—",
            "mentor_avatar": m.avatar if m else "?",
        })
    return result


@app.delete("/api/sessions/{session_id}")
def cancel_session(session_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    s = db.query(MentorSession).filter(
        MentorSession.id == session_id, MentorSession.user_id == user.id
    ).first()
    if not s:
        raise HTTPException(404, "Сессия не найдена")
    s.status = "cancelled"
    db.commit()
    return {"ok": True}

# ── ONBOARDING ────────────────────────────────────────────────────────────────
@app.post("/api/onboarding")
def onboarding(data: QuizIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    db.add(QuizAnswer(user_id=user.id, answers=json.dumps(data.answers, ensure_ascii=False)))
    a = data.answers
    if "1" in a:  user.exam_subject = a["1"]
    db.commit()
    return {"ok": True, "message": "Персональный план создан!"}

# ── STREAK ────────────────────────────────────────────────────────────────────
@app.post("/api/streak")
def update_streak(user: User = Depends(current_user), db: Session = Depends(get_db)):
    now = datetime.utcnow()
    if user.last_activity:
        diff = (now.date() - user.last_activity.date()).days
        if diff == 1:
            user.streak = (user.streak or 0) + 1
        elif diff > 1:
            user.streak = 1
    else:
        user.streak = 1
    user.last_activity = now
    db.commit()
    return {"streak": user.streak}

# ── PAYMENT ───────────────────────────────────────────────────────────────────
@app.post("/api/payment")
def payment(data: PaymentIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    prices = {"pro": 2990, "mentor+": 5990}
    amount = prices.get(data.plan.lower(), 0)
    if not amount:
        raise HTTPException(400, "Неверный план")
    db.add(Payment(user_id=user.id, plan=data.plan, amount=amount))
    user.plan = data.plan
    db.commit()
    return {"ok": True, "plan": user.plan, "message": f"Подписка {data.plan} активирована!"}


@app.get("/api/subscription")
def subscription(user: User = Depends(current_user)):
    return {"plan": user.plan, "streak": user.streak}

# ── PROFILE ───────────────────────────────────────────────────────────────────
@app.put("/api/profile")
def update_profile(data: ProfileUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    if data.goal_score    is not None: user.goal_score   = data.goal_score
    if data.exam_subject  is not None: user.exam_subject = data.exam_subject
    if data.exam_date     is not None: user.exam_date    = data.exam_date
    db.commit()
    return user_dict(user)

# ── HEALTH ────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {"status": "ok", "service": "StudyBridge API v1.0"}
