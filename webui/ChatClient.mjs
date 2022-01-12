const ROOMS_DEFAULT_ENDPOINT = '/rooms/default';

export class ChatClient {
    constructor() {
        this._rooms = {};
    }

    async connect() {
        console.log('Connecting...');

        this._upStream = await this._createUpStream();
        this._downStream = await this._createDownStream();
        this._startReadLoop();

        console.log('Connected');
    }

    async joinRoom(roomName, asUser) {
        let room = this._rooms[roomName];

        if (room) {
            room.changeUserName(asUser);
        } else {
            room = this._rooms[roomName] = new ChatRoom(this, roomName, asUser);
        }

        return room;
    }

    _startReadLoop() {
        setTimeout(async () => {
            for await (const chunk of this._downStream) {
                try {
                    const { from, message, room } = this._parseMessage(chunk);
                    this._dispatchMessage(from, message, room);
                } catch (ex) {
                    console.error((ex || { message: 'Failed to handle message.' }).message);
                }
            }
        }, 0);
    }

    _dispatchMessage(from, message, roomName) {
        const room = this._rooms[roomName];

        if (room) {
            room.onMessageReceived(message, from);
        }
    }

    async _createUpStream() {
        const { readable, writable } = new TransformStream();

        await fetch(ROOMS_DEFAULT_ENDPOINT, {
            method: 'POST',
            body: readable,
        });

        return writable;
    }

    async _uploadMessage(from, message, room) {
        // const serialized = JSON.stringify({ from, message, room });
        // const writer = this._upStream.getWriter();
        // await writer.write(serialized);
        // await writer.close();
        // writer.releaseLock();
    }

    async _createDownStream() {
        const response = await fetch(ROOMS_DEFAULT_ENDPOINT);
        const downStream = response.body.pipeThrough(new TextDecoderStream());

        return this._streamAsyncIterator(downStream);
    }

    _parseMessage(serialized) {
        try {
            return JSON.parse(serialized);
        } catch (ex) {
            throw new Error(`Failed to parse raw message.\nReason: ${ex}.`);
        }
    }

    _streamAsyncIterator(stream) {
        const reader = stream.getReader();

        return {
            next() {
                return reader.read();
            },
            return() {
                reader.releaseLock();
                return {};
            },

            [Symbol.asyncIterator]() {
                return this;
            },
        };
    }
}

class ChatRoom {
    constructor(client, roomName, userName) {
        this._client = client;
        this._roomName = roomName;
        this._userName = userName;
        this._listeners = {};
    }

    changeUserName(newUserName) {
        if (this._userName === newUserName) {
            return;
        }

        this._userName = newUserName;
    }

    async sendMessage(message) {
        await this._client._uploadMessage(this._userName, message, this._roomName);
        // In a real app, the message would also have a state. Here, we call onMessageReceived()
        // to add the message to the list, but it would appear in a "send in progress" state.
        this.onMessageReceived(message, this._userName);
    }

    onMessageReceived(message, from) {
        this.dispatchEvent(new CustomEvent('message', {
            detail: { message, from },
        }));
    }

    addEventListener(message, listener) {
        if (!message || !listener) {
            throw new Error('Invalid parameters.');
        }

        let listeners = this._listeners[message];

        if (!listeners) {
            listeners = this._listeners[message] = new Set();
        }

        listeners.add(listener);
    }

    dispatchEvent(event) {
        const listeners = this._listeners[event.type];

        for (let listener of listeners) {
            listener(event);
        }
    }
}
