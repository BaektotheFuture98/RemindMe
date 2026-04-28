from fastapi import APIRouter, Depends, HTTPException, status

from core.dependencies import get_learning_service
from schemas.memory import MemoryCreate, MemoryRead
from schemas.quiz import QuizPreviewRead, QuizQuestionRead
from schemas.reminder import ReminderCreate, ReminderRead
from services.learning_service import LearningService

router = APIRouter(prefix="/api", tags=["learning"])


@router.get("/health")
def health_check():
    return {"status": "ok"}


@router.get("/reminders", response_model=list[ReminderRead])
def list_reminders(service: LearningService = Depends(get_learning_service)):
    reminders = service.list_reminders()
    return [
        ReminderRead(
            id=reminder.id,
            time=reminder.time,
            duration_minutes=reminder.duration_minutes,
            question_count=reminder.question_count,
        )
        for reminder in reminders
    ]


@router.post("/reminders", response_model=ReminderRead, status_code=status.HTTP_201_CREATED)
def create_reminder(payload: ReminderCreate, service: LearningService = Depends(get_learning_service)):
    reminder = service.add_reminder(
        time=payload.time,
        duration_minutes=payload.duration_minutes,
        question_count=payload.question_count,
    )
    return ReminderRead(
        id=reminder.id,
        time=reminder.time,
        duration_minutes=reminder.duration_minutes,
        question_count=reminder.question_count,
    )


@router.get("/memories", response_model=list[MemoryRead])
def list_memories(service: LearningService = Depends(get_learning_service)):
    memories = service.list_memories()
    return [
        MemoryRead(
            id=memory.id,
            expression=memory.expression,
            summary=memory.summary,
            status=memory.status,
            accuracy=memory.accuracy,
            source=memory.source,
        )
        for memory in memories
    ]


@router.post("/memories", response_model=MemoryRead, status_code=status.HTTP_201_CREATED)
def create_memory(payload: MemoryCreate, service: LearningService = Depends(get_learning_service)):
    memory = service.add_memory(expression=payload.expression, source=payload.source)
    return MemoryRead(
        id=memory.id,
        expression=memory.expression,
        summary=memory.summary,
        status=memory.status,
        accuracy=memory.accuracy,
        source=memory.source,
    )


@router.get("/quiz/preview/{reminder_id}", response_model=QuizPreviewRead)
def get_quiz_preview(reminder_id: str, service: LearningService = Depends(get_learning_service)):
    preview = service.quiz_preview(reminder_id=reminder_id)
    if preview is None:
        raise HTTPException(status_code=404, detail="Reminder not found")

    reminder = preview["reminder"]
    questions = preview["questions"]
    question_items = [
        QuizQuestionRead(
            expression=question.expression,
            choices=question.choices,
            explanation=question.explanation,
        )
        for question in questions
    ]
    return QuizPreviewRead(
        reminder_id=reminder.id,
        time=reminder.time,
        duration_minutes=reminder.duration_minutes,
        question_count=reminder.question_count,
        questions=question_items,
    )
