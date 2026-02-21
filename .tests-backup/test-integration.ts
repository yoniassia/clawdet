#!/usr/bin/env tsx
/**
 * Integration Test Suite for Clawdet
 * Tests the full end-to-end flow: trial → signup → payment → provision
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USERNAME = `testuser_${Date.now()}`;
const TEST_EMAIL = `${TEST_USERNAME}@example.com`;

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration?: number;
}

const results: TestResult[] = [];

// Utility functions
function log(message: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
  const icons = { info: '📋', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`${icons[type]} ${message}`);
}

async function testEndpoint(name: string, url: string, options: RequestInit = {}) {
  const start = Date.now();
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const duration = Date.now() - start;
    const data = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(data)}`);
    }
    
    results.push({ name, passed: true, duration });
    log(`${name} - ${duration}ms`, 'success');
    return { response, data };
  } catch (error) {
    const duration = Date.now() - start;
    const errorMsg = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, error: errorMsg, duration });
    log(`${name} - FAILED: ${errorMsg}`, 'error');
    throw error;
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test Suites
async function testTrialChat() {
  log('\n=== Testing Trial Chat ===', 'info');
  
  // Send 5 messages
  for (let i = 1; i <= 5; i++) {
    await testEndpoint(
      `Trial chat message ${i}/5`,
      `${BASE_URL}/api/trial-chat`,
      {
        method: 'POST',
        body: JSON.stringify({
          message: `Test message ${i}`,
          count: i, // API expects 'count' not 'messageCount'
        }),
      }
    );
    await sleep(500);
  }
  
  // Try 6th message (should fail with limitReached)
  try {
    const { data } = await testEndpoint(
      'Trial chat 6th message (should fail)',
      `${BASE_URL}/api/trial-chat`,
      {
        method: 'POST',
        body: JSON.stringify({
          message: 'Test message 6',
          count: 6,
        }),
      }
    );
    
    if (data.limitReached) {
      log('Trial limit correctly enforced', 'success');
      results.push({ name: 'Trial limit enforcement', passed: true });
    } else {
      log('6th message should have returned limitReached=true', 'error');
      results.push({ name: 'Trial limit enforcement', passed: false, error: 'Limit not enforced' });
    }
  } catch (error) {
    log('Trial limit check failed unexpectedly', 'error');
    results.push({ name: 'Trial limit enforcement', passed: false, error: String(error) });
  }
}

async function testSignupFlow() {
  log('\n=== Testing Signup Flow ===', 'info');
  
  // Test OAuth login endpoint
  const { data: loginData } = await testEndpoint(
    'X OAuth login',
    `${BASE_URL}/api/auth/x/login`,
    { method: 'POST' }
  );
  
  if (!loginData.url) {
    throw new Error('No OAuth URL returned');
  }
  
  // Simulate OAuth callback (mock mode)
  const mockState = 'mock_state';
  const mockCode = 'mock_auth_code_' + Date.now();
  
  // The callback will redirect, so we need to handle it differently
  const start = Date.now();
  const callbackResponse = await fetch(
    `${BASE_URL}/api/auth/x/callback?code=${mockCode}&state=${mockState}&mock=true`,
    { method: 'GET', redirect: 'manual' }
  );
  const duration = Date.now() - start;
  
  // Should get a redirect (3xx)
  if (callbackResponse.status < 300 || callbackResponse.status >= 400) {
    throw new Error(`Expected redirect, got ${callbackResponse.status}`);
  }
  
  // Extract user_session cookie
  const cookies = callbackResponse.headers.get('set-cookie') || '';
  const sessionMatch = cookies.match(/user_session=([^;]+)/);
  const sessionCookie = sessionMatch ? sessionMatch[0] : '';
  
  if (!sessionCookie) {
    throw new Error('No user_session cookie set');
  }
  
  results.push({ name: 'X OAuth callback', passed: true, duration });
  log(`X OAuth callback - ${duration}ms`, 'success');
  log(`Session cookie: ${sessionCookie.substring(0, 100)}...`, 'info');
  
  // Verify session
  await testEndpoint(
    'Session verification',
    `${BASE_URL}/api/auth/me`,
    {
      method: 'GET',
      headers: { Cookie: sessionCookie },
    }
  );
  
  // Complete signup with email
  await testEndpoint(
    'Complete signup',
    `${BASE_URL}/api/signup/complete`,
    {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({
        email: TEST_EMAIL,
        termsAccepted: true,
      }),
    }
  );
  
  return sessionCookie;
}

async function testPaymentFlow(sessionCookie: string) {
  log('\n=== Testing Payment Flow ===', 'info');
  
  // Extract userId from session cookie
  const sessionData = JSON.parse(decodeURIComponent(sessionCookie.split('=')[1].split(';')[0]));
  const userId = sessionData.userId;
  
  // Create mock checkout session
  const { data: checkoutData } = await testEndpoint(
    'Create checkout session',
    `${BASE_URL}/api/payment/create-session`,
    {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    }
  );
  
  if (!checkoutData.checkoutUrl) {
    throw new Error('No checkout URL returned');
  }
  
  log(`Checkout URL: ${checkoutData.checkoutUrl}`, 'info');
  
  // Complete mock payment
  await testEndpoint(
    'Complete mock payment',
    `${BASE_URL}/api/payment/mock-complete`,
    {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({ userId }),
    }
  );
  
  log('Payment marked as complete', 'success');
  
  return userId;
}

async function testProvisioningFlow(sessionCookie: string, userId: string) {
  log('\n=== Testing Provisioning Flow ===', 'info');
  
  // Start provisioning
  const { data: startData } = await testEndpoint(
    'Start provisioning',
    `${BASE_URL}/api/provisioning/start`,
    {
      method: 'POST',
      headers: { Cookie: sessionCookie },
      body: JSON.stringify({ userId }),
    }
  );
  
  if (!startData.status && !startData.message) {
    throw new Error(`Unexpected response from provisioning start: ${JSON.stringify(startData)}`);
  }
  
  log(`Provisioning initiated: ${startData.message || 'Started'}`, 'info');
  
  // Poll provisioning status (max 10 attempts)
  let attempts = 0;
  let status = 'pending';
  
  while (attempts < 10 && status !== 'complete' && status !== 'failed') {
    await sleep(2000);
    attempts++;
    
    const { data: statusData } = await testEndpoint(
      `Check provisioning status (attempt ${attempts})`,
      `${BASE_URL}/api/provisioning/status?userId=${encodeURIComponent(userId)}`,
      {
        method: 'GET',
        headers: { Cookie: sessionCookie },
      }
    );
    
    status = statusData.provisioningStatus;
    log(`Provisioning status: ${status} - ${statusData.message}`, 'info');
    
    if (statusData.instanceUrl) {
      log(`Instance URL: ${statusData.instanceUrl}`, 'success');
    }
  }
  
  if (status === 'complete') {
    log('Provisioning completed successfully!', 'success');
  } else if (status === 'failed') {
    log('Provisioning failed', 'error');
    results.push({ name: 'Provisioning completion', passed: false, error: 'Provisioning failed' });
  } else {
    log(`Provisioning still in progress after ${attempts} attempts`, 'warn');
    results.push({ name: 'Provisioning completion', passed: false, error: 'Timeout' });
  }
}

async function testDatabaseIntegrity() {
  log('\n=== Testing Database Integrity ===', 'info');
  
  const dbPath = join(__dirname, 'data', 'users.json');
  
  if (!existsSync(dbPath)) {
    log('Database file does not exist', 'error');
    results.push({ name: 'Database exists', passed: false, error: 'File not found' });
    return;
  }
  
  try {
    const dbContent = readFileSync(dbPath, 'utf8');
    const db = JSON.parse(dbContent);
    
    log(`Database contains ${Object.keys(db).length} users`, 'info');
    
    // Check for test user
    const testUser = Object.values(db).find((u: any) => u.email === TEST_EMAIL);
    
    if (testUser) {
      log('Test user found in database', 'success');
      results.push({ name: 'User in database', passed: true });
    } else {
      log('Test user not found in database', 'error');
      results.push({ name: 'User in database', passed: false, error: 'User not found' });
    }
  } catch (error) {
    log(`Database read error: ${error}`, 'error');
    results.push({ name: 'Database readable', passed: false, error: String(error) });
  }
}

async function testErrorHandling() {
  log('\n=== Testing Error Handling ===', 'info');
  
  // Test missing email
  try {
    await fetch(`${BASE_URL}/api/signup/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ termsAccepted: true }),
    });
    results.push({ name: 'Missing email validation', passed: false, error: 'No validation' });
  } catch (error) {
    results.push({ name: 'Missing email validation', passed: true });
    log('Missing email correctly rejected', 'success');
  }
  
  // Test unauthorized provisioning
  try {
    await fetch(`${BASE_URL}/api/provisioning/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    results.push({ name: 'Unauthorized provisioning', passed: false, error: 'No auth check' });
  } catch (error) {
    results.push({ name: 'Unauthorized provisioning', passed: true });
    log('Unauthorized provisioning correctly rejected', 'success');
  }
}

async function printSummary() {
  log('\n=== TEST SUMMARY ===', 'info');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  log(`Total tests: ${total}`, 'info');
  log(`Passed: ${passed}`, 'success');
  log(`Failed: ${failed}`, failed > 0 ? 'error' : 'info');
  
  if (failed > 0) {
    log('\nFailed tests:', 'error');
    results.filter(r => !r.passed).forEach(r => {
      log(`  - ${r.name}: ${r.error}`, 'error');
    });
  }
  
  // Save results to file
  const reportPath = join(__dirname, 'test-results.json');
  writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    testUser: TEST_USERNAME,
    results,
    summary: { total, passed, failed },
  }, null, 2));
  
  log(`\nResults saved to: ${reportPath}`, 'info');
  
  return failed === 0;
}

// Main execution
async function main() {
  log('Starting Clawdet Integration Tests', 'info');
  log(`Base URL: ${BASE_URL}`, 'info');
  log(`Test User: ${TEST_USERNAME}`, 'info');
  
  try {
    // Phase 1: Trial Chat
    await testTrialChat();
    
    // Phase 2: Signup & Auth
    const sessionCookie = await testSignupFlow();
    
    // Phase 3: Payment
    const userId = await testPaymentFlow(sessionCookie);
    
    // Phase 4: Provisioning (in mock mode)
    await testProvisioningFlow(sessionCookie, userId);
    
    // Additional checks
    await testDatabaseIntegrity();
    await testErrorHandling();
    
    // Print summary
    const success = await printSummary();
    
    process.exit(success ? 0 : 1);
  } catch (error) {
    log(`\nFatal error: ${error}`, 'error');
    await printSummary();
    process.exit(1);
  }
}

main();
