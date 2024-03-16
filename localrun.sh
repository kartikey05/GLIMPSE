#!/bin/sh
# Activate Python virtual environment
echo ==================================
echo Starting Flask Application
echo ==================================
. .env/bin/activate
# Run app.py
python app.py
