#!/bin/bash

cli_setup=${1:-"true"}
wasm=${2:-"wasms/equality.wasm"}
md5=${3:-"F7D4555F3368026CDA92FB611EB9AEA2"}
import_data_image=${4:-"None"}
poll=${5:-"true"}

cd "$(git rev-parse --show-toplevel)" || exit 1
source tests/.env
source tests/scripts/util.sh
if [[ "$cli_setup" == "true" ]]; then
    setup_zkwasm_service_cli
fi
echo "Running add image test with path $wasm and md5 $md5"

if [[ "$import_data_image" != "None" ]]; then
    if [[ "$import_data_image" == *[[:space:]]* ]]; then
        echo "Malformed 'import_data_image' $import_data_image, should be an image MD5!"
        exit 1
    fi
    import_data_image_arg=(--import_data_image "$import_data_image")
else
    import_data_image_arg=()
fi

output=$(node dist/index.js addimage \
    -r "$SERVER_URL" \
    -u "$USER_ADDRESS" \
    -x "$PRIVATE_KEY" \
    --path "$wasm" \
    -d "Test CLI $wasm Image description" \
    -c 22 \
    --creator_paid_proof false \
    --creator_only_add_prove_task false \
    "${import_data_image_arg[@]}" \
    --auto_submit_network_ids "$CHAIN_IDS")

if echo "$output" | grep -q "Image with md5 .*$md5.* already exists"; then
    echo "Reset required for image $md5"

    output=$(node dist/index.js resetimage \
        -r "$SERVER_URL" \
        -u "$USER_ADDRESS" \
        -x "$PRIVATE_KEY" \
        --image "$md5" \
        -c 22 \
        --creator_paid_proof false \
        --creator_only_add_prove_task false \
        --auto_submit_network_ids "$CHAIN_IDS")

    if echo "$output" | grep -q "$RESET_OK"; then
        id=$(get_id "$output")
        echo "Reset success for image $md5 with id $id"
        if [[ "$poll" == "true" ]]; then
            poll_task_until_done "$id"
        fi
    else
        echo "Reset failure for image $md5"
        exit 1
    fi

else
    if echo "$output" | grep -q "$IMAGE_OK"; then
        id=$(get_id "$output")
        echo "Add image success for image $md5 with id $id"
        if [[ "$poll" == "true" ]]; then
            poll_task_until_done "$id"
        fi
    else
        echo "Add image failure for image $md5"
        exit 1
    fi
fi
