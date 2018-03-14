var Slosh;
(function (Slosh) {
    class CoreElement extends HTMLElement {
    }
    Slosh.CoreElement = CoreElement;
    class Selection {
        constructor(start = 0, length = 0) {
            this.start = 0;
            this.length = 0;
            this.start = start;
            this.length = length;
        }
        bind(iElement) {
            this.inputElement = iElement;
        }
        tidy() {
            let s = new Selection();
            if (this.length < 0) {
                s.start = this.start + this.length;
                s.length = Math.abs(this.length);
            }
            else {
                s.start = this.start;
                s.length = this.length;
            }
            s.inputElement = this.inputElement;
            return s;
        }
        get beamIndex() {
            return this.start;
        }
        set beamIndex(v) {
            if (this.inputElement) {
                let maxInd = this.inputElement.content.length;
                if (v > maxInd)
                    v = maxInd;
                if (v < 0)
                    v = 0;
            }
            this.start = v;
            this.length = 0;
        }
    }
    Slosh.Selection = Selection;
})(Slosh || (Slosh = {}));
class SloshEvent {
    constructor(opt = {}) {
        this.eventHandler = () => { };
        this.called = false;
        this.once = false;
        Object.keys(opt).forEach(k => {
            this[k] = opt[k];
        });
    }
    handle(...params) {
        if (this.once && this.called)
            return;
        this.eventHandler.apply(this, params);
        this.called = true;
    }
}
class SloshEventEmitter extends Slosh.CoreElement {
    setBase(bUI) {
        this.baseUI = bUI;
    }
    on(eventName, handler) {
        if (!SloshEventEmitter.RegisteredEvents[eventName])
            SloshEventEmitter.RegisteredEvents[eventName] = [];
        SloshEventEmitter.RegisteredEvents[eventName].push(new SloshEvent({
            eventName: eventName,
            element: this.baseUI,
            eventHandler: handler
        }));
    }
    static trigger(eventName, ...param) {
        Object.keys(SloshEventEmitter.RegisteredEvents).forEach(eName => {
            if (!SloshEventEmitter.RegisteredEvents[eName])
                SloshEventEmitter.RegisteredEvents[eName] = [];
            SloshEventEmitter.RegisteredEvents[eName].forEach(EE => {
                EE.handle.apply(EE, param);
            });
        });
    }
}
SloshEventEmitter.RegisteredEvents = {};
class SloshBaseUI extends SloshEventEmitter {
    constructor() {
        super();
        this.isDirty = false;
        this._padding_vertical = 4;
        this._padding_horizontal = 2;
        this.canvas = document.createElement('canvas');
        this.canvasContext = this.canvas.getContext('2d');
        this.PPI = window.devicePixelRatio;
        this.setBase(this);
        this.on('render', () => {
            if (!this.isDirty)
                return;
            this.draw();
        });
        let shadow = this.attachShadow({ mode: 'closed' });
        shadow.appendChild(this.canvas);
        this.canvas.style.letterSpacing = 'normal';
    }
    get padding_vertical() {
        return this._padding_vertical;
    }
    get padding_horizontal() {
        return this._padding_horizontal;
    }
    set padding_vertical(v) {
        this._padding_vertical = v * 2;
    }
    set padding_horizontal(v) {
        this._padding_horizontal = v;
    }
    invalidate() {
        this.isDirty = true;
    }
    draw() {
        // clean and redraw
        let bound = this.getBoundingClientRect();
        if (bound.width !== this.width || bound.height !== this.height) {
            this.style.width = (this.width) + 'px';
            this.style.height = (this.height) + 'px';
            bound = this.getBoundingClientRect();
        }
        let padd_left = this.padding_horizontal;
        let padd_top = this.padding_vertical;
        this.canvas.width = (bound.width) * this.PPI;
        this.canvas.height = (bound.height) * this.PPI;
        // set definition
        this.canvas.style.width = (bound.width) + 'px';
        this.canvas.style.height = (bound.height) + 'px';
        this.canvasContext.setTransform(this.PPI, 0, 0, this.PPI, 0, 0);
        this.render();
        // when done
        this.isDirty = false;
    }
    render() { }
}
SloshEventEmitter.RegisteredEvents['render'] = [];
setInterval(() => {
    SloshEventEmitter.trigger('render');
}, 1000 / 60);
