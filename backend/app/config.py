from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
   DATABASE_URL: str = "postgresql+asyncpg://postgres:Manoj1606%40@localhost:5432/novacart"   
   JWT_SECRET: str = "super-secret-key-change-in-production-123456"
   ALGORITHM: str = "HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

   model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()
