FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create a startup script that properly handles the PORT variable
RUN echo '#!/bin/bash' > start.sh && \
    echo 'echo "Starting FastAPI app..."' >> start.sh && \
    echo 'echo "PORT: $PORT"' >> start.sh && \
    echo 'if [ -z "$PORT" ]; then PORT=8000; fi' >> start.sh && \
    echo 'echo "Using port: $PORT"' >> start.sh && \
    echo 'python -m uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1' >> start.sh && \
    chmod +x start.sh

# Expose port
EXPOSE 8000

# Start command
CMD ["./start.sh"]
