const fs = require('fs');
const https = require('https');
const WebSocket = require('ws');

const server = new https.createServer({
    key: fs.readFileSync('./key.pem', 'utf8'),
    cert: fs.readFileSync('./server.crt', 'utf8')
});
const wss = new WebSocket.Server({server});

wss.on('connection', function connection(ws) {
    ws.on('message', function incoming(message) {
        console.log('received: %s', message);
    });

    ws.send('something');
});

server.listen(8080);
