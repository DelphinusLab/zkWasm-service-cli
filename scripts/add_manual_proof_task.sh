node dist/index.js addprovingtask \
    -r "service-endpoint" \
    -u "user_address" \
    -x "private_key" \
    --image "Image MD5" \
    --public_input "3:i64 2:i64" \
    --private_input "5:i64 4:i64" \
    --submit_mode "Manual"
