from pydantic import BaseModel, Field


class MemoryCreate(BaseModel):
    expression: str = Field(..., min_length=1, max_length=240)
    source: str = Field(default="manual", pattern="^(ask|manual)$")


class MemoryRead(BaseModel):
    id: str
    expression: str
    summary: str
    status: str
    accuracy: int
    source: str
