import './chat-message.mjs';

class ChatMessageListComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
            </style>
        `;
    }

    appendMessage(message, from) {
        const messageElement = document.createElement('chat-message');
        messageElement.message = message;
        messageElement.from = from;
        this.shadowRoot.appendChild(messageElement);
        messageElement.scrollIntoView();
    }
}

customElements.define('chat-message-list', ChatMessageListComponent);
