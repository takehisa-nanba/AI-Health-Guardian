import * as vscode from 'vscode';
import * as si from 'systeminformation';

let statusBarItem: vscode.StatusBarItem;
let isGuardianMode = false;

export function activate(context: vscode.ExtensionContext) {
    if (process.platform !== 'win32') {
        vscode.window.showInformationMessage('AI Health Guardian is currently optimized for Windows (WSL2 management). Key features may not be available on your OS.');
    }
    console.log('Antigravity Optimizer is now active');

    // ステータスバー項目の作成
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'antigravity-optimizer.showMenu';
    context.subscriptions.push(statusBarItem);

    // 定期的なリソースチェック
    const timer = setInterval(() => updateStatusBarItem(), 5000);
    context.subscriptions.push({ dispose: () => clearInterval(timer) });

    // メインメニュー
    let menuDisposable = vscode.commands.registerCommand('antigravity-optimizer.showMenu', async () => {
        const mem = await si.mem();
        const availableGB = mem.available / 1024 / 1024 / 1024;

        const guardianLabel = isGuardianMode ? '🛡️ Guardian Mode: ON' : '🛡️ Guardian Mode: OFF';
        const options = [
            '🔄 Refresh Now',
            guardianLabel,
            '🧹 Quick Cleanup (WSL Shutdown)',
            '🚀 Clear Large Processes',
            '✨ Cleanup Project Junk'
        ];

        const selection = await vscode.window.showQuickPick(options, {
            placeHolder: `Health: ${availableGB.toFixed(2)}GB free. What should Antigravity do?`
        });

        if (selection === guardianLabel) {
            isGuardianMode = !isGuardianMode;
            vscode.window.showInformationMessage(`Guardian Mode is now ${isGuardianMode ? 'ENABLED. I will watch your back!' : 'DISABLED.'}`);
            updateStatusBarItem();
        } else if (selection === '🧹 Quick Cleanup (WSL Shutdown)') {
            await cleanupWSL();
        } else if (selection === '🚀 Clear Large Processes') {
            await cleanupProcesses();
        } else if (selection === '✨ Cleanup Project Junk') {
            await cleanupProjectJunk();
        } else if (selection === '🔄 Refresh Now') {
            updateStatusBarItem();
        }
    });

    context.subscriptions.push(menuDisposable);
    updateStatusBarItem();
}

async function cleanupWSL() {
    vscode.window.showInformationMessage('Cleaning up WSL2...');
    const terminal = vscode.window.createTerminal('AG Optimizer');
    terminal.sendText('wsl --shutdown');
}

async function cleanupProcesses() {
    const processes = await si.processes();
    const topHogs = processes.list
        .filter(p => !p.name.includes('Code') && !p.name.includes('Antigravity'))
        .sort((a, b) => b.memRss - a.memRss)
        .slice(0, 5);

    const items = topHogs.map(p => ({
        label: p.name,
        description: `${(p.memRss / 1024 / 1024).toFixed(0)} MB`,
        pid: p.pid
    }));

    const selection = await vscode.window.showQuickPick(items, { placeHolder: 'Select a process to kill:' });
    if (selection) {
        const terminal = vscode.window.createTerminal('AG Optimizer');
        terminal.sendText(`taskkill /F /PID ${selection.pid} /T`);
        vscode.window.showInformationMessage(`Attempting to kill process: ${selection.label}`);
    }
}

async function cleanupProjectJunk() {
    const junkFiles = [
        "build_error.txt", "mcp_build_error.txt", "procs.txt",
        "top_mem_utf8.txt", "top_mem.txt", "wsl_status.txt",
        "mem_raw.json", "process_list.csv", "test-mem.js"
    ];

    const terminal = vscode.window.createTerminal('AG Optimizer');
    terminal.sendText(`del ${junkFiles.join(", ")}`);
    vscode.window.showInformationMessage('Tidying up development logs and temporary files.');
}

async function updateStatusBarItem() {
    try {
        const [mem, processes] = await Promise.all([si.mem(), si.processes()]);
        const availableGB = mem.available / 1024 / 1024 / 1024;
        const totalGB = mem.total / 1024 / 1024 / 1024;
        const freePercentage = (mem.available / mem.total) * 100;

        // ガーディアンモードの自律動作
        if (isGuardianMode && availableGB < 0.6) {
            const vmmem = processes.list.find(p => p.name.toLowerCase().includes('vmmem'));
            if (vmmem) {
                const terminal = vscode.window.createTerminal('AG Guardian');
                terminal.sendText('wsl --shutdown');
                vscode.window.showWarningMessage('Guardian Mode: Auto-shutdown WSL2 to prevent system freeze!');
            }
        }

        let status = '🟢';
        let color = '#4ade80';

        if (availableGB < 0.8) { status = '🔥'; color = '#ef4444'; }
        else if (availableGB < 1.5) { status = '🔴'; color = '#f87171'; }
        else if (availableGB < 2.5) { status = '🟡'; color = '#fbbf24'; }

        const modeBadge = isGuardianMode ? '🛡️' : '';
        statusBarItem.text = `${modeBadge}${status} AG: ${availableGB.toFixed(1)}GB`;

        // ツールチップに詳細を表示
        const vmmem = processes.list.find(p => p.name.toLowerCase().includes('vmmem'));
        const vmmemGB = vmmem ? vmmem.memRss / 1024 / 1024 / 1024 : 0;
        let tooltip = `Available: ${availableGB.toFixed(2)}GB / ${totalGB.toFixed(1)}GB (${freePercentage.toFixed(1)}% free)`;
        if (vmmemGB > 0) {
            tooltip += `\nWSL2 (vmmem): ${vmmemGB.toFixed(2)}GB`;
        }
        statusBarItem.tooltip = tooltip;
        statusBarItem.color = color;
        statusBarItem.show();

    } catch (error) {
        console.error('Error updating resource monitor:', error);
    }
}

export function deactivate() { }
