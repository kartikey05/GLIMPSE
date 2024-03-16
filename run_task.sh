#!/bin/sh
# Activate Python virtual environment
echo ==================================
echo Starting Celery Task - $1
echo ==================================

. .env/bin/activate
# Run celery_task
celery -A app.celery call application.tasks.$1
