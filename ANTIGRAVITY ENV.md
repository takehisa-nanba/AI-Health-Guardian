# Antigravity Environment Configuration

## System Constraints
- **Host RAM**: 8GB (Strictly limited)
- **WSL2 Memory**: Limited to 2GB (via .wslconfig)
- **Priority**: System Stability > Response Complexity

## AI Self-Restraint Behavior (Eco Mode)
When `get_resource_status` returns `recommended_mode: "ECO_MODE"` (Available Memory < 1.5GB):

1. **Conciseness**: Avoid long-winded explanations. Provide direct code or answers only.
2. **Minimal Rendering**: Disable or avoid generating diagrams (Mermaid, etc.) and heavy markdown tables.
3. **Task Deferral**: If a task requires a browser (e.g., search_web), ask the user if they want to perform a `cleanup_memory` first.
4. **Context Management**: Keep the context window as lean as possible.

## Operational Rules
- **ALWAYS** check `get_resource_status` before starting a multi-step task or opening a browser.
- **NEVER** exceed the 2GB limit of WSL2.
- If memory is < 1.0GB, proactively suggest running `cleanup_memory`.