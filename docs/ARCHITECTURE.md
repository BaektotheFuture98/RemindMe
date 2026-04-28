1. Design Philosophy이 프로젝트는 관심사의 분리(Separation of Concerns)를 최우선으로 하며, 데이터 소스의 변화에 비즈니스 로직이 영향을 받지 않도록 Repository Pattern을 기반으로 설계되었습니다.

2. Directory Structure애플리케이션 내부는 다음과 같은 계층 구조를 가집니다.

REMINDME/
├── api/          # FastAPI Routers (Entry Point)
├── services/     # Business Logic (Coordinator)
├── repositories/ # Data Access Layer (DB/External API)
├── models/       # Database Models (SQLAlchemy, Beanie 등)
├── schemas/      # Pydantic Schemas (DTO)
└── core/         # Configuration & Global Dependencies

3. Layer RolesLayerResponsibilityDetailsAPI (Router)
요청 접수 및 응답 반환
HTTP 상태 코드 관리, 스키마 유효성 검사
Service핵심 비즈니스 로직 수행
여러 Repository를 조합하거나 복잡한 정책 처리
Repository데이터 저장소 접근실제 DB 쿼리(CRUD) 수행 및 데이터 추상화
Schema (DTO)데이터 교환 규격
Pydantic을 이용한 입출력 데이터 정의

4. Data Flow (Request Lifecycle)
애플리케이션 내부에서 데이터는 다음과 같은 단방향 흐름을 가집니다.
Client Request: FastAPI Router가 요청을 수신합니다.
Dependency Injection: Router는 필요한 Service를 주입받아 호출합니다.Business Logic: Service는 로직을 수행하며 필요한 데이터를 Repository에 요청합니다.
Data Access: Repository는 DB에 접근하여 결과를 엔티티(Model) 형태로 반환합니다.
Transformation: Service는 결과를 Schema로 변환하여 Router에 전달하고, 최종적으로 클라이언트에 응답합니다.
