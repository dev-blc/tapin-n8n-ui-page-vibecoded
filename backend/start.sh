#!/bin/bash

# Activate virtual environment
source venv/bin/activate

# Load environment variables if .env exists
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Start the server
uvicorn server:app --reload --host 0.0.0.0 --port 8001

