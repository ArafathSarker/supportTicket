FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requrements.txt .
RUN pip install --no-cache-dir -r requrements.txt

COPY . .

EXPOSE 8000

# Run migrations then serve HTTP + WS from one ASGI process
CMD ["sh", "-c", "python manage.py migrate --no-input && python manage.py seed_demo && uvicorn config.asgi:application --host 0.0.0.0 --port 8000"]
