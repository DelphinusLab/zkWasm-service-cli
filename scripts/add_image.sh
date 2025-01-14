node dist/index.js addimage \
    -r "service-endpoint" \
    -u "user_address" \
    -x "private_key" \
    --path "image.wasm" \
    --name "Image name"
    
# Optional: add this param to import merkle data from image by specifying md5
# --import_data_image "9E3FD7F8B867F9CAE3494FA76F70E627"
