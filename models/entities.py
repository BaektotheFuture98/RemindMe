from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass
class Reminder:
    id: str
    time: str
    duration_minutes: int
    question_count: int


@dataclass
class MemoryItem:
    id: str
    expression: str
    summary: str
    status: str
    accuracy: int
    source: str
    created_at: datetime


@dataclass
class QuizQuestion:
    expression: str
    choices: list[str]
    answer_index: int
    explanation: str
