import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as si from "systeminformation";
import { exec } from "child_process";
import { promisify } from "util";

import * as fs from "fs";
import * as path from "path";

const execAsync = promisify(exec);
const LOG_FILE = path.join(process.cwd(), "resource_history.csv");

/**
 * ログに記録する関数
 */
function logResource(data: any, taskName: string = "idle") {
    const timestamp = new Date().toISOString();
    const row = `${timestamp},"${taskName}",${data.memory.availableGB},${data.cpu.currentLoadPercent},${data.wsl2.consumingMB || 0}\n`;
    if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, "timestamp,task,availableGB,cpuLoad,wsl2MB\n");
    }
    fs.appendFileSync(LOG_FILE, row);
}

const server = new Server(
    {
        name: "antigravity-monitor",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

/**
 * マシンのリソース状況を取得するツール
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_resource_status",
                description: "Get current machine status. Pass task_name to correlate usage with actions.",
                inputSchema: {
                    type: "object",
                    properties: {
                        task_name: { type: "string", description: "What the AI is doing right now" }
                    },
                },
            },
            {
                name: "analyze_usage_history",
                description: "Analyze stored history to find which tasks are memory-heavy.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "cleanup_dev_junk",
                description: "Remove temporary logs and dev files (e.g., build_error.txt) to keep the project clean.",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "cleanup_memory",
                description: "Forcefully terminate heavy background processes like WSL2 or Browsers to free up memory.",
                inputSchema: {
                    type: "object",
                    properties: {
                        target: {
                            type: "string",
                            enum: ["wsl", "browsers", "all"],
                            description: "What to cleanup"
                        }
                    },
                    required: ["target"]
                },
            },
        ],
    };
});

/**
 * ツールの実行実体
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    switch (request.params.name) {
        case "get_resource_status": {
            const mem = await si.mem();
            const cpu = await si.currentLoad();
            const processes = await si.processes();

            const vmmem = processes.list.find(p => p.name.toLowerCase().includes('vmmem'));

            const status = {
                memory: {
                    totalGB: (mem.total / 1024 / 1024 / 1024).toFixed(2),
                    availableGB: (mem.available / 1024 / 1024 / 1024).toFixed(2),
                    freePercent: ((mem.available / mem.total) * 100).toFixed(1)
                },
                cpu: {
                    currentLoadPercent: cpu.currentLoad.toFixed(1)
                },
                wsl2: vmmem ? {
                    consumingMB: (vmmem.memRss / 1024 / 1024).toFixed(0)
                } : { consumingMB: 0 },
                recommended_mode: mem.available < 1024 * 1024 * 1024 * 1.5 ? "ECO_MODE" : "STANDARD"
            };

            logResource(status, (request.params.arguments?.task_name as string) || "check");

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify(status, null, 2),
                    },
                ],
            };
        }

        case "analyze_usage_history": {
            if (!fs.existsSync(LOG_FILE)) {
                return { content: [{ type: "text", text: "No history yet." }] };
            }
            const history = fs.readFileSync(LOG_FILE, "utf8");
            return {
                content: [{ type: "text", text: "Past Resource Usage Correlation:\n" + history }],
            };
        }

        case "cleanup_dev_junk": {
            const junkFiles = [
                "build_error.txt", "mcp_build_error.txt", "procs.txt",
                "top_mem_utf8.txt", "top_mem.txt", "wsl_status.txt",
                "mem_raw.json", "process_list.csv", "test-mem.js"
            ];
            const killed = [];
            for (const f of junkFiles) {
                const target = path.join(process.cwd(), f);
                if (fs.existsSync(target)) {
                    fs.unlinkSync(target);
                    killed.push(f);
                }
            }
            return {
                content: [{ type: "text", text: `Project tidied up! Removed: ${killed.join(", ") || "None found."}` }],
            };
        }

        case "cleanup_memory": {
            const target = request.params.arguments?.target;
            let commands = [];

            if (target === "wsl" || target === "all") {
                commands.push("wsl --shutdown");
            }
            if (target === "browsers" || target === "all") {
                commands.push("taskkill /F /IM msedge.exe /T");
                commands.push("taskkill /F /IM chrome.exe /T");
            }

            const results = [];
            for (const cmd of commands) {
                try {
                    await execAsync(cmd);
                    results.push(`Success: ${cmd}`);
                } catch (e) {
                    results.push(`Failed or No process: ${cmd}`);
                }
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `Cleanup finished for target: ${target}\n${results.join('\n')}`,
                    },
                ],
            };
        }

        default:
            throw new Error("Unknown tool");
    }
});

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

main().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
});
