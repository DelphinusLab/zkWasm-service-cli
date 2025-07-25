#!/bin/bash

cli_setup=${1:-"true"}
md5=${2:-"F7D4555F3368026CDA92FB611EB9AEA2"}

cd "$(git rev-parse --show-toplevel)" || exit 1;
source tests/.env
source tests/scripts/util.sh
if [[ "$cli_setup" == "true" ]]; then
    setup_zkwasm_service_cli
fi
echo "Running query task test"

output=$(node dist/index.js querytask \
    -r "$SERVER_URL" \
    --md5 "$md5" \
    --tasktype Prove \
    --taskstatus Done \
    --concise true)
if echo "$output" | grep -q "$QUERTY_CONCISE_TASK_OK"; then
    echo "Query concise task success"
    echo "$output"
else
    echo "Query concise task failure"
    exit 1
fi

echo "Running query concise task test"

output=$(node dist/index.js querytask \
    -r "$SERVER_URL" \
    --md5 "$md5" \
    --tasktype Prove \
    --taskstatus Done \
    --concise false)
if echo "$output" | grep -q "$QUERTY_TASK_OK"; then
    echo "Query task success"
    echo "$output"
else
    echo "Query task failure"
    exit 1
fi

echo "Running query image test"

output=$(node dist/index.js queryimage -r "$SERVER_URL" --md5 "$md5")
if echo "$output" | grep -q "$QUERTY_IMAGE_OK"; then
    echo "Query image success"
    echo "$output"
else
    echo "Query image failure"
    exit 1
fi

echo "Running query user test"

output=$(node dist/index.js queryuser -r "$SERVER_URL" --user_address "$USER_ADDRESS")
if echo "$output" | grep -q "$QUERTY_USER_OK"; then
    echo "Query user success"
    echo "$output"
else
    echo "Query user failure"
    exit 1
fi
