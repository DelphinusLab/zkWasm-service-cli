node dist/index.js pressuretest \
    -r "service-endpoint" \
    -u "user_address" \
    -x "private_key" \
    --num_prove_tasks 72 \
    --interval_prove_tasks_ms 1000 \
    --total_time_sec 1 \
    --num_query_tasks 0 \
    --image_md5s "4CB1FBCCEC0C107C41405FC1FB380799" \
    --public_input "3:i64 2:i64" \