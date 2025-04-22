node dist/index.js addprovingtask \
    -r "service-endpoint" \
    -u "user_address" \
    -x "private_key" \
    --image "Image MD5" \
    --public_input "input_0 input_1 ..." \
    --submit_mode "Manual"

# Example:
# node dist/index.js addprovingtask \
#     -r "http://localhost:8108" \
#     -u "0x000000..." \
#     -x "00000000..." \
#     -i "D2144252F3C9DDCA5CA86C23D2EE97E9" \
#     --public_input "2:i64 1:i64" \
#     --submit_mode "Manual"
