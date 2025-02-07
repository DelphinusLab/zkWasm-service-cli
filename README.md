# zkwasm-service-helper CLI Application

The `zkwasm-service-cli` is a command-line interface application that provides functionalities to interact with the `zkwasm` cloud service. This application can be executed using the `node` command.

## Usage

Install dependencies:

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

All example usages of the cli are available in the [scripts folder](scripts).

## Commands

- [addimage](#command-addimage)
- [resetimage](#command-resetimage)
- [addprovingtask](#command-addprovingtask)
- [addpayment](#command-addpayment)
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
    [-d <description>] \
    [-c <circuit_size>] \
    [--creator_paid_proof <true|false>] \
    [--creator_only_add_prove_task <true|false>] \
    [--auto_submit_network_ids x y z] \
    [--import_data_image <image_md5>]
```

### Examples

- [Add image command with all parameters specified](scripts/add_image.sh)

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
                                             [deprecated] [string] [default: ""]
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
    [--auto_submit_network_ids x y z]
```

### Examples

- [Reset image command with all parameters specified](scripts/reset_image.sh)

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

- [Add proving task command with manual submit mode](scripts/add_manual_proof_task.sh)
- [Add proving task command with auto submit mode](scripts/add_auto_proof_task.sh)

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

### Examples

- [Add payment with new transaction](scripts/add_payment.sh)
- [Add payment using existing transaction hash](scripts/add_payment_with_tx.sh)

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

### Examples

- [Generate prover profile report](scripts/generate_prover_profile_report.sh)
- [Generate current node statistics file](scripts/generate_current_node_stats.sh)

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

- [Query with all parameters specified](scripts/query_task.sh)
- [Find most recent 10 finished proof associate with D2144252F3C9DDCA5CA86C23D2EE97E9 image](scripts/query_prove_done_task.sh)

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

## Command: queryimage

Query Image with given parameters.

### Usage

```
node dist/index.js queryimage \
     -r <resturl> \
     --md5 <Image MD5>
```

### Example

- [Query image with MD5](scripts/query_image.sh)

### Options

Use the following to display options:

```
node dist/index.js queryimage --help
```

The following options are available for the `queryimage` command:

```
  -r, --resturl  The rest url of zkwasm cloud serivce.       [string] [required]
      --md5      MD5 of the image to query                   [string] [required]
```

## Command: queryuser

Query user with given parameters.

### Usage

```
node dist/index.js querytask \
     -r <resturl> \
     --user_address <user_address>
```

### Example

- [Query user with address](scripts/query_user.sh)

### Options

Use the following to display options:

```
node dist/index.js queryuser --help
```

The following options are available for the `queryuser` command:

```
  -r, --resturl       The rest url of zkwasm cloud serivce.  [string] [required]
      --user_address  Address of the user to query           [string] [required]
```

## Command: gettaskexternalhosttable

Get task's external host table file.

### Usage

```
node dist/index.js gettaskexternalhosttable \
     -r <resturl> \
     --task_id <task_id>
```

### Example

- [Get task external host table file](scripts/get_task_external_host_table.sh)

### Options

Use the following to display options:

```
node dist/index.js gettaskexternalhosttable --help
```

The following options are available for the `gettaskexternalhosttable` command:

```
  -r, --resturl  The rest url of zkwasm cloud serivce.       [string] [required]
      --task_id  Id of the task to query                                [string]
```
