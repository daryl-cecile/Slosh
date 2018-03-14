class UITextBox extends SloshBaseUI {
    constructor() {
        super();
        this.selectionStart = new Slosh.Selection();
        this.content = "";
        // set up events
        this.addEventListener('click', (ev) => {
            this.processClick(ev);
            SloshEventEmitter.trigger('click', ev);
        });
        this.addEventListener('keydown', (ev) => {
            this.processInput(ev);
            SloshEventEmitter.trigger('keypress', ev);
        });
    }
    connectedCallback() {
        this.invalidate();
    }
    static get observedAttributes() {
        return ['value', 'placeholder', 'hint', 'style'];
    }
    get lines() {
        return this.content.split('\n');
    }
    processInput(ev) {
        this.invalidate();
    }
    processClick(ev) {
        this.invalidate();
    }
    render() {
    }
}
customElements.define('ui-textbox', UITextBox);
