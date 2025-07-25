#!/bin/bash

cli_setup=${1:-"true"}

cd "$(git rev-parse --show-toplevel)" || exit 1;
source tests/.env
source tests/scripts/util.sh
if [[ "$cli_setup" == "true" ]]; then
    setup_zkwasm_service_cli
fi
source tests/scripts/pressure_test/session_names.sh

for SESSION in "${SESSIONS[@]}"; do
    if ! tmux has-session -t "$SESSION" 2>/dev/null; then
        tmux new-session -d -s "$SESSION"
    fi

    tmux send-keys -t "$SESSION" "bash tests/scripts/pressure_test/pressure_test.sh" C-m
done

echo "Commands sent to tmux sessions."
