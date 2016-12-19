/*-------------------------------------------------
    SUPER for Router and Endpoint
---------------------------------------------------*/
/**
 * adding common functionality
 *
 * @constructor prototype
 * @private
 */
function Super ( extend ) {
    // extend prototype wich be created
    Object.assign.apply(Object,[this].concat(Array.prototype.slice.call(arguments, 0)));
};

Super.prototype = {
    constructor: Super,
    /**
     * to adding a handlers for router endpoint methods
     *
     * @param secret: { Symbol }
     * @param method: { String } - name of method
     * @param listeners: { Array|Function } - listeners of request
     * @returns: { Object }
     */
    on: function ( secret, method, listeners ) {
        
        var map = this[secret];
        method = method.toUpperCase();
        assert( // to add a listener to request it must exist
            isSupportedMethod(method), 'Node.js '+process.version+' doesn`t support method '+method
        );
        assert( // listners must be a function or array with functions
            is.function(listeners)||is.array(listeners), 'listners must be a function or array with functions '+listeners
        );
        // if it first listner
        map[method] = map[method] || [];

        if ( is.array(listeners) ) {
            for ( var key = 0; key < listeners.length; key ++ ) {// each listeners must be a function
                assert(is.function(listeners[key]), 'listners must be a function or array with functions '+listeners);
            }
            map[method] = map[method].concat(listeners);
        } else if ( is.function(listeners) ) map[method].push(listeners);

        // debug('add listner on '+method+' for '+this.instance+' "'+this.id+'"');
        return this;
    },
    /**
     * executed before queue point
     *
     * @param: { Array|Function }
     * @returns: { Object }
     */
    use: function alias ( listeners ) { return this.on('PREPROCESSOR', listeners); },
};

/*-------------------------------------------------
    Create a method nammed like express
---------------------------------------------------*/
for ( var key = 0; key < supportedMethods.length; key ++ ) {
    Super.prototype[supportedMethods[key].toLowerCase()] = (function ( name ) {
        return function alias ( listeners ) {
            return this.on(name, listeners);
        }
    })(supportedMethods[key]);
}
