FROM python:3.11-slim

WORKDIR /app

# Multi-layer caching: copy requirements first and install dependencies
COPY requirements.txt /app/backend/requirements.txt
RUN pip install --upgrade pip && \
    pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend application code
COPY . /app/backend

# Expose backend API port
EXPOSE 8000

ENV PYTHONPATH=/app/backend

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
