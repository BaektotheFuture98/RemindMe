from __future__ import annotations

from datetime import datetime

from models.entities import MemoryItem, QuizQuestion, Reminder


class InMemoryLearningRepository:
    """
    Temporary repository for UI development.
    Replace this class with SQLite/PostgreSQL implementation later.
    """

    def __init__(self) -> None:
        self._reminder_counter = 2
        self._memory_counter = 4
        self._reminders: list[Reminder] = [
            Reminder(id="r1", time="08:10", duration_minutes=10, question_count=5),
            Reminder(id="r2", time="12:30", duration_minutes=30, question_count=15),
        ]
        self._memories: list[MemoryItem] = [
            MemoryItem(
                id="m1",
                expression="call it a day",
                summary="오늘 할 일을 마무리하다",
                status="다시 볼 표현",
                accuracy=61,
                source="ask",
                created_at=datetime.utcnow(),
            ),
            MemoryItem(
                id="m2",
                expression="break the ice",
                summary="어색한 분위기를 풀다",
                status="안정권",
                accuracy=78,
                source="manual",
                created_at=datetime.utcnow(),
            ),
            MemoryItem(
                id="m3",
                expression="on the same page",
                summary="같은 이해를 공유하다",
                status="오늘 추가",
                accuracy=0,
                source="ask",
                created_at=datetime.utcnow(),
            ),
            MemoryItem(
                id="m4",
                expression="be tied up",
                summary="일정이 꽉 차 있다",
                status="다시 볼 표현",
                accuracy=44,
                source="ask",
                created_at=datetime.utcnow(),
            ),
        ]
        self._quiz_bank: list[QuizQuestion] = [
            QuizQuestion(
                expression="call it a day",
                choices=["오늘 일을 마무리하다", "오래 쉬다", "하루 종일 걷다", "일을 새로 시작하다"],
                answer_index=0,
                explanation="오늘 계획한 업무를 끝내고 정리한다는 뜻이에요.",
            ),
            QuizQuestion(
                expression="break the ice",
                choices=["약속을 취소하다", "냉정을 잃다", "어색함을 풀다", "시간을 벌다"],
                answer_index=2,
                explanation="처음 만난 자리에서 긴장을 풀 때 쓰는 표현이에요.",
            ),
            QuizQuestion(
                expression="be tied up",
                choices=["묶여 있다", "일정이 바쁘다", "성공을 확정하다", "숨이 막히다"],
                answer_index=1,
                explanation="일이 많아 시간을 내기 어렵다는 의미로 자주 써요.",
            ),
            QuizQuestion(
                expression="on the same page",
                choices=["같은 책을 읽다", "같은 생각을 공유하다", "메모를 잃어버리다", "다시 검토하다"],
                answer_index=1,
                explanation="같은 맥락을 이해하고 있다는 뜻입니다.",
            ),
        ]

    def list_reminders(self) -> list[Reminder]:
        return list(self._reminders)

    def create_reminder(self, time: str, duration_minutes: int, question_count: int) -> Reminder:
        self._reminder_counter += 1
        reminder = Reminder(
            id=f"r{self._reminder_counter}",
            time=time,
            duration_minutes=duration_minutes,
            question_count=question_count,
        )
        self._reminders.append(reminder)
        return reminder

    def get_reminder(self, reminder_id: str) -> Reminder | None:
        for reminder in self._reminders:
            if reminder.id == reminder_id:
                return reminder
        return None

    def list_memories(self) -> list[MemoryItem]:
        return sorted(self._memories, key=lambda item: item.created_at, reverse=True)

    def create_memory(self, expression: str, source: str, status: str) -> MemoryItem:
        self._memory_counter += 1
        memory = MemoryItem(
            id=f"m{self._memory_counter}",
            expression=expression,
            summary=f"{expression} 관련 뜻/예문 생성 대기",
            status=status,
            accuracy=0,
            source=source,
            created_at=datetime.utcnow(),
        )
        self._memories.append(memory)
        return memory

    def sample_quiz(self, limit: int) -> list[QuizQuestion]:
        return list(self._quiz_bank[:limit])
