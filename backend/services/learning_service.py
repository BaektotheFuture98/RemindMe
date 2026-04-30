from __future__ import annotations

from backend.repositories.learning_repository import InMemoryLearningRepository


class LearningService:
    def __init__(self, repository: InMemoryLearningRepository) -> None:
        self.repository = repository

    def list_reminders(self):
        return self.repository.list_reminders()

    def add_reminder(self, time: str, duration_minutes: int, question_count: int):
        return self.repository.create_reminder(
            time=time,
            duration_minutes=duration_minutes,
            question_count=question_count,
        )

    def list_memories(self):
        return self.repository.list_memories()

    def add_memory(self, expression: str, source: str):
        status = "오늘 추가" if source == "ask" else "직접 추가"
        return self.repository.create_memory(expression=expression, source=source, status=status)

    def quiz_preview(self, reminder_id: str):
        reminder = self.repository.get_reminder(reminder_id)
        if reminder is None:
            return None
        questions = self.repository.sample_quiz(limit=reminder.question_count)
        return {
            "reminder": reminder,
            "questions": questions,
        }
