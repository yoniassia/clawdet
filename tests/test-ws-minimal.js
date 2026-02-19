const WebSocket = require('ws');

// Test 1: With full client object (current)
console.log('\n=== Test 1: Full client object with mode:operator ===');
testConnect({
  minProtocol: 3,
  maxProtocol: 3,
  client: {
    id: 'openclaw-control-ui',
    version: '1.0.0',
    platform: 'web',
    mode: 'operator'
  },
  role: 'operator',
  scopes: ['operator.read', 'operator.write'],
  auth: {
    token: '006f2ac102b1e2999ccaf8c7545b484e97aee29974a126e42ddaafb57f07794a'
  }
});

// Test 2: Without mode field
setTimeout(() => {
  console.log('\n=== Test 2: Client object WITHOUT mode field ===');
  testConnect({
    minProtocol: 3,
    maxProtocol: 3,
    client: {
      id: 'openclaw-control-ui',
      version: '1.0.0',
      platform: 'web'
    },
    role: 'operator',
    scopes: ['operator.read', 'operator.write'],
    auth: {
      token: '006f2ac102b1e2999ccaf8c7545b484e97aee29974a126e42ddaafb57f07794a'
    }
  });
}, 3000);

// Test 3: Without client object entirely
setTimeout(() => {
  console.log('\n=== Test 3: WITHOUT client object (only role/scopes/auth) ===');
  testConnect({
    minProtocol: 3,
    maxProtocol: 3,
    role: 'operator',
    scopes: ['operator.read', 'operator.write'],
    auth: {
      token: '006f2ac102b1e2999ccaf8c7545b484e97aee29974a126e42ddaafb57f07794a'
    }
  });
}, 6000);

function testConnect(params) {
  const ws = new WebSocket('ws://65.109.132.127:18789/gateway/');
  
  ws.on('open', () => {
    console.log('WebSocket opened, sending connect...');
    ws.send(JSON.stringify({
      type: 'req',
      id: 'test-' + Date.now(),
      method: 'connect',
      params
    }));
  });
  
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    console.log('Response:', JSON.stringify(msg, null, 2));
    ws.close();
  });
  
  ws.on('error', (err) => {
    console.error('Error:', err.message);
  });
  
  ws.on('close', () => {
    console.log('Connection closed');
  });
}
