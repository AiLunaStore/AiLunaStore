# Troubleshooting Guide

## Common Issues and Solutions

### Server Won't Start

**Issue:** `Error: EADDRINUSE` (Port already in use)

**Solution:**
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=8081 npm start
```

---

### WebSocket Connection Fails

**Issue:** Dashboard shows "Disconnected" or connection errors

**Solutions:**

1. **Check server is running:**
   ```bash
   curl http://localhost:8080/api/health
   ```

2. **Verify WebSocket URL in settings:**
   - Open Settings view
   - Check WebSocket URL matches your server
   - Default: `ws://localhost:8080/ws`

3. **Check firewall/proxy:**
   - Ensure port 8080 is not blocked
   - Check corporate proxy settings

4. **Browser console errors:**
   - Open browser DevTools (F12)
   - Check Console for CORS errors
   - Verify `CORS_ORIGINS` in .env includes your origin

---

### High Memory Usage

**Issue:** Server using too much memory

**Solutions:**

1. **Reduce history size:**
   ```env
   MAX_HISTORY_SIZE=1000
   ```

2. **Enable log rotation:**
   - Logs are in `logs/` directory
   - Set up logrotate or similar

3. **Restart periodically:**
   ```bash
   # Using PM2
   pm2 restart mission-control --cron "0 0 * * *"
   ```

---

### Budget Alerts Not Working

**Issue:** Not receiving budget threshold notifications

**Solutions:**

1. **Check alert configuration:**
   ```env
   BUDGET_ALERT_THRESHOLDS=0.5,0.8,0.95
   ```

2. **Verify budget is set:**
   - Check Dashboard for budget display
   - Ensure DEFAULT_BUDGET is set correctly

3. **Check browser notifications:**
   - Allow notifications for the site
   - Check browser notification settings

---

### Slow Task Execution

**Issue:** Tasks taking longer than expected

**Solutions:**

1. **Switch to Speed strategy:**
   - Use the "Speed" strategy in dashboard
   - Or set `EXECUTION_MODE=speed` in .env

2. **Check model latency:**
   - View Performance tab
   - Identify slow models

3. **Reduce complexity:**
   - Break large tasks into smaller ones
   - Lower complexity rating

---

### CORS Errors

**Issue:** `Access-Control-Allow-Origin` errors in browser

**Solution:**

Edit `.env` to include your origin:
```env
CORS_ORIGINS=http://localhost:3000,http://localhost:8081,https://yourdomain.com
```

Restart the server after changes.

---

### Configuration Errors

**Issue:** `Failed to load config` or validation errors

**Solutions:**

1. **Validate configuration:**
   ```bash
   npm run validate
   ```

2. **Check JSON syntax:**
   ```bash
   # Validate all JSON files
   for file in config/*.json; do
     echo "Checking $file"
     node -e "JSON.parse(require('fs').readFileSync('$file'))"
   done
   ```

3. **Reset to defaults:**
   ```bash
   git checkout config/
   # Or re-extract from deployment package
   ```

---

### Desktop App Connection Issues

**Issue:** Desktop app can't connect to server

**Solutions:**

1. **Check server URL in app:**
   - Open Settings in desktop app
   - Verify Server URL matches your backend

2. **Check server is accessible:**
   ```bash
   curl http://localhost:8080/api/health
   ```

3. **Firewall settings:**
   - Allow the desktop app through firewall
   - Check macOS/Windows security settings

---

## Getting Help

If issues persist:

1. **Check logs:**
   ```bash
   tail -f logs/combined.log
   tail -f logs/error.log
   ```

2. **Enable debug mode:**
   ```env
   NODE_ENV=development
   LOG_LEVEL=debug
   ```

3. **Create an issue:**
   - Include log output
   - Describe steps to reproduce
   - Include environment details (OS, Node version)

## Performance Tuning

### For High Traffic

```env
# Increase rate limits
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=60

# Increase max connections
# (edit server.js WebSocketServer options)
```

### For Low Memory

```env
# Reduce history
MAX_HISTORY_SIZE=100

# Disable detailed logging
LOG_LEVEL=error
```

### For Development

```env
NODE_ENV=development
LOG_LEVEL=debug
CORS_ORIGINS=*
```
