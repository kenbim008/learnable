#!/usr/bin/env bash
set -o errexit

echo "Running database migrations..."
python manage.py migrate --noinput

echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind "0.0.0.0:${PORT}" --workers 2 --timeout 120
