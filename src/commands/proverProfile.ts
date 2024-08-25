import { Arguments, Argv } from "yargs";
import {
  NodeStatistics,
  NodeStatisticsQueryParams,
  ZkWasmServiceHelper,
} from "zkwasm-service-helper";
import fs from "fs/promises";
import path from "path";

export const command = "prover-profile";
export const desc = "Profile Prover nodes statistics and generate report";

export const builder = (yargs: Argv) => {
  return yargs
    .option("compare-with", {
      describe: "Optional path to a JSON file containing other node statistics",
      type: "string",
    })
    .option("report-out", {
      describe:
        "Output file path for the report. This is only required if 'compare-with' is also provided",
      type: "string",
    });
};

export const handler = async (argv: Arguments) => {
  const restURL = argv.r as string;

  const getNodeStatistics = async () => {
    let helper = new ZkWasmServiceHelper(restURL, "", "");
    let args: NodeStatisticsQueryParams = {
      total: 500,
    };
    let stats = helper
      .queryNodeStatistics(args)
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        console.log("Error fetching Current node statistics", err);
        throw err;
      });

    return stats;
  };

  // Get initial node statistics
  let currentStats: NodeStatistics[] = [];

  try {
    currentStats = await getNodeStatistics();
  } catch (err) {
    console.log("Error fetching Current node statistics", err);
    return;
  }
  console.log("Current node statistics fetched");
  console.log("Saving current node statistics locally");

  await saveNodeStatistics(currentStats, "node_statistics.json");

  console.log("Current node statistics saved locally");
  // Check the compare-with option to load initial statistics from a file
  const compareWith = argv["compare-with"];
  if (compareWith) {
    console.log("Comparing current with previous found at: ", compareWith);
    const statsPath = path.resolve(compareWith as string);
    const prevStats = await loadNodeStatisticsFile(statsPath);

    const report = compareNodeStats(prevStats, currentStats).filter(
      Boolean
    ) as NodeStats[];

    // Write report to file
    const outputPath = path.resolve(argv["report-out"] as string);

    saveReportFile(report, outputPath);

    console.log(`Prover profile report has been saved to ${outputPath}`);
  } else {
    // If no compare-with option is provided, no report will be generated
    console.log("No comparison statistics provided. Exiting...");
  }
};

// save the statistics locally with a timestamp
async function saveNodeStatistics(stats: NodeStatistics[], outFile: string) {
  const rfcdate = new Date().toISOString();
  // append timestamp to the file name
  // Split by '.' and insert timestamp before the last element
  const parts = outFile.split(".");
  const fileName = parts.slice(0, -1).join(".").concat(`_${rfcdate}`);
  const fileExtension = parts[parts.length - 1];
  const statsPath = path.resolve(`${fileName}.${fileExtension}`);

  await fs.writeFile(statsPath, JSON.stringify(stats, null, 2));
}

async function loadNodeStatisticsFile(
  statsPath: string
): Promise<NodeStatistics[]> {
  try {
    const stats = await fs.readFile(statsPath, "utf-8");
    return JSON.parse(stats);
  } catch (err) {
    console.error("Error loading local statistics", err);
    return [];
  }
}

async function saveReportFile(report: NodeStats[], outFile: string) {
  // Check extension of the output file
  const fileExtension = path.extname(outFile).toLowerCase();

  // create a summary of the report

  const summary: Summary = {
    total_nodes: report.length,
    successful_tasks: report.reduce(
      (acc, node) => acc + node.successful_tasks,
      0
    ),
    failed_tasks: report.reduce((acc, node) => acc + node.failed_tasks, 0),
    total_tasks: report.reduce((acc, node) => acc + node.total_tasks, 0),
    timed_out_count: report.reduce(
      (acc, node) => acc + node.timed_out_count,
      0
    ),
    // Nodes with any successful, failed or timed out tasks (active nodes but not necessarily working)
    active_nodes: report.filter(
      (node) =>
        node.successful_tasks > 0 ||
        node.failed_tasks > 0 ||
        node.timed_out_count > 0
    ).length,
    success_task_nodes: report.filter((node) => node.successful_tasks > 0)
      .length,
    failed_task_nodes: report.filter((node) => node.failed_tasks > 0).length,
    timed_out_nodes: report.filter((node) => node.timed_out_count > 0).length,
  };

  if (fileExtension === ".json") {
    const combinedReport = {
      summary,
      report,
    };
    await fs.writeFile(outFile, JSON.stringify(combinedReport, null, 2));
  } else if (fileExtension === ".csv") {
    // Create CSV file, put summary at the top
    const summaryHeaders = Object.keys(summary).join(",");
    const summaryRow = Object.values(summary).join(",");

    const defaultHeaders: NodeStats = {
      address: "",
      successful_tasks: 0,
      failed_tasks: 0,
      total_tasks: 0,
      timed_out_count: 0,
      setup_time_diff: 0,
      proof_time_diff: 0,
    };
    const headers = Object.keys(defaultHeaders).join(",");
    const rows = report.map((row) => Object.values(row).join(","));

    const csv = [summaryHeaders, summaryRow, headers, ...rows].join("\n");

    await fs.writeFile(outFile, csv);
  } else {
    console.error(
      "Unsupported file format. Please use .json or .csv extension."
    );
  }
}

function compareNodeStats(
  initialStats: NodeStatistics[],
  finalStats: NodeStatistics[]
) {
  return finalStats.map((finalNode) => {
    const initialNode = initialStats.find(
      (node) => node.address === finalNode.address
    );
    // we can remove some new nodes that are not in the initial stats
    if (!initialNode) return null;

    const diff: NodeStats = {
      address: finalNode.address,
      successful_tasks:
        finalNode.statistics.successful_tasks -
        initialNode.statistics.successful_tasks,
      failed_tasks:
        finalNode.statistics.failed_tasks - initialNode.statistics.failed_tasks,
      total_tasks:
        finalNode.statistics.total_tasks - initialNode.statistics.total_tasks,
      timed_out_count:
        finalNode.statistics.timed_out_count -
        initialNode.statistics.timed_out_count,
    };

    if (
      finalNode.statistics.setup_timing_stats &&
      initialNode.statistics.setup_timing_stats
    ) {
      diff.setup_time_diff =
        finalNode.statistics.setup_timing_stats.latest_time_taken_secs -
        initialNode.statistics.setup_timing_stats.latest_time_taken_secs;
    }

    if (
      finalNode.statistics.proof_timing_stats &&
      initialNode.statistics.proof_timing_stats
    ) {
      diff.proof_time_diff =
        finalNode.statistics.proof_timing_stats.latest_time_taken_secs -
        initialNode.statistics.proof_timing_stats.latest_time_taken_secs;
    }

    return diff;
  });
}

// Type for saving node statistics locally from CLI
interface NodeStats {
  address: string;
  successful_tasks: number;
  failed_tasks: number;
  total_tasks: number;
  timed_out_count: number;
  setup_time_diff?: number;
  proof_time_diff?: number;
}

interface Summary {
  total_nodes: number;
  successful_tasks: number;
  failed_tasks: number;
  total_tasks: number;
  timed_out_count: number;

  active_nodes: number;
  success_task_nodes: number;
  failed_task_nodes: number;
  timed_out_nodes: number;
}
