# zkwasm-service-helper CLI Application

The `zkwasm-service-cli` is a command-line interface application that provides functionalities to interact with the `zkwasm` cloud service. This application can be executed using the `node` command.

## Usage

Install dependancies:

```bash
npm install
```

Then the application can be executed using the following command:

```bash
node dist/index.js <command> <options>
```

To view the available options, execute the following:

```bash
node dist/index.js --help
```

To view the available options for each command, execute the following:

```bash
node dist/index.js <command> --help
```

## Commands

- [addimage](#command-addimage)
- [resetimage](#command-resetimage)
- [addprovingtask](#command-addprovingtask)
- [adddeploytask](#command-adddeploytask)
- [addpayment](#command-addpayment)
- [pressuretest](#command-pressuretest)
- [querytask](#command-querytask)

## Command: addimage

Add a new wasm image.

### Usage

```
node dist/index.js addimage \
    -r <resturl> \
    -u <address> \
    -x <priv> \
    -p <path> \
    [-n <name>] \
    [-d <description>] \
    [-c <circuit_size>] \
    [--creator_paid_proof <true|false>] \
    [--creator_only_add_prove_task <true|false>] \
    [--auto_submit_network_ids x y z] \
    [--import_data_image <image_md5>]
```

### Example

```
node dist/index.js addimage \
    -r "http://localhost:8108" \
    -u "0x000000..." \
    -x "00000000..." \
    --path "image.wasm" \
    --name "Image name" \
    -d "Image description" \
    -c 22 \
    --creator_paid_proof false \
    --creator_only_add_prove_task false \
    --auto_submit_network_ids 97 42 100 \
    --import_data_image "9E3FD7F8B867F9CAE3494FA76F70E627"
```

### Options

Use the following to display options:

```
node dist/index.js addimage --help
```

The following options are available for the `addimage` command:

```
  -r, --resturl                      The rest url of zkwasm cloud serivce.
                                                             [string] [required]
  -u, --address                      User address which is adding the image
                                                             [string] [required]
  -x, --priv                         The private key of user address.
                                                             [string] [required]
  -p, --path                         Wasm image path         [string] [required]
  -n, --name                         The name of the image (legacy and not used)
                                                          [string] [default: ""]
  -c, --circuit_size                 The circuit size of the image. If not
                                     specified, the default size is 22
                                                          [number] [default: 22]
  -d, --description                  The description of the image. If not
                                     specified, the name will be used   [string]
      --creator_paid_proof           Specify if proofs for this image will be
                                     charged to the creator of the image
                                                      [boolean] [default: false]
      --creator_only_add_prove_task  Specify if proofs for this image are
                                     restricted to only be added by the creator
                                     of the image     [boolean] [default: false]
      --auto_submit_network_ids      List of network ids to automatically submit
                                     proofs to. If not specified, proofs will
                                     not be automatically submitted.
                                                           [array] [default: []]
      --import_data_image            The MD5 in which to inherit merkle data
                                     from                               [string]
```

## Command: resetimage

Add reset image task with the given parameters.

### Usage

```
node dist/index.js resetimage \
    -r <resturl> \
    -u <address> \
    -x <priv> \
    -i <image_md5> \
    [-c <circuit_size>] \
    [--creator_paid_proof <true|false>] \
    [--creator_only_add_prove_task <true|false>] \
    --auto_submit_network_ids x y z
```

### Example

```
node dist/index.js resetimage \
    -r "http://localhost:8108" \
    -u "0x000000..." \
    -x "00000000..." \
    -i "D2144252F3C9DDCA5CA86C23D2EE97E9" \
    -c 22 \
    --creator_paid_proof false \
    --creator_only_add_prove_task false \
    --auto_submit_network_ids 97 42 100
```

### Options

Use the following to display options:

```
node dist/index.js resetimage --help
```

The following options are available for the `resetimage` command:

```
  -r, --resturl                      The rest url of zkwasm cloud serivce.
                                                             [string] [required]
  -u, --address                      User address which is adding the image
                                                             [string] [required]
  -x, --priv                         The private key of user address.
                                                             [string] [required]
  -i, --image                        The MD5 of the wasm image
                                                             [string] [required]
  -c, --circuit_size                 The circuit size of the image. If not
                                     specified, the default size is 22
                                                          [number] [default: 22]
      --creator_paid_proof           Specify if proofs for this image will be
                                     charged to the creator of the image
                                                      [boolean] [default: false]
      --creator_only_add_prove_task  Specify if proofs for this image are
                                     restricted to only be added by the creator
                                     of the image     [boolean] [default: false]
      --auto_submit_network_ids      List of network ids to automatically submit
                                     proofs to. If not specified, proofs will
                                     not be automatically submitted.
                                                           [array] [default: []]
```

## Command: addprovingtask

Add proving task.

### Usage

```
node dist/index.js addprovingtask \
    -r <resturl> \
    -u <address> \
    -x <priv> \
    -i <image> \
    [--public_input <public_input>] \
    [--private_input <private_input>] \
    [--submit_mode <Manual|Auto>]
```

### Example

```
node dist/index.js addprovingtask \
    -r "http://localhost:8108" \
    -u "0x000000..." \
    -x "00000000..." \
    -i "D2144252F3C9DDCA5CA86C23D2EE97E9" \
    --public_input "2:i64 1:i64" \
    --submit_mode "Manual"
```

### Options

Use the following to display options:

```
node dist/index.js addprovingtask --help
```

The following options are available for the `addprovingtask` command:

```
  -r, --resturl        The rest url of zkwasm cloud serivce. [string] [required]
  -u, --address        User address which is adding the image[string] [required]
  -x, --priv           The private key of user address.      [string] [required]
  -i, --image          The MD5 of the wasm image             [string] [required]
      --public_input   public input of the proof, inputs must have format
                       (0x)[0-f]*:(i64|bytes|bytes-packed) and been separated by
                       spaces (eg: 0x12:i64 44:i64 32:i64).             [string]
      --private_input  The private input of the proof. Currently not supported.
                                                                        [string]
      --submit_mode    The submit mode of the proving task. Specify 'Auto' or
                       'Manual'. If not specified, the default is 'Manual'
                                                    [string] [default: "Manual"]
```

## Command: addpayment

Add payment either by creating an new transaction or using a exiting one.

### Usage

```
node dist/index.js addpayment \
     -r <resturl> \
     [-t <tx>] \
     [-p <provider>] \
     [-x <priv>] \
     [-a <amount>]
```

### Example

Existing Tx hash:

```
node dist/index.js addpayment \
    -r "http://localhost:8108" \
    -t "00000000..."
```

New transaction:

```
node dist/index.js addpayment \
    -r "http://localhost:8108" \
    -u "0x000000..." \
    -x "00000000..." \
    -a "0.00001" \
    -p "https://goerli.infura.io/v3/xxxxxxx"
```

### Options

Use the following to display options:

```
node dist/index.js addpayment --help
```

The following options are available for the `addpayment` command:

```
  -r, --resturl   The rest url of zkwasm cloud serivce.      [string] [required]
  -x, --priv      The private key of user address, required only when creating a
                  new transaction                                       [string]
  -p, --provider  The provider to connect to a network, required only when
                  creating a new transaction                            [string]
  -a, --amount    The amount of payment, required only when creating a new
                  transaction                                           [string]
  -t, --tx        The transaction hash. If provided, will use existing
                  transaction hash to add the payment, no other options are
                  required                                              [string]
```

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

## Command: prover-profile

This command will fetch the node statistics from the server and save it to a local `node_statistics_{timestamp}.json` file. If the `--compare-with` option is specified, the command will compare the current node statistics with the specified file and output the differences to the specified `--report-out` file.

We do not require any user information as this is purely querying the server for statistics and optionally comparing them.

If you want to add tasks to force value updates, you can use `addProvingTask` or `pressuretest` commands.

### Usage

```
node dist/index.js prover-profile \
     -r <resturl> \
     --compare-with <file> \
     --report-out <file>
```

### Example

```
node dist/index.js prover-profile \
    -r "http://localhost:8108" \
    --compare-with "compare.json" \
    --report-out "report.json"
```

### Options

Use the following to display options:

```
node dist/index.js prover-profile --help
```

The following options are available for the `prover-profile` command:

```
  -r, --resturl       The rest url of zkwasm cloud serivce.  [string] [required]
      --compare-with  The file to compare the current node statistics with, this
                      option is required if `--report-out` is specified [string]
      --report-out    The file to output the node statistics to, this can be a
                      .json or .csv file, this option is required if
                      `--compare-with` is specified                     [string]
```

## Command: querytask

Query Task with given parameters.

### Usage

```
node dist/index.js querytask \
     -r <resturl> \
     [--task_id <task_id>] \
     [--user_address <user_address>] \
     [--md5 <md5>] \
     [--tasktype <Setup|Prove|Verify|Batch|Deploy|Reset>] \
     [--taskstatus <Pending|DryRunSuccess|Processing|DryRunFailed|Done|Fail|Unprovable|Stale>] \
     [--start <start_n>] \
     [--total <total_n>] \
     [--concise <true|false>] \
     [--verbose <true|false>]
```

### Example

Find most recent 10 finished proof associate with D2144252F3C9DDCA5CA86C23D2EE97E9 image:

```
node dist/index.js querytask \
    -r "http://localhost:8108" \
    --md5 D2144252F3C9DDCA5CA86C23D2EE97E9 \
    --tasktype Prove \
    --taskstatus Done \
    --start 0 \
    --total 10 \
    --concise true
```

### Options

Use the following to display options:

```
node dist/index.js querytask --help
```

The following options are available for the `querytask` command:

```
  -r, --resturl       The rest url of zkwasm cloud serivce.  [string] [required]
      --task_id       Id of the task to query                           [string]
      --user_address  User address of the task to query                 [string]
      --md5           Image MD5 of the task to query                    [string]
      --tasktype      Type of the task to query, options:
                      Setup|Prove|Verify|Batch|Deploy|Reset             [string]
      --taskstatus    Status of the task to query, options: Pending|DryRunSucces
                      s|Processing|DryRunFailed|Done|Fail|Unprovable|Stale
                                                                        [string]
      --start         Number of tasks to skip before counting total number of
                      tasks to output, default is 0        [number] [default: 0]
      --total         Total number of tasks to output, max is 100 and default is
                      1                                    [number] [default: 1]
      --concise       Print concise output or regular, default is false
                                                      [boolean] [default: false]
      --verbose       Enable task to be printed to stdout, default is true
                                                       [boolean] [default: true]
```
