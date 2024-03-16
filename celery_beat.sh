#!/bin/sh
# Activate Python virtual environment
echo ==================================
echo Starting Celery Beat
echo ==================================

. .env/bin/activate
# Run celery_beat
celery -A app.celery beat --max-interval 1 -l info
