const VK_ENTER = 13;

class ChatMessageEditorComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>

                :host {
                    position: relative;
                    display: inline-block;
                    margin: 0;
                    padding: 0;
                    width: 100%;
                    height: 100%;
                }

                .message-input {
                    display: inline-block;
                    box-sizing: border-box;
                    margin: 0;
                    padding: 5px;
                    width: 100%;
                    height: 100%;
                    border: 0;
                }

                .send-button {
                    position: absolute;
                    right: 10px;
                    top: 10px;
                    border: 0;
                    padding: 8px;
                    color: #fff;
                    background-color: #007ce7;
                }

            </style>

            <input class="message-input" />
            <button class="send-button">Send</button>
        `;

        this.$messageInput = this.shadowRoot.querySelector('.message-input');
        this.$messageInput.addEventListener('keyup', this.onMessageInputKeyUp);

        this.$sendButton = this.shadowRoot.querySelector('.send-button');
        this.$sendButton.addEventListener('click', this.onSendMessageButtonClick);
    }

    disconnectedCallback() {
        this.$messageInput.removeEventListener('keyup', this.onMessageInputKeyUp);
    }

    onMessageInputKeyUp = (event) => {
        // TODO: Use KeyboardEvent.
        if (event.keyCode === VK_ENTER) {
            event.preventDefault();
            this.sendMessage();
        }
    };

    onSendMessageButtonClick = (event) => {
        this.sendMessage();
    };

    sendMessage() {
        // TODO: Disable button before sending the message, and re-enable it when done.
        this.dispatchMessageEvent(this.value);
        this.value = '';
    }

    dispatchMessageEvent(message) {
        this.dispatchEvent(new CustomEvent('message', {
            detail: message,
        }));
    }

    get value() {
        return this.$messageInput.value;
    }

    set value(value) {
        this.$messageInput.value = value;
    }

    focus() {
        this.$messageInput.focus();
    }
}

customElements.define('chat-message-editor', ChatMessageEditorComponent);
