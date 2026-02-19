#!/usr/bin/env node
/**
 * Check Onboarding Activity
 * Reports signup attempts and their outcomes
 */

const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../logs/onboarding.log');
const STATE_FILE = path.join(__dirname, '../logs/onboarding-last-check.txt');

function readLastCheck() {
  try {
    return fs.readFileSync(STATE_FILE, 'utf8').trim();
  } catch (e) {
    return new Date(0).toISOString(); // Return epoch if no state file
  }
}

function writeLastCheck(timestamp) {
  fs.writeFileSync(STATE_FILE, timestamp);
}

function parseLogLine(line) {
  try {
    return JSON.parse(line);
  } catch (e) {
    return null;
  }
}

function formatEvent(event) {
  const icon = event.success ? '✅' : '❌';
  const user = event.username || event.userId || event.email || 'unknown';
  const time = new Date(event.timestamp).toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false
  });
  
  let details = '';
  if (event.error) {
    details = `\n      Error: ${event.error}`;
  }
  if (event.details) {
    details += `\n      Details: ${JSON.stringify(event.details)}`;
  }
  
  return `  ${icon} ${event.step.padEnd(25)} ${user.padEnd(20)} ${time}${details}`;
}

function analyzeActivity(events) {
  const stats = {
    total: events.length,
    oauth_start: 0,
    oauth_callback_success: 0,
    oauth_callback_failed: 0,
    details_submit_success: 0,
    details_submit_failed: 0,
    payment_complete: 0,
    provisioning_complete: 0,
    errors: []
  };

  events.forEach(event => {
    stats[event.step] = (stats[event.step] || 0) + 1;
    
    if (event.step === 'oauth_callback') {
      if (event.success) stats.oauth_callback_success++;
      else stats.oauth_callback_failed++;
    }
    
    if (event.step === 'details_submit') {
      if (event.success) stats.details_submit_success++;
      else stats.details_submit_failed++;
    }
    
    if (!event.success && event.error) {
      stats.errors.push({
        step: event.step,
        user: event.username || event.userId || event.email,
        error: event.error
      });
    }
  });

  return stats;
}

function main() {
  // Check if log file exists
  if (!fs.existsSync(LOG_FILE)) {
    console.log('No onboarding activity yet (log file not found)');
    return;
  }

  const lastCheck = readLastCheck();
  const now = new Date().toISOString();
  
  // Read all log lines
  const logContent = fs.readFileSync(LOG_FILE, 'utf8');
  const lines = logContent.trim().split('\n').filter(l => l.length > 0);
  
  // Parse and filter events since last check
  const newEvents = lines
    .map(parseLogLine)
    .filter(event => event && event.timestamp > lastCheck);

  if (newEvents.length === 0) {
    console.log('No new onboarding activity since last check');
    console.log(`Last check: ${new Date(lastCheck).toLocaleString()}`);
    return;
  }

  // Report activity
  console.log('\n' + '='.repeat(80));
  console.log(`📊 ONBOARDING ACTIVITY REPORT`);
  console.log(`   Period: ${new Date(lastCheck).toLocaleString()} → ${new Date(now).toLocaleString()}`);
  console.log('='.repeat(80) + '\n');

  console.log(`Found ${newEvents.length} new event(s):\n`);
  
  newEvents.forEach(event => {
    console.log(formatEvent(event));
  });

  // Analyze and show stats
  const stats = analyzeActivity(newEvents);
  
  console.log('\n' + '-'.repeat(80));
  console.log('SUMMARY:');
  console.log('-'.repeat(80));
  console.log(`  OAuth Started:           ${stats.oauth_start || 0}`);
  console.log(`  OAuth Callback Success:  ${stats.oauth_callback_success}`);
  console.log(`  OAuth Callback Failed:   ${stats.oauth_callback_failed}`);
  console.log(`  Details Submit Success:  ${stats.details_submit_success}`);
  console.log(`  Details Submit Failed:   ${stats.details_submit_failed}`);
  console.log(`  Payments Completed:      ${stats.payment_complete || 0}`);
  console.log(`  Provisioning Completed:  ${stats.provisioning_complete || 0}`);
  
  if (stats.errors.length > 0) {
    console.log('\n' + '!'.repeat(80));
    console.log('⚠️  ERRORS ENCOUNTERED:');
    console.log('!'.repeat(80));
    stats.errors.forEach((err, i) => {
      console.log(`\n  ${i + 1}. ${err.step} (${err.user})`);
      console.log(`     ${err.error}`);
    });
  }
  
  console.log('\n' + '='.repeat(80) + '\n');

  // Update last check timestamp
  writeLastCheck(now);
}

main();
