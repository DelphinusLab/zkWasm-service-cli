node dist/index.js resetimage \
    -r "service-endpoint" \
    -u "user_address" \
    -x "private_key" \
    -i "Image MD5" \
    -c 22 \
    --creator_paid_proof true|false \
    --creator_only_add_prove_task true|false \
    --auto_submit_network_ids 97 11001 314

# Example:
# node dist/index.js resetimage \
#     -r "http://localhost:8108" \
#     -u "0x000000..." \
#     -x "00000000..." \
#     -i "D2144252F3C9DDCA5CA86C23D2EE97E9" \
#     -c 22 \
#     --creator_paid_proof false \
#     --creator_only_add_prove_task false \
#     --auto_submit_network_ids 97 42 100
