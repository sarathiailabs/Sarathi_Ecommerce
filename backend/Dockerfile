FROM python:3.11-slim

WORKDIR /backend

# Install system dependencies needed for building packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make the start script executable if it exists
RUN chmod +x start.sh || true

EXPOSE 8000

CMD ["sh", "-c", "alembic upgrade head || python -c 'import asyncio; from app.database import init_db; asyncio.run(init_db())' && python -m app.seed && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
