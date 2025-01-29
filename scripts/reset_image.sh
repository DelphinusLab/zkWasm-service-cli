node dist/index.js addimage \
    -r "service-endpoint" \
    -u "user_address" \
    -x "private_key" \
    --image "Image MD5" \
    --creator_paid_proof true|false \
    --creator_only_add_prove_task true|false \
    --auto_submit_network_ids "1, 2, 3" 
