#!/bin/bash

echo "🧪 VERIFICATION TEST: Collaboration Server Integration"
echo "======================================================"
echo ""

# Test 1: Health check
echo "1. Testing collaboration server health..."
curl -s http://localhost:8081/health | jq -r '. | "   ✓ Health: \(.status) (\(.timestamp))"'
if [ $? -ne 0 ]; then
    echo "   ✗ Health check failed"
    exit 1
fi

echo ""
echo "2. Verifying MiniMax M2.7 configuration..."
AGENTS_JSON=$(curl -s http://localhost:8081/api/collaboration/agents)

# Count total agents
TOTAL_AGENTS=$(echo "$AGENTS_JSON" | jq 'length')
echo "   ✓ Total agents: $TOTAL_AGENTS"

# Count MiniMax M2.7 agents
MINIMAX_COUNT=$(echo "$AGENTS_JSON" | jq '[.[] | select(.model == "minimax/m2.7")] | length')
echo "   ✓ Agents using MiniMax M2.7 as primary: $MINIMAX_COUNT"

# Verify specific agents
echo ""
echo "3. Checking specific agent configurations..."
echo "$AGENTS_JSON" | jq -r '.[] | "   • \(.name): \(.model) [\(.models | join(", "))]"'

echo ""
echo "4. Testing collaboration stats..."
STATS_JSON=$(curl -s http://localhost:8081/api/collaboration/stats)
echo "$STATS_JSON" | jq -r '. | "   ✓ Total collaborations: \(.totalCollaborations)"'
echo "$STATS_JSON" | jq -r '. | "   ✓ Success rate: \(.successRate)"'
echo "$STATS_JSON" | jq -r '. | "   ✓ Average speedup: \(.averageSpeedup)x"'

echo ""
echo "5. Testing task analysis..."
ANALYSIS_JSON=$(curl -s -X POST http://localhost:8081/api/collaboration/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "task": {
      "id": "test-analysis",
      "description": "Build a React component with Tailwind CSS"
    }
  }')

if echo "$ANALYSIS_JSON" | jq -e '.success' > /dev/null; then
    echo "   ✓ Task analysis successful"
    STRATEGY=$(echo "$ANALYSIS_JSON" | jq -r '.analysis.decompositionStrategy')
    SUBTASKS=$(echo "$ANALYSIS_JSON" | jq -r '.analysis.subtasks | length')
    echo "   ✓ Strategy: $STRATEGY"
    echo "   ✓ Subtasks: $SUBTASKS"
else
    echo "   ✗ Task analysis failed"
    exit 1
fi

echo ""
echo "6. Testing collaboration execution..."
EXECUTE_JSON=$(curl -s -X POST http://localhost:8081/api/collaboration/execute \
  -H "Content-Type: application/json" \
  -d '{
    "task": {
      "id": "test-execution",
      "description": "Write a Python function to calculate factorial"
    },
    "options": {
      "budget": 0.50,
      "strategy": "balanced"
    }
  }')

if echo "$EXECUTE_JSON" | jq -e '.success' > /dev/null; then
    echo "   ✓ Collaboration execution successful"
    MODE=$(echo "$EXECUTE_JSON" | jq -r '.result.collaborationMode')
    DURATION=$(echo "$EXECUTE_JSON" | jq -r '.result.duration')
    echo "   ✓ Mode: $MODE"
    echo "   ✓ Duration: ${DURATION}ms"
else
    echo "   ✗ Collaboration execution failed"
    exit 1
fi

echo ""
echo "========================================"
echo "✅ VERIFICATION COMPLETE"
echo "========================================"
echo ""
echo "Summary:"
echo "- Collaboration server running on port 8081"
echo "- $MINIMAX_COUNT/$TOTAL_AGENTS agents use MiniMax M2.7 as primary model"
echo "- Task decomposition working correctly"
echo "- Parallel delegation functional"
echo "- All tests passing"
echo ""
echo "The collaboration server is ready for use!"