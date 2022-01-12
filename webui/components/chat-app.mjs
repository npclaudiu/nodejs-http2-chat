import { ChatClient } from '../ChatClient.mjs';
import './chat-user-info.mjs';
import './chat-message-editor.mjs';
import './chat-message-list.mjs';

class ChatAppComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.initialize();
    }

    async initialize() {
        this.userName = this.generateDefaultUserName();

        this.chatClient = new ChatClient(window.location.origin);
        await this.chatClient.connect();

        this.chatRoom = await this.chatClient.joinRoom('default', this.userName);
        this.chatRoom.addEventListener('message', this.onMessageFromChatRoom);
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>

                :host {
                    display: grid;
                    grid-gap: 0;
                    grid-template-rows: 50px auto 50px;
                    grid-template-columns: auto;
                    grid-template-areas: "header" "content" "footer";
                    width: 100vw;
                    height: 100vh;
                    background-color: #ddd;
                }

                :host > .header {
                    grid-area: header;
                    background-color: #ddd;
                    border-bottom: 1px solid #ccc;
                }

                :host > .content {
                    grid-area: content;
                    background-color: #efefef;
                    /* TODO: Show scrollbar for "overflow-y: auto". */
                    overflow: hidden auto;
                }

                :host > .footer {
                    grid-area: footer;
                    background-color: #fff;
                    border-top: 1px solid #ccc;
                }

                .user-name {
                    margin: 10px;
                }

            </style>

            <header class="header">
                <chat-user-info class="user-name" />
            </header>

            <content class="content">
                <chat-message-list class="chat-message-list" />
            </content>

            <footer class="footer">
                <chat-message-editor class="chat-message-editor" />
            </footer>
        `;

        this.$userInfo = this.shadowRoot.querySelector('.user-name');
        this.$userInfo.name = this.userName;
        this.$userInfo.addEventListener('user-name-change', this.onUserNameChanged);

        this.$chatMessageList = this.shadowRoot.querySelector('.chat-message-list');

        this.$chatMessageEditor = this.shadowRoot.querySelector('.chat-message-editor');
        this.$chatMessageEditor.addEventListener('message', this.onMessageFromEditor);
        this.$chatMessageEditor.focus();
    }

    onUserNameChanged = (event) => {
        this.userName = event.detail;
        this.chatRoom.changeUserName(this.userName);
    };

    generateDefaultUserName() {
        const x = Math.floor(Math.random() * 1000);
        return `johndoe${x}`;
    }

    onMessageFromEditor = (event) => {
        this.chatRoom.sendMessage(event.detail);
    };

    onMessageFromChatRoom = (event) => {
        const { message, from } = event.detail;
        this.$chatMessageList.appendMessage(message, from);
    };
}

customElements.define('chat-app', ChatAppComponent);
