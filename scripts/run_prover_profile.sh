# This command will fetch the node statistics in memory, run the prover profile, and output the differences after the last task completes to the specified file.

node dist/index.js prover-profile \
    -r "service-endpoint" \
    -u "user-address" \
    -x "private-key" \
    --num_prove_tasks 3 \
    --md5 "35ACD03548C2C5AC09F9A01362EEE069" \
    --public_input "3:i64 3:i64" \
    --submit_mode "Manual" \
    --out "prover_profile.csv" # or prover_profile.json