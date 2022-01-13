# Chat Application Using HTTP/2 Streams

This is an experiment that explores whether [Web Streams](https://web.dev/streams/)
could be used for full duplex streaming instead of
[Web Sockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
in a web application.

It relies on the [`http2`](https://nodejs.org/api/http2.html) implementation in Node.js
for the server and standard web APIs like [fetch()](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
and vanilla web components on the client. The `fetch()` function is used for streaming
as described in [Streaming requests with the fetch API](https://web.dev/fetch-upload-streaming/).

Tested using Node.js 17.3.1 and Google Chrome 97.0.4692.71.

*Please note that this is a quick and dirty experiment and it is still work in progress.
There are currently some issues with the message upload stream.*

## Usage

Clone the repository and install dependencies:

```sh
git clone https://github.com/npclaudiu/nodejs-http2-chat.git
cd nodejs-http2-chat
yarn install
```

Start the server:

```sh
node .
```

Open Chrome:
- Temporarily enable <chrome://flags/#allow-insecure-localhost> and restart the browser. Please remember to disable this flag when done.
- Go to <https://localhost:8443/>.

## Notes

The certificates were generated on MacOS using:

```sh
openssl req -x509 -newkey rsa:2048 -nodes -sha256 \
    -subj '/CN=localhost' -keyout localhost-privkey.pem \
    -out localhost-cert.pem
```

## Things to Improve

### Server

- Extract some kind of `Transport` interface and move the HTTP/2 implementation to
a class like `HTTP2Transport`. This should be generic enough to allow other transport
mechanisms (and maybe an alternative `WSTransport` implementation).
- Switch to TypeScript.

### Client

- The transport mechanism in `ChatClient` should be modularized, like for the server.
Ideally, this should reside in a separate client library.
- Use `template` elements for holding component markup.
