# 🛡️ AI Health Guardian

[![OS: Windows](https://img.shields.io/badge/OS-Windows-green.svg)](https://www.microsoft.com/windows)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Note**: This tool is currently optimized specifically for **Windows** environments, focusing on WSL2 (vmmem) and Windows process management.

<p align="center">
  <img src="resources/icon.png" width="128" alt="AI Health Guardian Icon">
</p>

**"Empower AI agents on every machine, regardless of specs."**

AI Health Guardian is a high-performance optimization suite designed for AI agents. It enables AI agents to autonomously monitor, manage, and protect their host machine's resources, making it possible to run advanced agentic workflows even on hardware with limited RAM (e.g., 8GB/16GB).

---

## 🎨 Our Vision: Making AI care for its environment

<p align="center">
  <img src="resources/vision.png" width="400" alt="AI tidying its room">
</p>

We believe that for AI agents to become true partners in development, they must be aware of their physical constraints. Just as a good roommate tidies up their shared space, **AI Health Guardian** allows your AI to "clean its room"—optimizing memory and closing unnecessary background processes—so you can focus on creativity while the AI handles the housekeeping.

---

## 🚀 Key Features

### 1. 🛡️ Guardian Mode (VS Code Extension)
- **Real-time Monitoring**: Visual memory health status in your VS Code status bar.
- **Autonomous Protection**: Automatically shuts down memory-heavy WSL2 or background processes when free RAM drops below a critical threshold.
- **Freeze Recovery**: A dedicated "Emergency Reset" to kill hanging AI sub-processes without restarting VS Code.
- **Project Tidying**: One-click removal of temporary development logs and junk files.

### 2. 🧠 MCP (Model Context Protocol) Integration
- **Sensory Organs for AI**: Provides tools like `get_resource_status` so the AI can check its own "health" before performing heavy tasks.
- ** 自律的自制 (ECO Mode)**: When memory is low, the AI automatically switches to a lightweight response mode (concise text, no heavy diagrams).
- **Correlation Learning**: The AI logs its resource usage alongside task names, allowing it to "learn" which actions are historically memory-intensive.

### 3. ⚙️ WSL2 Optimization
- **The "Vmmem" Tamer**: Specialized logic to manage and limit WSL2 memory consumption, ensuring your Windows host stays responsive.

## 🛠️ Installation

### 1. VS Code Extension
- Download `antigravity-optimizer-x.x.x.vsix` from the [Releases](https://github.com/takehisa-nanba/AI-Health-Guardian/releases) page.
- In VS Code, go to Extensions -> `...` -> `Install from VSIX`
- Reload VS Code.

### 2. MCP Server (For AI Agents)
Add the following to your MCP configuration (e.g., `mcp_config.json`):

```json
{
  "mcpServers": {
    "antigravity-monitor": {
      "command": "node",
      "args": ["path/to/AI_Presence_Monitor/out/mcp-server.js"]
    }
  }
}
```

## 📜 Environment Optimization Scripts
We also provide:
- `extreme-clean.bat`: Clear 2GB+ of RAM in seconds.
- `optimize-env.ps1`: Automated environment health check.

---

*Developed with ❤️ by Antigravity & its human collaborator to democratize AI agent accessibility.*
