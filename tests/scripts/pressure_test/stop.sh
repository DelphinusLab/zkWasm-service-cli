#!/bin/bash

cd "$(git rev-parse --show-toplevel)" || exit 1;
source tests/scripts/pressure_test/session_names.sh

for SESSION in "${SESSIONS[@]}"; do
    if tmux has-session -t "$SESSION" 2>/dev/null; then
        tmux kill-session -t "$SESSION"
        echo "Killed tmux session: $SESSION"
    else
        echo "Tmux session $SESSION not found."
    fi
done
