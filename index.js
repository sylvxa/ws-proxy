const TARGET = process.env.TARGET || 'http://localhost:8080';
const { WebSocketServer, WebSocket } = require('ws');
const wss = new WebSocketServer({ port: process.env.PORT });

wss.on('connection', function connection(source, req) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;
  let headers = req.headers;
  console.log(`New connection from ${ip}`);
  source.dest = new WebSocket(TARGET, {
    headers: headers
  });

  source.dest.on('message', function message(data) {
    source.send(data);
  });

  source.on('message', async function incoming(data) {
    let attempts = 50;
    while (source.dest.readyState == 0 && attempts > 0) {
      console.log('Waiting for connection...');
      attempts--;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    source.dest.send(data);
  })
});
