from backend.repositories.learning_repository import InMemoryLearningRepository
from backend.services.learning_service import LearningService

repository = InMemoryLearningRepository()
service = LearningService(repository=repository)


def get_learning_service() -> LearningService:
    return service
