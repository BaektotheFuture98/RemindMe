# RemindMe

영어 표현 복습을 위한 프론트엔드 중심 MVP입니다.

## 현재 상태

- `front/`: UI 가이드 기반 단일 페이지 프론트엔드
- `api/`, `services/`, `repositories/`: FastAPI + Service/Repository 골격
- DB 연결 없음 (임시 in-memory 데이터 사용)
- 추후 SQLite 연동 시 Repository 레이어만 교체 가능

## 실행 방법

### 1) 백엔드 + 프론트 정적 제공

```bash
pip install -r requirements.txt
uvicorn main:app --reload
```

브라우저에서 `http://127.0.0.1:8000` 접속

### 2) 프론트만 빠르게 확인

```bash
cd front
python3 -m http.server 4173
```

브라우저에서 `http://127.0.0.1:4173` 접속

## 주요 API

- `GET /api/health`
- `GET /api/reminders`
- `POST /api/reminders`
- `GET /api/memories`
- `POST /api/memories`
- `GET /api/quiz/preview/{reminder_id}`
