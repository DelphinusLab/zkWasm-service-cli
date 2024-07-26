# ps aux | grep 'mongod ' | grep oscar | awk 'NR==1 {print $2}' | xargs prlimit -n4096 -p 

npx tsc

# node dist/index.js pressuretest -r "http://127.0.0.1:8108" \
#     -u "0x3552f5E0BFcCF79A87a304e80455b368Af9B56F6" \
#     -x "3c873c694cfbde6f803b428808911d7e55ce7c0d74e71b33f48b1eb7efc519bb" \
#     --public_input "44:i64 32:i64" \
#     --num_prove_tasks 1 \
#     --interval_prove_tasks_ms 5000 \
#     --num_query_tasks 2 \
#     --interval_query_tasks_ms 1000 \
#     --total_time_sec 5 \
#     --verbose false \
#     --query_tasks_only false \
#     --image_md5s "3B33D26AAA8BC64F6AC57534AD8506CA";

node dist/index.js pressuretest -r "http://127.0.0.1:8108" \
    -u "0x3552f5E0BFcCF79A87a304e80455b368Af9B56F6" \
    -x "3c873c694cfbde6f803b428808911d7e55ce7c0d74e71b33f48b1eb7efc519bb" \
    --public_input "44:i64 32:i64" \
    --num_prove_tasks 0 \
    --interval_prove_tasks_ms 20000 \
    --num_query_tasks 1000 \
    --interval_query_tasks_ms 1000 \
    --total_time_sec 3000 \
    --verbose false \
    --query_tasks_only true

# \
#     --image_md5s "3B33D26AAA8BC64F6AC57534AD8506CA";
