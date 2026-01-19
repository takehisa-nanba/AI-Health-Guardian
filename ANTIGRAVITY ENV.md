# Antigravity Environment Config

- **Machine Spec**: Low (8GB RAM / Core i5-U)
- **Current Status**: 🟡 WARNING (Memory around 1GB)
- **Self-Restriction Rules**:
  1. DO NOT open heavy browser subagents unless necessary.
  2. Use `read_url_content` instead of `open_browser_url` where possible.
  3. Proactively suggest closing other apps if free memory < 800MB.