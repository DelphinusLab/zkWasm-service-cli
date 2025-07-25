source tests/.env

# Values expected in a successful response of the cli.
IMAGE_OK="Add Image Response"
RESET_OK="Add Reset Image Response"
PROVE_OK="Add Proving task Response"
QUERTY_CONCISE_TASK_OK="Concise Task 0 details"
QUERTY_TASK_OK="Task 0 details"
QUERTY_IMAGE_OK="queryImage Success"
QUERTY_USER_OK="queryUser Success"

setup_zkwasm_service_cli() {
    # && cd "$(git rev-parse --show-toplevel)" \
    # && git submodule update --init \
    # && cd zkWasm-service-cli \
    # && git fetch \
    # && git checkout $ZKWASM_SERVICE_CLI_BRANCH \
    # && git pull origin $ZKWASM_SERVICE_CLI_BRANCH \
    echo "Setting up zkwasm service cli" \
    && npm install &>/dev/null \
    && npm run build &>/dev/null \
    && cd .. || exit 1;
}

get_id() {
    echo "$1" | grep -m 1 "id" | sed -n "s/.*id: '\([^']*\)'.*/\1/p"
}

poll_task_until_done() {
    url="$SERVER_URL/tasklist?id=$1"
    target="\"status\":\"Done\""
    echo "$url"

    while true; do
        resp=$(curl -s "$url")

        if echo "$resp" | grep -q "$target"; then
            echo "Task has finished"
            break
        fi

        echo "Polling until task is done..."
        echo "Response: $resp"
        sleep 5
    done
}
