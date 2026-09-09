"""NEXUS Backend Configuration."""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "NEXUS Law Enforcement & Intelligence Platform"
    PROJECT_DESCRIPTION: str = (
        "NEXUS Backend API - Prototype Intelligence & Pattern Analysis System. "
        "Powered by Synthetic Investigation Datasets for ethical analysis."
    )
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DEBUG: bool = True
    
    # CORS Origins
    CORS_ORIGINS: str = (
        "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000"
    )
    
    # Database
    DATABASE_URL: str = "sqlite:///./nexus.db"
    
    # Dataset attribution
    DATASET_LABEL: str = "Synthetic Investigation Dataset"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
