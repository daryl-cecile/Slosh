
class UIInputBox extends SloshBaseUI{

    public selection:Slosh.Selection = new Slosh.Selection();
    public content:string = "";
    public placeholder:string = "";
    public hint:string = "";

    private focused:boolean = false;
    private iBeamActive: boolean = false;
    private highlighting:boolean = false;

    constructor(){
        super();

        this.padding_horizontal = 2;
        this.padding_vertical = 2;
        this.width = 200;
        this.height = 20;

        // set up events
        this.addEventListener('click',(ev:Event)=>{
            SloshEventEmitter.trigger('click',ev);
        });

        document.addEventListener('copy',(ev:ClipboardEvent)=>{
            if (this.focused){
                ev.preventDefault();
                ev.clipboardData.setData('text/plain', this.content);
            }
            console.log(ev);
        });

        document.addEventListener('cut',(ev:ClipboardEvent)=>{
            if (this.focused){
                ev.preventDefault();
                ev.clipboardData.setData('text/plain', this.content);
                this.content = '';
                this.invalidate();
            }
        });

        document.addEventListener('paste',(ev:ClipboardEvent)=>{
            if (this.focused){
                ev.preventDefault();
                this._insert( ev.clipboardData.getData('text/plain') );
                this.invalidate();
            }
        });

        this.addEventListener('mousedown',(ev)=>{
            this.processClick(ev,true);
        });

        this.addEventListener('mouseup',(ev)=>{
            this.processClick(ev,false);
        });

        this.addEventListener('mouseleave',(ev)=>{
            this.highlighting = false;
        });

        this.addEventListener('mousemove',(ev)=>{
            this.processMove(ev);
        });

        this.addEventListener('keydown',(ev)=>{
            this.processInput(ev);
            SloshEventEmitter.trigger('keypress',ev);
        });

        this.addEventListener('focus',()=>{
            this.focused = true;
        });

        this.addEventListener('blur',()=>{
            this.focused = false;
        });

        this.selection.bind(this);

        setInterval(()=>{
            this.invalidate();
        },500);
    }

    connectedCallback(){
        this.tabIndex = 0;
        this.invalidate();
    }

    static get observedAttributes() {
        return ['value', 'placeholder','hint','width','height','style','padding-v','padding-h'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name){
            case 'value':
                this.content = newValue;
                break;
            case 'placeholder':
                this.placeholder = newValue;
                break;
            case 'hint':
                this.hint = newValue;
                break;
            case 'padding-v':
                this.padding_vertical = parseInt(newValue);
                break;
            case 'padding-h':
                this.padding_horizontal = parseInt(newValue);
                break;
            case 'width':
                this.width = parseInt(newValue);
                break;
            case 'height':
                this.height = parseInt(newValue);
                break;
        }
        this.invalidate();
    }

    get HighlightedText(){
        let selectionCopy = this.selection.tidy();
        return this.content.substr( selectionCopy.beamIndex , selectionCopy.length );
    }

     getBorder(){
        // "0px none rgb(0, 0, 0)"
        let border = window.getComputedStyle( this ).getPropertyValue('border');
        return {
            thickness: {
                raw: parseFloat(border.split('p')[0]),
                value: border.split(' ')[0]
            },
            lineType:{
                value: border.split(' ')[1]
            },
            color: {
                raw: 'rgb('+border.split('(')[1].split(')')[0]+')'
            }
        }
    }

    private _insert(data:string,ind?){
        if (ind){
            this.content =
                this.content.substr(0, ind ) +
                data +
                this.content.substr( ind );
        }
        else{
            this.selection = this.selection.tidy();
            this.content =
                this.content.substr(0, this.selection.beamIndex ) +
                data +
                this.content.substr( this.selection.beamIndex + this.selection.length );
        }
        this.selection.beamIndex += data.length;
    }

    private _delete(count:number,ind?){
        if (ind){
            this.content =
                this.content.substr(0,ind - count) +
                this.content.substr( ind );

            this.selection.beamIndex --;
        }
        else{
            if ( this.selection.length !== 0 ){
                this.selection = this.selection.tidy();
                this.content =
                    this.content.substr(0,this.selection.beamIndex) +
                    this.content.substr( this.selection.beamIndex + this.selection.length );
            }
            else{
                this.content =
                    this.content.substr(0,this.selection.beamIndex - count) +
                    this.content.substr( this.selection.beamIndex );

                this.selection.beamIndex --;
            }

        }
    }

    private _highlight(from:number,to:number){
        this.selection.start = from;
        this.selection.length = to;
    }

    private PositionToPoint(c:number){
        if (c === 0){
            return 0;
        }
        else {

            return ( this.canvasContext.measureText( this.content.substr(0,c) ).width );

        }
    }

