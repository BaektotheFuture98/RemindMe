# Architecture

## 1. Design Philosophy

이 프로젝트는 관심사의 분리(Separation of Concerns)를 우선합니다. 데이터 소스가 바뀌어도 비즈니스 로직이 크게 흔들리지 않도록 Repository Pattern을 기반으로 설계합니다.

## 2. Directory Structure

```text
REMINDME/
├── backend/
│   ├── api/          # FastAPI Routers (Entry Point)
│   ├── core/         # Configuration & Global Dependencies
│   ├── models/       # Domain/Data Models
│   ├── repositories/ # Data Access Layer (DB/External API)
│   ├── schemas/      # Pydantic Schemas (DTO)
│   ├── services/     # Business Logic (Coordinator)
│   ├── main.py       # FastAPI app entry point
│   └── requirements.txt
├── front/            # HTML/CSS/Vanilla JS frontend
├── docs/             # Project documents
├── AGENT.md
└── README.md
```

## 3. Layer Roles

| Layer | Responsibility | Details |
| --- | --- | --- |
| API (Router) | 요청 접수 및 응답 반환 | HTTP 상태 코드 관리, 스키마 유효성 검사 |
| Service | 핵심 비즈니스 로직 수행 | 여러 Repository를 조합하거나 복잡한 정책 처리 |
| Repository | 데이터 저장소 접근 | 실제 DB 쿼리(CRUD) 수행 및 데이터 추상화 |
| Schema (DTO) | 데이터 교환 규격 | Pydantic을 이용한 입출력 데이터 정의 |

## 4. Data Flow

1. Client Request: FastAPI Router가 요청을 수신합니다.
2. Dependency Injection: Router는 필요한 Service를 주입받아 호출합니다.
3. Business Logic: Service는 로직을 수행하며 필요한 데이터를 Repository에 요청합니다.
4. Data Access: Repository는 DB 또는 임시 저장소에 접근하여 결과를 반환합니다.
5. Response: Router는 Schema에 맞춰 클라이언트에 응답합니다.
