const WebSocket = require('ws');
// const fs = require('fs');
// const https = require('https');

class WebsocketService {
    constructor(port) {
        // const server = new https.createServer({
        //     key: fs.readFileSync('/etc/letsencrypt/live/rawbot.org/privkey.pem', 'utf8'),
        //     cert: fs.readFileSync('/etc/letsencrypt/live/rawbot.org/fullchain.pem', 'utf8')
        // });
        // this.wss = new WebSocket.Server({server});
        this.wss = new WebSocket.Server({ port: port });
        // server.listen(port);
    }

    broadcast(data) {
        this.wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }

    handleEvents() {
        this.wss.on('connection', function connection(ws) {
        });
    }
}

module.exports = WebsocketService;