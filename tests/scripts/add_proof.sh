#!/bin/bash

cli_setup=${1:-"true"}
mode=${2:-"Manual"}
md5=${3:-"F7D4555F3368026CDA92FB611EB9AEA2"}
pub=${4:-""}
pri=${5:-"0:i64 0:i64"}
context_file=${6:-"None"}
poll=${7:-"true"}

cd "$(git rev-parse --show-toplevel)" || exit 1
source tests/.env
source tests/scripts/util.sh
if [[ "$cli_setup" == "true" ]]; then
    setup_zkwasm_service_cli
fi
echo "Running add $mode proving task test with md5 $md5"

if [[ "$pri" == private_*.txt ]]; then
    priv_input_path="$(dirname "$0")/../inputs/$pri"
    if [[ -f "$priv_input_path" ]]; then
        echo "File being used as private input: $priv_input_path"
        private_input_arg=(--private_input_file "$priv_input_path")
    else
        echo "Private input file not found: $priv_input_path"
        exit 1
    fi
else
    private_input_arg=(--private_input "$pri")
fi

if [[ "$context_file" != "None" ]]; then
    context_file_path="$(dirname "$0")/../inputs/$context_file"
    if [[ -f "$context_file_path" ]]; then
        echo "File being used as private input: $context_file_path"
        context_file_arg=(--context_file "$context_file_path" --input_context_type "Custom")
    else
        echo "Context file not found: $context_file_path"
        exit 1
    fi
else
    context_file_arg=()
fi

output=$(node dist/index.js addprovingtask \
    -r "$SERVER_URL" \
    -u "$USER_ADDRESS" \
    -x "$PRIVATE_KEY" \
    --image "$md5" \
    --public_input "$pub" \
    "${private_input_arg[@]}" \
    "${context_file_arg[@]}" \
    --submit_mode "$mode")

if echo "$output" | grep -q "$PROVE_OK"; then
    id=$(get_id "$output")
    echo "Add proving task success for image $md5 with id $id"
    if [[ "$poll" == "true" ]]; then
        poll_task_until_done "$id"
    fi
else
    echo "Add proving task failure for image $md5"
    exit 1
fi
