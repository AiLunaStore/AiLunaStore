# OpenClaw Setup

OpenClaw is a multi-agent orchestration platform that runs as a local daemon on macOS (and other platforms), enabling a persistent AI assistant with skills, sub-agents, and tool integrations. Initial setup involves configuring the workspace structure, installing skills via ClawHub, and connecting companion apps for mobile access. The gateway service runs as a background daemon and exposes a CLI and API for spawning agents and running tasks. It connects to [[GitHub-Management]] for version-controlling workspace configs, and [[Memory-System]] for session persistence.

## See Also
- [[GitHub-Management]]
- [[Memory-System]]
