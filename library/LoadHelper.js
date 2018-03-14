var LoadHelper;
(function (LoadHelper) {
    let hidden = {
        LibrariesToLoad: [],
        Options: {},
        firstRun: true,
        whenFirstCompletes: () => { }
    };
    function loadComponent(libraryName, first = false) {
        hidden.LibrariesToLoad[(first === true ? 'unshift' : 'push')](libraryName);
        if (hidden.firstRun === false)
            _loadComponent(libraryName);
    }
    LoadHelper.loadComponent = loadComponent;
    function setOption(optName, value) {
        hidden.Options[optName] = value;
    }
    LoadHelper.setOption = setOption;
    function _(n) {
        return hidden[n];
    }
    LoadHelper._ = _;
    function _loadComponent(l, h) {
        console.log('Loading Component', l);
        let s = document.createElement('script');
        if (h !== null)
            s.onload = h;
        s.src = 'library/' + l + '.js';
        document.head.appendChild(s);
    }
    document.addEventListener('DOMContentLoaded', () => {
        if (hidden.firstRun === true) {
            _loadComponent('slosh', () => {
                hidden.LibrariesToLoad.forEach((l, i) => {
                    _loadComponent(l);
                });
                hidden.firstRun = false;
            });
        }
    });
})(LoadHelper || (LoadHelper = {}));
