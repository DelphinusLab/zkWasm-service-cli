node dist/index.js forcedryrunfailstoreprocess \
    -r "service-endpoint" \
    -x "private_key" \
    --task_ids task_id_0 task_id_1 task_id_2 ... 
    
# Example:
# node dist/index.js forcedryrunfailstoreprocess \
#     -r "http://localhost:8108" \
#     -x "00000000..." \
#     --task_ids 67fb56beecae433e6db45a8f 67fb56beecae433e6db45a8e 67fb56bdecae433e6db45a8d
