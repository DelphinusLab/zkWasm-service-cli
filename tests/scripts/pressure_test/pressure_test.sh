#!/bin/bash

wasm_md5=${1:-"F7D4555F3368026CDA92FB611EB9AEA2"}
pub=${2:-""}
pri=${3:-"0:i64 0:i64"}
mode=${4:-"Manual"}

source tests/.env

node dist/index.js pressuretest \
    -r "$SERVER_URL" \
    -u "$USER_ADDRESS" \
    -x "$PRIVATE_KEY" \
    --image_md5s "$wasm_md5" \
    --public_input "$pub" \
    --private_input "$pri" \
    --submit_mode "$mode" \
    --num_prove_tasks 0 \
    --total_time_sec 3600 \
    --interval_query_tasks_ms 1000 \
    --num_query_tasks 20
