#!/bin/bash

# If true will install and build zkwasm service cli, this must be done at least once.
cli_setup=${1:-"true"}

# Json file containing md5 and proof inputs 
json=${2:-"tests/inputs/simple.json"}

# If image needs to be add before proofs are run.
add_image=${3:-"true"}

# If waiting for add image task to complete enabled.
poll_add_image=${4:-"true"}

# If waiting for prove task to complete enabled.
poll_add_prove=${5:-"true"}

if [[ "$add_image" == "true" ]] && [[ "$poll_add_image" == "false" ]]; then
    echo "Adding image enabled must also enable polling for image"
    exit 1;
fi

cd "$(git rev-parse --show-toplevel)" || exit 1
source tests/.env
source tests/scripts/util.sh
if [[ "$cli_setup" == "true" ]]; then
    setup_zkwasm_service_cli
fi
jq --version || (echo "Please install 'jq', e.g. sudo apt install jq" && exit 1)
echo "Running extra test using images"

if [[ "$add_image" == "true" ]]; then
    idx=0
    for md5 in $(jq -r '.tests[].md5' "$json" ); do
        import_data_image=$(jq -r ".tests[$idx].import_data_image // \"None\"" "$json")
        echo "Add/Reset image $md5 ..."
        bash tests/scripts/add_image.sh "false" "tests/wasms/$md5.wasm" "$md5" "$import_data_image" "$poll_add_image" || exit 1
        ((idx++))
    done
fi

jq -c '.tests[]' "$json" | while read -r it; do
    md5=$(echo "$it" | jq -r '.md5')
    pub=$(echo "$it" | jq -r '.pub')
    pri=$(echo "$it" | jq -r '.pri')
    comment=$(echo "$it" | jq -r '.comment')
    context_file=$(echo "$it" | jq -r ".context_file // \"None\"")

    echo "Add proof for $md5 - $comment"
    bash tests/scripts/add_proof.sh "false" "Auto" "$md5" "$pub" "$pri" "$context_file" "$poll_add_prove" || exit 1
done

echo "Finished all tests"
