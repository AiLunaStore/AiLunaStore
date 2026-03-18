# Dashboard & UI - Phase 4

The Dashboard provides real-time visibility into the Hired AI system, with full integration to NEW Phase 3 components.

## Features

### System Overview
- Overall system health status
- Active workflow count
- Last health check timestamp
- Real-time status updates

### Phase 3 Integration Display
- **Autonomy System**: Current level, trust score, days at level
- **Accountability System**: Scope status, error counts, metrics
- **Safety System**: Emergency status, trust ladder visualization
- **Heartbeat System**: Last run, check status

### Performance Metrics
- Cache hit rate
- Average response time
- Token savings from compression
- API call statistics

### Budget Tracking
- Daily budget usage
- Progress bar visualization
- API call count
- Alert thresholds

### Quick Actions
- Run health check
- Trigger heartbeat
- Check scope
- View logs
- Emergency stop controls

## Usage

### Open Dashboard
```bash
# Open in browser
open /Users/levinolonan/.openclaw/workspace/dashboard/ui/index.html

# Or serve with Python
cd /Users/levinolonan/.openclaw/workspace/dashboard/ui
python -m http.server 8080
# Then open http://localhost:8080
```

### Dashboard API

The dashboard can fetch live data from the system:

```python
from system.monitoring.health_checker import HealthChecker
from system.safety.validator import SafetyValidator
from system.performance.budget import BudgetManager

checker = HealthChecker()
validator = SafetyValidator()
budget = BudgetManager()

# Get health data
health = checker.get_system_health()

# Get Phase 3 status
phase3_status = validator.get_phase3_status()

# Get budget status
budget_status = budget.get_status()
```

## Phase 3 Integration Points

### Trust Level Display
- Reads from `safety/trust/trust-ladder.md`
- Shows current L0-L4 level
- Displays trust score and progress

### Emergency Status
- Checks `safety/emergency/emergency-status.json`
- Shows lock file status
- Provides activate/deactivate controls

### Component Health
- Heartbeat: `autonomy/checks/heartbeat-check.sh`
- Scope: `accountability/scope/scope-check.sh`
- Safety: `safety/emergency/emergency-stop.sh`

## File Structure

```
dashboard/
├── README.md
├── ui/
│   └── index.html          # Main dashboard interface
└── api/                    # API endpoints (future)
    └── routes.py
```

## Customization

### Update Refresh Rate
Edit the JavaScript in `index.html`:
```javascript
// Auto-refresh every 30 seconds
setInterval(updateDashboard, 30000);
```

### Add New Metrics
1. Add HTML element in the appropriate card
2. Update the `systemData` object
3. Update the `updateDashboard()` function

### Change Color Scheme
Edit the CSS variables in the `<style>` section:
```css
:root {
    --primary: #3b82f6;
    --success: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
}
```

---

**Status**: Operational  
**Phase**: 4D - Dashboard & UI  
**Last Updated**: 2026-03-16
