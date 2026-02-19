#!/usr/bin/env node
const db = require('./db');

const args = process.argv.slice(2);
const params = {};
for (let i = 0; i < args.length; i += 2) {
  const key = args[i].replace(/^--/, '').replace(/-/g, '_');
  params[key] = args[i + 1];
}

const stmt = db.prepare(`
  INSERT INTO api_calls (
    timestamp, provider, model, task_type,
    input_tokens, output_tokens, cost_usd,
    user_id, session_id, metadata
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const result = stmt.run(
  params.timestamp || new Date().toISOString(),
  params.provider,
  params.model,
  params.task_type || 'chat',
  parseInt(params.input_tokens) || 0,
  parseInt(params.output_tokens) || 0,
  parseFloat(params.cost) || 0,
  params.user_id || null,
  params.session_id || null,
  params.metadata || null
);

console.log(`✅ Logged API call (ID: ${result.lastInsertRowid})`);
console.log(`   Provider: ${params.provider}/${params.model}`);
console.log(`   Tokens: ${params.input_tokens}in / ${params.output_tokens}out`);
console.log(`   Cost: $${params.cost}`);
