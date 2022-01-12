const http2 = require('http2');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const mime = require('mime-types');

const {
    HTTP2_HEADER_CONTENT_TYPE,
    HTTP2_HEADER_METHOD,
    HTTP2_HEADER_PATH,
    HTTP2_HEADER_STATUS,
    HTTP_STATUS_INTERNAL_SERVER_ERROR,
    HTTP_STATUS_NOT_FOUND,
} = http2.constants;

const PRIVKEY_PATH = path.join(__dirname, 'certificates/localhost-privkey.pem');
const CERT_PATH = path.join(__dirname, 'certificates/localhost-cert.pem');
const PORT = 8443;
const WEBUI_ROOT = "./webui";

async function main() {
    const chatServer = new ChatServer({
        port: PORT,
        key: fs.readFileSync(PRIVKEY_PATH),
        certificate: fs.readFileSync(CERT_PATH),
    });

    await chatServer.start();
}

class ChatServer {
    constructor(options) {
        this._consumers = [];

        options = options || {};

        this._port = options.port;

        this._server = http2.createSecureServer({
            key: options.key,
            cert: options.certificate,
            allowHTTP1: false,
        });

        this._server.on('error', this._onServerError);
        this._server.on('stream', this._onServerStream);
    }

    async start() {
        this._server.listen(this._port);
        console.log(`Chat server listening on port ${this._port}...`);
        this._startBroadcastingTestMessages();
    }

    _startBroadcastingTestMessages() {
        let i = 0;
        setInterval(() => {
            this._broadcastMessage(`Healthcheck ${++i}`, 'System', 'default');
        }, 1_000);
    }

    _onServerError = (err) => {
        console.error(err);
    };

    _onServerStream = (stream, headers) => {
        let reqPath = headers[HTTP2_HEADER_PATH];
        const reqMethod = headers[HTTP2_HEADER_METHOD];

        console.log(`${reqMethod} ${reqPath}`);

        switch (reqPath) {
            case '/rooms/default':
                this._handleRoomsRequest(stream, reqMethod, reqPath);
                break;

            case '/':
                this._handleStaticRequest(stream, reqMethod, '/index.html');
                break;

            default:
                this._handleStaticRequest(stream, reqMethod, reqPath);
                break;
        }
    };

    _handleRoomsRequest(stream, reqMethod, reqPath) {
        stream.respond({
            [HTTP2_HEADER_STATUS]: 200,
            [HTTP2_HEADER_CONTENT_TYPE]: 'text/plain; charset=utf-8',
        });

        switch (reqMethod) {
            case 'GET':
                this._registerConsumer(stream);
                break;

            case 'POST':
                this._registerProducer(stream);
                break;
        }

        // stream.end('endup');
    }

    _registerConsumer(stream) {
        this._consumers.push(stream);
    }

    _registerProducer(stream) {
        stream.setEncoding('utf8');

        stream.on('data', async (chunk) => {
            console.log('chunk uploaded', chunk);
            // this._setupReadable(chunk);
        });

        stream.on('end', () => {
            // try {
            //     const { message, from, room } = JSON.parse(body.join(''));
            //     this._broadcastMessage(message, from, room);
            // } catch (ex) {
            //     console.warn('Dropped invalid message.', body);
            // }
        });
    }

    _setupReadable(readable) {
        const chunks = [];
        const stream = Readable.fromWeb(readable, { objectMode: true });
        // stream.setEncoding('utf8');

        stream.on('data', async (chunk) => {
            chunks.push(chunk);
        });

        stream.on('end', () => {
            try {
                const { message, from, room } = JSON.parse(chunks.join(''));
                this._broadcastMessage(message, from, room);
            } catch (ex) {
                console.warn('Dropped invalid message.', body);
            }
        });
    }

    _handleStaticRequest(stream, reqMethod, reqPath) {
        const fullPath = path.join(WEBUI_ROOT, reqPath);

        const headers = {
            'content-type': mime.lookup(fullPath)
        }

        stream.respondWithFile(fullPath, headers, {
            onError: (error) => this._respondToStreamError(error, stream)
        });
    }

    _broadcastMessage(message, from, room) {
        from = from || 'jdoe';
        room = room || 'default';

        const msg = JSON.stringify({ from, message, room });

        for (let consumer of this._consumers) {
            consumer.write(msg);
        }
    }

    _respondToStreamError(err, stream) {
        console.log(err);
        if (err.code === 'ENOENT') {
            stream.respond({ ":status": HTTP_STATUS_NOT_FOUND });
        } else {
            stream.respond({ ":status": HTTP_STATUS_INTERNAL_SERVER_ERROR });
        }
        stream.end();
    }
}

(async () => {
    await main();
})();
