import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as si from "systeminformation";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

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
                description: "Get current CPU and Memory usage of the host machine.",
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

            return {
                content: [
                    {
                        type: "text",
                        text: JSON.stringify({
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
                            } : "Not running/Not found"
                        }, null, 2),
                    },
                ],
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
