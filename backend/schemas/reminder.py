from pydantic import BaseModel, Field


class ReminderCreate(BaseModel):
    time: str = Field(..., examples=["08:10"])
    duration_minutes: int = Field(..., ge=1, le=240)
    question_count: int = Field(..., ge=1, le=50)


class ReminderRead(BaseModel):
    id: str
    time: str
    duration_minutes: int
    question_count: int
