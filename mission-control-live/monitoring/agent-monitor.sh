#!/bin/bash
# OpenClaw Agent Monitor
# Collects agent status data from OpenClaw sessions and subagents

set -e

# Configuration
API_URL="http://localhost:8080"
UPDATE_INTERVAL=5
LOG_FILE="${LOG_FILE:-/tmp/agent-monitor.log}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if OpenClaw is available
check_openclaw() {
    if ! command -v openclaw &> /dev/null; then
        log "${RED}Error: openclaw command not found${NC}"
        return 1
    fi
    return 0
}

# Get active sessions
get_sessions() {
    if check_openclaw; then
        openclaw sessions_list --json 2>/dev/null || echo "[]"
    else
        echo "[]"
    fi
}

# Get subagents
get_subagents() {
    if check_openclaw; then
        openclaw subagents --json 2>/dev/null || echo "[]"
    else
        echo "[]"
    fi
}

# Calculate metrics
calculate_metrics() {
    local sessions="$1"
    local subagents="$2"
    
    local total_sessions=$(echo "$sessions" | jq 'length')
    local total_subagents=$(echo "$subagents" | jq 'length')
    local total=$((total_sessions + total_subagents))
    
    echo "Total agents: $total (Sessions: $total_sessions, Subagents: $total_subagents)"
}

# Send data to API
send_to_api() {
    local data="$1"
    
    if command -v curl &> /dev/null; then
        curl -s -X POST "$API_URL/api/agents/update" \
            -H "Content-Type: application/json" \
            -d "$data" 2>/dev/null || true
    fi
}

# Monitor mode - continuous updates
monitor() {
    log "${GREEN}Starting agent monitor...${NC}"
    log "Update interval: ${UPDATE_INTERVAL}s"
    log "API endpoint: $API_URL"
    
    while true; do
        local sessions=$(get_sessions)
        local subagents=$(get_subagents)
        
        clear
        echo "========================================"
        echo "   OpenClaw Agent Monitor"
        echo "========================================"
        echo ""
        
        calculate_metrics "$sessions" "$subagents"
        
        echo ""
        echo "--- Active Sessions ---"
        echo "$sessions" | jq -r '.[] | "  \(.id // "unknown"): \(.status // "unknown")"' 2>/dev/null || echo "  No sessions"
        
        echo ""
        echo "--- Active Subagents ---"
        echo "$subagents" | jq -r '.[] | "  \(.id // "unknown"): \(.status // "unknown")"' 2>/dev/null || echo "  No subagents"
        
        echo ""
        echo "Press Ctrl+C to exit"
        
        sleep "$UPDATE_INTERVAL"
    done
}

# Single snapshot mode
snapshot() {
    local sessions=$(get_sessions)
    local subagents=$(get_subagents)
    
    echo "{"
    echo "  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\","
    echo "  \"sessions\": $sessions,"
    echo "  \"subagents\": $subagents"
    echo "}"
}

# Health check
health_check() {
    if command -v curl &> /dev/null; then
        local response=$(curl -s "$API_URL/api/health" 2>/dev/null)
        if [ -n "$response" ]; then
            echo "$response" | jq .
        else
            log "${RED}API server not responding${NC}"
            exit 1
        fi
    else
        log "${YELLOW}curl not available, skipping health check${NC}"
    fi
}

# Usage information
usage() {
    cat << EOF
OpenClaw Agent Monitor

Usage: $0 [command] [options]

Commands:
    monitor     Continuous monitoring mode (default)
    snapshot    Get single snapshot of agent data
    health      Check API server health
    help        Show this help message

Environment Variables:
    API_URL         API server URL (default: http://localhost:8080)
    UPDATE_INTERVAL Update interval in seconds (default: 5)
    LOG_FILE        Log file path (default: /tmp/agent-monitor.log)

Examples:
    $0 monitor                    # Start continuous monitoring
    $0 snapshot                   # Get single data snapshot
    API_URL=http://localhost:3000 $0 health  # Check custom API endpoint

EOF
}

# Main
case "${1:-monitor}" in
    monitor)
        monitor
        ;;
    snapshot)
        snapshot
        ;;
    health)
        health_check
        ;;
    help|--help|-h)
        usage
        exit 0
        ;;
    *)
        log "${RED}Unknown command: $1${NC}"
        usage
        exit 1
        ;;
esac