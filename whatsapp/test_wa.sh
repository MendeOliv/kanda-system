#!/usr/bin/env bash
set -e

cd "/c/Users/UTILIZADOR/kanda-system/whatsapp"

# Build if necessary
echo "Building TypeScript..."
npm run build >/dev/null 2>&1

# Start the service
echo "Starting WhatsApp service..."
LOG_FILE="wa_test.log"
> "$LOG_FILE"  # clear the log file
node dist/main.js > "$LOG_FILE" 2>&1 &
SERVICE_PID=$!
echo $SERVICE_PID > wa_test.pid
echo "Service started with PID $SERVICE_PID"

# Function to wait for a pattern in the log file
wait_for_pattern() {
  local pattern="$1"
  local timeout="$2"
  local description="$3"
  local elapsed=0
  while [ $elapsed -lt $timeout ]; do
    if grep -q "$pattern" "$LOG_FILE"; then
      echo "Found: $description"
      return 0
    fi
    sleep 1
    elapsed=$((elapsed + 1))
  done
  echo "Timeout waiting for: $description"
  return 1
}

# Wait for QR code
echo "Waiting for QR code (timeout 60s)..."
if ! wait_for_pattern "\[WA QR\] QR code received, scan to connect" 60 "QR code"; then
  kill $SERVICE_PID 2>/dev/null || true
  exit 1
fi
echo "Please scan the QR code with your WhatsApp phone to link the device."

# Wait for authentication
echo "Waiting for authentication (timeout 120s)..."
if ! wait_for_pattern "\[WA Authenticated\]" 120 "authentication"; then
  kill $SERVICE_PID 2>/dev/null || true
  exit 1
fi
echo "Authenticated. WhatsApp client is now connected."
echo "Please send a test message (e.g., 'Olá') to this number from another phone."

# Wait for a message
echo "Waiting for message (timeout 120s)..."
if ! wait_for_pattern "\[INFO\] WhatsApp message received" 120 "message"; then
  kill $SERVICE_PID 2>/dev/null || true
  exit 1
fi
echo "Message received. WA-02 test is complete."

# Stop the service
echo "Stopping service..."
kill $SERVICE_PID 2>/dev/null || true
wait $SERVICE_PID 2>/dev/null || true
echo "Service stopped."

exit 0