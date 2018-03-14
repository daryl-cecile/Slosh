

namespace LoadHelper{

    let hidden = {
        LibrariesToLoad : [],
        Options : {},
        firstRun : true,
        whenFirstCompletes: ()=>{}
    };

    export function loadComponent(libraryName:string,first:boolean=false){
        hidden.LibrariesToLoad[ (first===true?'unshift':'push') ](libraryName);
        if ( hidden.firstRun === false ) _loadComponent(libraryName);
    }

    export function setOption(optName:string,value:boolean){
        hidden.Options[optName] = value;
    }

    export function _ (n:string){
        return hidden[n];
    }

    function _loadComponent(l:string,h?){
        console.log('Loading Component',l);
        let s = document.createElement('script');
        if (h !== null) s.onload = h;
        s.src = 'library/'+l+'.js';
        document.head.appendChild(s);
    }

    document.addEventListener('DOMContentLoaded',()=>{
        if ( hidden.firstRun === true ){
            _loadComponent('slosh',()=>{
                hidden.LibrariesToLoad.forEach((l,i)=>{
                    _loadComponent(l);
                });
                hidden.firstRun = false;
            });
        }
    });

}