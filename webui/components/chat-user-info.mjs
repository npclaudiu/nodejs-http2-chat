class ChatUserInfoComponent extends HTMLElement {
    static get observedAttributes() {
        return ['name'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    attributeChangedCallback(attrName, oldValue, newValue) {
        switch (attrName) {
            case 'name':
                if (oldValue !== newValue) {
                    this[attrName] = newValue;
                }
                break;

            default:
                // throw new Error('Unhandled attribute change.'); // TODO: Check if this is correct.
                break;
        }
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>

            :host {
                display: inline-block;
            }

            .header-input {
                padding: 5px;
                border: 1px solid #ccc;
            }

            </style>

            <label>
                User name:
                <input class="header-input user-name-input" />
            </label>

            <label>
                Room:
                <input class="header-input room-input" disabled value="default" />
            </label>
        `;

        this.$userNameInput = this.shadowRoot.querySelector('.user-name-input');

        this.$userNameInput.addEventListener('keyup', this.onUserNameChanged);
    }

    disconnectedCallback() {
        this.$userNameInput.removeEventListener('keyup', this.onUserNameChanged);
    }

    onUserNameChanged = (event) => {
        this.name = event.target.value;
    };

    get name() {
        return this.$userNameInput.value;
    }

    set name(value) {
        this.$userNameInput.value = value;
        this.dispatchUserNameChangeEvent();
    }

    dispatchUserNameChangeEvent() {
        this.dispatchEvent(new CustomEvent('user-name-change', {
            detail: this.name,
        }));
    }
}

customElements.define('chat-user-info', ChatUserInfoComponent);
