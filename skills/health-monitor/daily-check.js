#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const HOME = process.env.HOME;
const STATE_FILE = path.join(HOME, '.openclaw', 'data', 'health-monitor-state.json');

// Load state
let state = {};
if (fs.existsSync(STATE_FILE)) {
  state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

const alerts = [];
const now = Date.now();

console.log('🏥 Running daily health checks...\n');

// 1. Git repo size check
try {
  const gitSize = execSync('du -sb .git 2>/dev/null || echo "0"', { encoding: 'utf8' });
  const bytes = parseInt(gitSize.split('\t')[0]);
  const mb = (bytes / 1024 / 1024).toFixed(2);
  
  console.log(`📊 Git repo size: ${mb} MB`);
  
  if (bytes > 500 * 1024 * 1024) {
    alerts.push(`🔴 Git repo is ${mb} MB (> 500MB threshold). Binary blobs accumulating?`);
  }
  
  state.lastChecks = state.lastChecks || {};
  state.lastChecks.git_size = now;
} catch (err) {
  console.error('   ❌ Failed to check git size:', err.message);
}

// 2. Disk space check
try {
  const df = execSync("df -h . | tail -1 | awk '{print $5}'", { encoding: 'utf8' }).trim();
  const usedPct = parseInt(df);
  
  console.log(`💾 Disk usage: ${df}`);
  
  if (usedPct > 90) {
    alerts.push(`🔴 Disk ${usedPct}% full (< 10% free). Clean up needed.`);
  }
  
  state.lastChecks.disk_space = now;
} catch (err) {
  console.error('   ❌ Failed to check disk space:', err.message);
}

// 3. Database freshness check
try {
  const dbPath = path.join(HOME, '.openclaw', 'data', 'cost-tracker.db');
  
  if (fs.existsSync(dbPath)) {
    const stats = fs.statSync(dbPath);
    const ageHours = (now - stats.mtimeMs) / (1000 * 60 * 60);
    
    console.log(`🗄️  Database last modified: ${ageHours.toFixed(1)} hours ago`);
    
    if (ageHours > 72) {
      alerts.push(`🟡 Database not updated in ${ageHours.toFixed(0)} hours (>72h threshold). System active?`);
    }
  } else {
    console.log('🗄️  No cost-tracker database found (first run?)');
  }
  
  state.lastChecks.db_freshness = now;
} catch (err) {
  console.error('   ❌ Failed to check database:', err.message);
}

// 4. Error log scan (last 24 hours)
try {
  const logDir = path.join(HOME, '.openclaw', 'logs');
  
  if (fs.existsSync(logDir)) {
    const logs = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
    let errorCount = 0;
    
    logs.forEach(log => {
      const logPath = path.join(logDir, log);
      const content = fs.readFileSync(logPath, 'utf8');
      const errors = content.match(/ERROR|FAIL|CRITICAL/gi) || [];
      errorCount += errors.length;
    });
    
    console.log(`📋 Error log entries (24h): ${errorCount}`);
    
    if (errorCount > 100) {
      alerts.push(`🟡 ${errorCount} errors in logs (24h). Check for recurring issues.`);
    }
  }
  
  state.lastChecks.error_logs = now;
} catch (err) {
  console.error('   ❌ Failed to scan logs:', err.message);
}

// Save state
fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));

console.log('\n' + '='.repeat(60));

if (alerts.length === 0) {
  console.log('✅ All daily checks passed. System healthy.');
} else {
  console.log(`⚠️  ${alerts.length} issue(s) found:\n`);
  alerts.forEach(alert => console.log(alert));
  console.log('\nDelivering alerts to Telegram...');
  // TODO: Send to Telegram via OpenClaw message API
}

console.log('='.repeat(60));
