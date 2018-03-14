

class UIImage extends SloshBaseUI{

    public source:string = "";
    public thumbnail:string = "";

    protected imageTag:HTMLImageElement;
    protected thumbTag:HTMLImageElement;
    protected blurAmount:number = 20;
    protected transitionLength:number = 1000;

    constructor(){
        super();
    }

    loadUrl(imagePath:string,thumbnailPath:string){
        this.imageTag = new Image();
        this.thumbTag = new Image();

        this.canvas.classList.add('loading');

        this.thumbTag.onload = ()=>{
            this.canvasContext.drawImage(this.thumbTag,0,0,this.width,this.height);
            this.imageTag.src = imagePath;
        };
        this.imageTag.onload = ()=>{
            this.canvasContext.drawImage(this.imageTag,0,0,this.width,this.height);
            this.canvas.classList.remove('loading');
        };
        this.thumbTag.src = thumbnailPath;
    }

    initialize(){
        if (!this.width) this.width = 400;
        if (!this.height) this.height = 360;

        if ( this.getAttribute('width') === null ) this.setAttribute('width',this.width.toString());
        if ( this.getAttribute('height') === null ) this.setAttribute('height',this.height.toString());

        this.Style += `canvas { transition: filter ${this.transitionLength}ms }`;
        this.Style += `canvas.loading { filter: blur(${this.blurAmount}px) }`;
    }

    render(){
        this.loadUrl(this.source,this.thumbnail);
    }

    static get observedAttributes() {
        return ['src', 'width','height','thumb'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        switch (name){
            case 'src':
                this.source = newValue;
                break;
            case 'width':
                this.width = parseInt(newValue);
                break;
            case 'height':
                this.height = parseInt(newValue);
                break;
            case 'thumb':
                this.thumbnail = newValue;
                break;
        }
        this.invalidate();
    }
}
customElements.define('ui-image', UIImage);