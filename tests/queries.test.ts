import { CONFIG, USER_ADDRESS, runCLI } from "./util";

describe("zkWasm service CLI query tests", () => {
  test("help command", async () => {
    const res = runCLI(["--help"]);
    expect(res.stdout).toContain("Usage:");
  });

  describe("querytask tests", () => {
    const QUERY_CMD_NAME = "querytask";
    const QUERY_CMD = [QUERY_CMD_NAME, "-r", CONFIG.details.server_url];
    const CMDS = [QUERY_CMD, [...QUERY_CMD, "--concise", "true"]];

    test("querytask help command", async () => {
      const res = runCLI([QUERY_CMD_NAME, "--help"]);
      expect(res.stdout).toContain("Options:");
    });

    test("querytask by task_id", async () => {
      for (const cmd of CMDS) {
        const res = runCLI([...cmd, ...["--task_id", CONFIG.query.task_id]]);
        expect(res.stdout).toContain(
          `_id: { '$oid': '${CONFIG.query.task_id}' }`,
        );
      }
    });

    test("querytask by user_address", async () => {
      for (const cmd of CMDS) {
        const res = runCLI([...cmd, ...["--user_address", USER_ADDRESS]]);
        expect(res.stdout).toContain(`user_address: '${USER_ADDRESS}'`);
      }
    });

    test("querytask by md5", async () => {
      for (const cmd of CMDS) {
        const res = runCLI([...cmd, ...["--md5", CONFIG.query.md5]]);
        expect(res.stdout).toContain(`md5: '${CONFIG.query.md5}'`);
      }
    });

    test("querytask by tasktype", async () => {
      for (const cmd of CMDS) {
        const tasktype = "Prove";
        const res = runCLI([...cmd, ...["--tasktype", tasktype]]);
        expect(res.stdout).toContain(`task_type: '${tasktype}'`);
      }
    });

    test("querytask by taskstatus", async () => {
      for (const cmd of CMDS) {
        const taskstatus = "Done";
        const res = runCLI([...cmd, ...["--taskstatus", taskstatus]]);
        expect(res.stdout).toContain(`status: '${taskstatus}'`);
      }
    });
  });

  describe("queryimage tests", () => {
    const QUERY_CMD_NAME = "queryimage";
    const QUERY_CMD = [QUERY_CMD_NAME, "-r", CONFIG.details.server_url];

    test("queryimage help command", async () => {
      const res = runCLI([QUERY_CMD_NAME, "--help"]);
      expect(res.stdout).toContain("Options:");
    });

    test("queryimage by md5", async () => {
      const res = runCLI([...QUERY_CMD, ...["--md5", CONFIG.query.md5]]);
      expect(res.stdout).toContain(`md5: '${CONFIG.query.md5}'`);
    });
  });

  describe("queryuser tests", () => {
    const QUERY_CMD_NAME = "queryuser";
    const QUERY_CMD = [QUERY_CMD_NAME, "-r", CONFIG.details.server_url];

    test("queryuser help command", async () => {
      const res = runCLI([QUERY_CMD_NAME, "--help"]);
      expect(res.stdout).toContain("Options:");
    });

    test("queryuser by user_address", async () => {
      const res = runCLI([...QUERY_CMD, ...["--user_address", USER_ADDRESS]]);
      expect(res.stdout).toContain(`user_address: '${USER_ADDRESS}'`);
    });
  });

  describe("prover-profile tests", () => {
    test("prover-profile", async () => {
      const res = runCLI(["prover-profile", "-r", CONFIG.details.server_url]);
      expect(res.stdout).toContain("Current node statistics saved locally");
    });
  });

  describe("gettaskexternalhosttable tests", () => {
    test("gettaskexternalhosttable", async () => {
      const res = runCLI([
        "gettaskexternalhosttable",
        "-r",
        CONFIG.details.server_url,
        "--task_id",
        CONFIG.query.task_id,
      ]);
      expect(res.stdout).toContain(
        "External host table file is external_host_table",
      );
    });
  });
});
