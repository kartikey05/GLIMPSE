#!/bin/sh
# Activate Python virtual environment
echo ==================================
echo Starting Celery Workers
echo ==================================

. .env/bin/activate
# Run celery_workers
celery -A app.celery worker -l info
