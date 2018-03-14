
namespace Slosh{
    export class CoreElement extends HTMLElement{}
    export class Selection{
        public start:number = 0;
        public length:number = 0;

        protected inputElement:UIInputBox;

        constructor(start:number=0,length:number=0){
            this.start = start;
            this.length = length;
        }

        bind(iElement:UIInputBox){
            this.inputElement = iElement;
        }

        tidy(){
            let s = new Selection();
            if (this.length < 0){
                s.start = this.start + this.length;
                s.length = Math.abs(this.length);
            }
            else{
                s.start = this.start;
                s.length = this.length;
            }
            s.inputElement = this.inputElement;
            return s;
        }

        get beamIndex(){
            return this.start;
        }

        set beamIndex(v){

            if ( this.inputElement ){
                let maxInd = this.inputElement.content.length;
                if ( v > maxInd ) v = maxInd;
                if ( v < 0 ) v = 0;
            }

            this.start = v;
            this.length = 0;
        }
    }
}

class SloshEvent{
    public element:SloshBaseUI;
    public eventName:string;
    public eventHandler:Function = ()=>{};
    public called:boolean = false;
    public once:boolean = false;

    constructor(opt={}){
        Object.keys(opt).forEach(k=>{
            this[k] = opt[k]
        });
    }

    public handle(...params){
        if ( this.once && this.called ) return;

        this.eventHandler.apply(this,params);
        this.called = true;
    }
}

class SloshEventEmitter extends Slosh.CoreElement{
    protected baseUI:SloshBaseUI;
    public static RegisteredEvents:{ [eventName:string]:Array<SloshEvent> } = {};
    public setBase(bUI:SloshBaseUI){
        this.baseUI = bUI;
    }

    public on(eventName:string,handler:Function){
        if ( !SloshEventEmitter.RegisteredEvents[eventName] )
            SloshEventEmitter.RegisteredEvents[eventName] = [];
        SloshEventEmitter.RegisteredEvents[eventName].push( new SloshEvent({
            eventName: eventName,
            element: this.baseUI,
            eventHandler: handler
        }) );
    }

    public static trigger(eventName:string,...param){
        Object.keys(SloshEventEmitter.RegisteredEvents).forEach(eName=>{
            if ( !SloshEventEmitter.RegisteredEvents[eName] )
                SloshEventEmitter.RegisteredEvents[eName] = [];
            SloshEventEmitter.RegisteredEvents[eName].forEach(EE=>{
                EE.handle.apply(EE,param);
            });
        });
    }
}


class SloshBaseUI extends SloshEventEmitter{

    private isDirty:boolean = false;
    private _padding_vertical:number = 4;
    private _padding_horizontal:number = 2;

    protected canvas:HTMLCanvasElement = document.createElement('canvas');
    protected canvasContext:CanvasRenderingContext2D = this.canvas.getContext('2d');

    protected width:number;
    protected height:number;

    protected get padding_vertical():number{
        return this._padding_vertical;
    }
    protected get padding_horizontal():number{
        return this._padding_horizontal;
    }

    protected set padding_vertical(v:number){
        this._padding_vertical = v * 2;
    }
    protected set padding_horizontal(v:number){
        this._padding_horizontal = v;
    }

    protected PPI:number = window.devicePixelRatio;

    constructor(){
        super();
        this.setBase(this);

        this.on('render',()=>{
            if ( !this.isDirty ) return;
            this.draw();
        });

        let shadow = this.attachShadow({mode: 'closed'});
        shadow.appendChild( this.canvas );
        this.canvas.style.letterSpacing = 'normal';
    }

    protected invalidate(){
        this.isDirty = true;
    }

    protected draw(){
        // clean and redraw
        let bound = this.getBoundingClientRect();

        if (bound.width !== this.width || bound.height !== this.height){
            this.style.width = (this.width) + 'px';
            this.style.height = (this.height ) + 'px';
            bound = this.getBoundingClientRect();
        }

        let padd_left = this.padding_horizontal;
        let padd_top = this.padding_vertical;

        this.canvas.width =  (bound.width) * this.PPI ;
        this.canvas.height = (bound.height  ) * this.PPI ;

        // set definition
        this.canvas.style.width = (bound.width  )+'px';
        this.canvas.style.height = (bound.height ) +'px';
        this.canvasContext.setTransform(this.PPI,0,0,this.PPI,0,0);

        this.render();

        // when done
        this.isDirty = false;
    }

    protected render(){ }
}


SloshEventEmitter.RegisteredEvents['render'] = [];

setInterval(()=>{
    SloshEventEmitter.trigger('render');
}, 1000/60 );