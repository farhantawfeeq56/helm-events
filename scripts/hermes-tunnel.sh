#!/bin/bash
# Opens an SSH tunnel to the Hermes Bridge API on the remote server.
# Run this in a separate terminal before `npm run dev`.
#
# The bridge API runs on port 3001 on the remote server (not exposed publicly).
# This tunnel forwards localhost:3001 → remote:3001 over SSH.

KEY="${HERMES_SSH_KEY:-$HOME/Downloads/login.pem}"
HOST="${HERMES_SSH_HOST:-ubuntu@100.50.19.205}"

echo "Starting SSH tunnel: localhost:3001 → $HOST:3001"
echo "Press Ctrl+C to stop."
echo ""

# -N: no remote command  -L: local port forward  -o: keep alive
ssh -N \
  -L 3001:localhost:3001 \
  -i "$KEY" \
  -o StrictHostKeyChecking=no \
  -o ServerAliveInterval=30 \
  -o ServerAliveCountMax=3 \
  "$HOST"
