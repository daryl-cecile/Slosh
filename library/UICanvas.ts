
class UICanvas extends SloshBaseUI{
    public canvasElement:HTMLCanvasElement;
    public canvasContext:CanvasRenderingContext2D;
    public isCustomElement:boolean = false;
    constructor(el?:HTMLCanvasElement){
        super();
        if (!el) {
            el = this.canvas;
            this.isCustomElement = true;
        }
        this.canvasElement = el;
        this.canvasContext = this.canvasElement.getContext('2d');

        if (this.isCustomElement === false) {
            this.canvasElement.setAttribute('data-HDC', 'true');
            this.canvasElement['HDController'] = this;
        }
        this.render();
    }

    get Context2D(){
        return this.canvasContext;
    }

    get ContextWebGL_Experimental(){
        return this.canvasElement.getContext('experimental-webgl');
    }

    get ContextWebGL(){
        return this.canvasElement.getContext('webgl');
    }

    render(){
        if ( !window.hasOwnProperty('devicePixelRatio') ) {
            Object.defineProperty(window,'devicePixelRatio',{
                value: 1
            });
        }

        if ( this.getAttribute('width') === "" ) {
            this.canvasElement.setAttribute('width','500');
            this.setAttribute('width','500');
        }
        else{
            this.canvasElement.setAttribute('width', this.getAttribute('width') );
        }
        if ( this.getAttribute('height') === "" ) {
            this.canvasElement.setAttribute('height','500');
            this.setAttribute('height','500');
        }
        else{
            this.canvasElement.setAttribute('height', this.getAttribute('height') );
        }

        this.width = parseInt( this.getAttribute('width') ) * window.devicePixelRatio;
        this.height = parseInt( this.getAttribute('height') ) * window.devicePixelRatio;

        this.canvasElement.width = this.width;
        this.canvasElement.height = this.height;

        this.canvasElement.style.width = (this.width / window.devicePixelRatio) + 'px';
        this.canvasElement.style.height = (this.height / window.devicePixelRatio) + 'px';

        this.style.width = (this.width / window.devicePixelRatio) + 'px';
        this.style.height = (this.height / window.devicePixelRatio) + 'px';

        this.canvasContext.setTransform(window.devicePixelRatio,0,0,window.devicePixelRatio,0,0);
    }
}

if ( LoadHelper._('Options')['autoUpgradeCanvas'] !== false ) (function(){
    window['HDCanvasCollection'] = [];
    function upgradeCanvas(c){
        window['HDCanvasCollection'].push( new UICanvas(c) );
    }
    if ( window.hasOwnProperty('MutationObserver') ){
        new MutationObserver(function() {
            document.querySelectorAll('canvas:not([data-HDC="true"])').forEach(c=>{
                upgradeCanvas(c);
            });
        }).observe( document.body , {childList: true, subtree: true});
    }else{
        document.addEventListener('DOMNodeInserted',(e)=>{
            document.querySelectorAll('canvas:not([data-HDC="true"])').forEach(c=>{
                upgradeCanvas(c);
            })
        });
    }

    document.querySelectorAll('canvas:not([data-HDC="true"])').forEach(c=>{
        upgradeCanvas(c);
    })
})();

customElements.define('ui-canvas-hd', UICanvas);