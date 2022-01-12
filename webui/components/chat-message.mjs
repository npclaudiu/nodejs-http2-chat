class ChatMessageComponent extends HTMLElement {
    static get observedAttributes() {
        return ['from', /* 'at', 'color', */ 'message'];
    }

    constructor() {
        super();

        this._from = '';
        this._message = '';

        this.attachShadow({ mode: 'open' });
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        if (oldValue !== newValue) {
            this[attrName] = newValue;
        }
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>

            :host {
                display: block;
                width: 100%;
                padding: 10px;
            }
            
            :host(:hover) {
                background-color: #f7f7f7;
            }

            .from {
                font-weight: bold;
            }

            </style>

            <span class="from"></span>:
            <span class="message"></span>
        `;

        this.$from = this.shadowRoot.querySelector('.from');
        this.$from.textContent = this._from;

        this.$message = this.shadowRoot.querySelector('.message');
        this.$message.textContent = this._message;
    }

    get from() {
        return this.$from.textContent;
    }

    set from(value) {
        this._from = value;

        // Setters are also called from attributeChangedCallback() before
        // connectedCallback() has a chance to initialize element references.
        if (this.$from) {
            this.$from.textContent = value;
        }
    }

    get message() {
        return this.$message.textContent;
    }

    set message(value) {
        this._message = value;

        // Setters are also called from attributeChangedCallback() before
        // connectedCallback() has a chance to initialize element references.
        if (this.$message) {
            this.$message.textContent = value;
        }
    }
}

customElements.define('chat-message', ChatMessageComponent);
