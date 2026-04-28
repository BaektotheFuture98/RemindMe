from pydantic import BaseModel


class QuizQuestionRead(BaseModel):
    expression: str
    choices: list[str]
    explanation: str


class QuizPreviewRead(BaseModel):
    reminder_id: str
    time: str
    duration_minutes: int
    question_count: int
    questions: list[QuizQuestionRead]
