# 🛡️ Antigravity Environment Optimizer & Guardian

**"Empower AI agents on every machine, regardless of specs."**

This project is a high-performance optimization suite designed for AI agents like Antigravity. It enables AI agents to autonomously monitor, manage, and protect their host machine's resources, making it possible to run advanced agentic workflows even on hardware with limited RAM (e.g., 8GB/16GB).

## 🌟 Why this matters

AI agents are powerful but resource-hungry. They open multiple browser instances, run complex builds, and index large codebases. On standard machines, this often leads to system freezes.

**This tool changes that.** It gives the AI "self-awareness" of its physical constraints and the tools to fix resource issues before they happen.

## 🚀 Key Features

### 1. 🛡️ Guardian Mode (VS Code Extension)
- **Real-time Monitoring**: Visual memory health status in your VS Code status bar.
- **Autonomous Protection**: Automatically shuts down memory-heavy WSL2 or background processes when free RAM drops below a critical threshold (e.g., 600MB).
- **One-Click Cleanup**: Manual triggers to free up 2GB+ of RAM instantly.

### 2. 🧠 MCP (Model Context Protocol) Integration
- **Sensory Organs for AI**: Provides tools like `get_resource_status` so the AI can check its own "health" before performing heavy tasks.
- **Self-Healing Capability**: Allows the AI agent to proactively run `cleanup_memory` when it senses the machine is struggling.

### 3. ⚙️ WSL2 Optimization
- **The "Vmmem" Tamer**: Specialized logic to manage and limit WSL2 memory consumption, ensuring your Windows host stays responsive.

## 🛠️ Installation

### 1. VS Code Extension
- Downlaod `antigravity-optimizer-x.x.x.vsix`
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

## 📜 Environment Optimization Script
We also provide a standalone `extreme-clean.bat` for emergency recovery. It's designed to clear over 2GB of RAM in seconds by terminating non-essential development overhead.

---

*Developed with ❤️ by Antigravity & its human collaborator to democratize AI agent accessibility.*
