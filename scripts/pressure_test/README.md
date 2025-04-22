# zkwasm-service-helper CLI Application Internal commands

## Command: pressuretest

Run pressure test of zkwasm playground: send prove request and query requests in parallel over their respective intervals.

### Usage

```
node dist/index.js pressuretest \
    -r <resturl> \
    -u <address> \
    -x <priv> \
    [--public_input <public_input>] \
    [--private_input <private_input>] \
    --num_prove_tasks <number> \
    --interval_prove_tasks_ms <number> \
    --num_query_tasks <number> \
    --interval_query_tasks_ms <number> \
    --total_time_sec <number>
```

### Example

```
node dist/index.js pressuretest \
    -r "http://localhost:8108" \
    -u "0x000000..." \
    -x "00000000..." \
    -i "D2144252F3C9DDCA5CA86C23D2EE97E9" \
    --public_input "2:i64 1:i64" \
    --num_prove_tasks 1 \
    --interval_prove_tasks_ms 1000 \
    --num_query_tasks 10 \
    --interval_query_tasks_ms 1000 \
    --total_time_sec 10
```

### Options

Use the following to display options:

```
node dist/index.js pressuretest --help
```

The following options are available for the `pressuretest` command:

```
  -r, --resturl                  The rest url of zkwasm cloud serivce.
                                                             [string] [required]
  -u, --address                  The user address which adds the proving task
                                                             [string] [required]
  -x, --priv                     The private key of user address
                                                             [string] [required]
      --public_input             The public input of the proof, inputs must have
                                 format (0x)[0-f]*:(i64|bytes|bytes-packed) and
                                 been separated by spaces (eg: 0x12:i64 44:i64
                                 32:i64).                 [string] [default: ""]
      --private_input            The private input of the proof. Currently not
                                 supported                [string] [default: ""]
      --submit_mode              The submit mode of the proving task. Specify
                                 'Auto' or 'Manual'. If not specified, the
                                 default is 'Manual'[string] [default: "Manual"]
      --num_prove_tasks          Number of prove tasks to run during a single
                                 interval in the pressure test, default is 1
                                                           [number] [default: 1]
      --interval_prove_tasks_ms  Interval (msec) in which to run prove tasks
                                 during pressure test, default is 5000
                                                        [number] [default: 5000]
      --num_query_tasks          Number of query tasks to run during a single
                                 interval in the pressure test, default is 1
                                                           [number] [default: 1]
      --interval_query_tasks_ms  Interval (msec) in which to run query tasks
                                 during pressure test, default is 100
                                                         [number] [default: 100]
      --total_time_sec           Total time of pressure test (sec), default is
                                 10                       [number] [default: 10]
      --verbose                  Enable verbose logging, default is false.
                                                      [boolean] [default: false]
      --image_md5s               List of image md5s (one or more, comma
                                 seperated) to use for prove tasks. Overrides
                                 original behaviour of randomly selectly
                                 available images.                      [string]
      --query_tasks_only         When generating random queries for pressure
                                 test, only generate ones that query 'task'
                                 collection.          [boolean] [default: false]
```
