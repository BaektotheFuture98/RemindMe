from repositories.learning_repository import InMemoryLearningRepository
from services.learning_service import LearningService

repository = InMemoryLearningRepository()
service = LearningService(repository=repository)


def get_learning_service() -> LearningService:
    return service