    private pointToPosition(x,y){
        let b = this.getBoundingClientRect();
        let styles = window.getComputedStyle(this);
        let fontSize = parseFloat((/([0-9]+?)px/.exec(styles.getPropertyValue('font')))[1]);
        let padd_left = this.padding_horizontal;
        let padd_top = this.padding_vertical;

        x = x - ( b.left + padd_left );

        let dimensions = [];
        let s = padd_left;
        this.content.split('').forEach((c,i)=>{
            if (i==0) dimensions.push( padd_left );
            else {
                s += this.canvasContext.measureText(c).width;
                dimensions.push( s );
            }
        });

        let dp = 0;
        let pointIndex = -1;

        while ( dp < dimensions.length ){

            if ( x < dimensions[dp] ){
                pointIndex = dp;
                break;
            }

            dp ++;

        }

        if (pointIndex === -1){
            dp = dimensions.length ;
            pointIndex = dp;
        }

        return pointIndex;
    }

    processInput(ev:KeyboardEvent){

        if (ev.key.length === 1 && !( ev.metaKey === true || ev.ctrlKey === true ) ){
            this._insert(ev.key);
        }
        else{

            if (ev.key === 'Backspace') this._delete(1);
            if (ev.key === 'Delete') this._delete(-1);

            if (ev.metaKey === true || ev.ctrlKey === true){
                switch (ev.key){
                    case 'a':
                        this._highlight(0,this.content.length);
                        break;
                }
            }
            else{
                if (ev.shiftKey){
                    if (ev.key === 'ArrowRight') {
                        this.selection.length ++;
                    }
                    if (ev.key === 'ArrowLeft') {
                        this.selection.length --;
                    }
                }
                else{
                    if (ev.key === 'ArrowRight') {
                        this.selection.beamIndex ++;
                    }
                    if (ev.key === 'ArrowLeft') {
                        this.selection.beamIndex --;
                    }
                    if (ev.key === 'ArrowUp'){
                        this.selection.beamIndex = 0;
                    }
                    if (ev.key === 'ArrowDown'){
                        this.selection.beamIndex = this.content.length;
                    }
                }
            }

        }

        this.invalidate();
    }

    processMove(ev){
        if (this.highlighting){
            let p = this.pointToPosition(ev.x,ev.y);

            if ( p === this.selection.beamIndex ){
                this.selection.start = p;
            }
            else{
                this.selection.length = p - this.selection.beamIndex;
            }
            this.invalidate();
        }
    }

    processClick(ev:MouseEvent,down:boolean=false){
        this.highlighting = down;

        if (down){
            this.selection.beamIndex = this.pointToPosition(ev.x,ev.y);
        }
        else{
            let p = this.pointToPosition(ev.x,ev.y);

            if ( p === this.selection.beamIndex ){
                this.selection.beamIndex = p;
            }
            else{
                this.selection.length = p - this.selection.beamIndex;
            }
        }

        this.invalidate();
    }

    render(){
        let styles = window.getComputedStyle(this);

        let fontSize = parseFloat( (/([0-9]+?)px/.exec(styles.getPropertyValue('font')))[1] );
        let padd_left = this.padding_horizontal;
        let padd_top = this.padding_vertical;


        this.canvasContext.font = styles.getPropertyValue('font');
        this.canvasContext.textAlign = "left";
        this.canvasContext.fillStyle = styles.getPropertyValue('color');
        this.canvasContext.textBaseline = 'hanging';

        if (this.getBorder().lineType.value === 'none'){
            this.canvasContext.strokeStyle = 'lightgray';
            this.canvasContext.strokeRect(0,0,this.width,this.height);
            this.canvasContext.strokeStyle = styles.getPropertyValue('color');
        }

        if ( this.content.length === 0 ){
            //draw placeholder
            this.canvasContext.globalAlpha = 0.5;
            this.canvasContext.fillText(this.placeholder, padd_left,  padd_top);
            this.canvasContext.globalAlpha = 1;
        }
        else{
            this.canvasContext.globalAlpha = 0.5;

            // draw highlight
            if ( this.focused ){
                this.canvasContext.fillStyle = 'deepskyblue';
                let selectionCopy = this.selection.tidy();
                let highlight_box = {
                    x : padd_left + this.PositionToPoint(selectionCopy.beamIndex),
                    y : padd_top/2,
                    w : this.canvasContext.measureText( this.HighlightedText ).width,
                    h : fontSize
                };
                this.canvasContext.fillRect( highlight_box.x,highlight_box.y,highlight_box.w,highlight_box.h );
            }

            // draw hint
            this.canvasContext.fillStyle = styles.getPropertyValue('color');
            this.canvasContext.fillText(this.hint, padd_left, padd_top);
            this.canvasContext.globalAlpha = 1;

            // draw text
            this.canvasContext.fillText(this.content, padd_left, padd_top);
        }


        // draw i-beam
        if ( this.iBeamActive && this.focused ){
            let txt = this.canvasContext.measureText(this.content.substr(0, this.selection.beamIndex + this.selection.length ));

            this.canvasContext.beginPath();
            this.canvasContext.moveTo( txt.width + padd_left , padd_top/2 );
            this.canvasContext.lineTo( txt.width + padd_left , fontSize + (padd_top / 2) );
            this.canvasContext.stroke();
        }

        this.iBeamActive = !this.iBeamActive;

    }
}


customElements.define('ui-inputbox', UIInputBox);