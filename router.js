/**
 * s-router    
 * MIT License Copyright (c) 2016 Serhii Perekhrest <allsajera@gmail.com> ( Sajera )    
 */
(function () {'use strict';
/*-------------------------------------------------
    DEPENDENCIES for router declare and/or prepare
---------------------------------------------------*/
var querystring = require('querystring');
var assert = require('assert');
var http = require('http');
var url = require('url');
var is = require('s-is');

/**
 * getting node methods
 */
var supportedMethods = (http.METHODS || [
    'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','HEAD', 'PATCH', 'SEARCH',
    'TRACE', 'MOVE', 'COPY', 'LOCK', 'UNLOCK', 'MKCOL', 'M-SEARCH',
    'PURGE', 'PROPFIND', 'PROPPATCH', 'REPORT', 'MKACTIVITY', 'CONNECT',
    'CHECKOUT', 'MERGE', 'NOTIFY', 'SUBSCRIBE', 'UNSUBSCRIBE' 
]).concat('PREPROCESSOR', 'ERROR');

/**
 * checking support of method by name for this node
 *
 * @param name: { String }
 * @returns: { Boolean }
 */
function isSupportedMethod ( name ) {
    return supportedMethods.indexOf( name.toUpperCase() ) > -1;
}

/**
 * debug log
 * @privat
 */
var debugPrefix = is.platform.browser() ? 's-debug:' : '\x1B[0m\x1B[41m s-debug:\x1B[49m\x1B[0m';
function debug () {
    if ( process.env.DEBUG&&!is.empty(arguments) ) {
        console.log.apply(console, [debugPrefix].concat(Array.prototype.slice.call(arguments)));
    }
}
/**
 * first element form error stack
 *
 * @param error: { Error } - error which the stack need to write
 * @privat
 */
var stackPrefix = is.platform.browser() ? 'source: ' : '\x1B[0m\x1B[31m source:\x1B[39m\x1B[0m ';
function trace ( error ) {
    return stackPrefix+(is.error(error) ? error.stack.split('\n')[1].replace(/(.*\()|(\).*)|(.*s>)/g,'') : '...');
}
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

/*-------------------------------------------------
    ENDPOINT
---------------------------------------------------*/
/**
 * mapper for management and asynchronous extradition of endpoints by id
 *
 * @param secretEndpoint: { Symbol } - bounded private key for map
 * @param secretUnit: { Symbol } - bounded private key for map
 * @param secretListeners: { Symbol } - bounded private key for map
 * @param id: { String } - identifier (mostly for humanize)
 * @param query: { String } - humanised pattern of endpoint
 * @returns { Object }
 */
function endpointManager ( secretEndpoint, secretUnit, secretListeners, id, query ) {

    assert(is.string(id), '"ID" of Endpoint must be a string');

    var map = this[secretEndpoint];
    !map[id]&&assert(is.string(query), 'for create endpoint "query" required and must be a string');
        
    return map[id] ? map[id] : ( map[id] = new Endpoint(query, secretListeners, this[secretUnit], id) );
}

/**
 * endpoint module provides functionality 
 * {:path} - required - /(static name)/(dinamic data)/
 * {?:path} - not required - /(static name - required even if its value is not obligatory)/(dinamic data)/
 * {-:path} - convert to one part of query - /(expecting dinamic data)/
 * {-?:path} - convert to one part of query - not required - /(expecting dinamic data)/
 *
 * @constructor
 * @publick
 */
function Endpoint ( query, secret, unitsMap, id ) {
    
    this.id = id;
    // visible private map of handlers
    this[secret] = {};
    this.on = this.on.bind(this, secret);

    var units = id.split('.').slice(0, -1);
    var before = '';
    // extend by units
    for ( var key = 0; key < units.length; key++ ) {
        before+=unitsMap[units[key]].query;
        // add listeners
        for ( var method in unitsMap[units[key]][secret] ) {
            this.on(method, unitsMap[units[key]][secret][method]);
        }
    }
    // extend query before create matchers
    query = before+query;

    var params = this.params = {};
    var order = 1; // order is a position in array of result
    // make an expression for a comparison with the query string
    this.matcher = new RegExp('^'+query.replace(/\{[^}]*}\/?/gi, function ( humanised ) {
        // get a properties name
        var name = humanised.replace(/[\W]/gi,'');
        // flags for this parameter
        var flags = humanised.replace(/[\w\:\/\{\}]/gi,'');
        // get a requirement of parameter
        var required = !/\?/.test(flags);
        // order of parameter
        params[name] = order++;
        /*-------------------------------------------------
            make expression for part of query string
        ---------------------------------------------------*/
        var pattern = /\-/.test(flags) ? (required ? '' : '?') : name+'/'+(required ? '' : '?');
        return pattern+'([^\\W]+)'+(required ? '' : '?')+'/';
    })+'?$', 'i');

    debug('Endpoint "'+this.id+'" created => ', query );
};

Endpoint.prototype = new Super({
    constructor: Endpoint,
    instance: 'Endpoint',
    /**
     * compare query with this endpoint (fast)
     *
     * @param query: { String } - parsed url - pathname
     * @returns: { Boolean }
     */
    compare: function ( query ) {
        return this.matcher.test( query );
    },

    /**
     * get a query params from url
     *
     * @param query: { String } - parsed url - pathname
     * @returns: { Object }
     */
    matchParams: function ( query ) {
        var result = {};
        var intermediate = query.match( this.matcher );
        if ( intermediate ) {
            for ( var name in this.params ) {
                result[name] = intermediate[this.params[name]];
            }
        }
        return result;
    }
});

/*-------------------------------------------------
    UNIT
---------------------------------------------------*/
/**
 * mapper for management and asynchronous extradition of endpoints by id
 *
 * @param secretUnit: { Symbol } - bounded private key for map
 * @param secretListeners: { Symbol } - bounded private key for map
 * @param id: { String } - identifier (mostly for humanize)
 * @param query: { String } - humanised pattern of endpoint
 * @returns { Object }
 */
function unitManager ( secretUnit, secretListeners, id, query ) {

    assert(is.string(id), '"ID" of Unit must be a string');

    var map = this[secretUnit];
    !map[id]&&assert(is.string(query), 'for create endpoint "query" required and must be a string');
        
    return map[id] ? map[id] : ( map[id] = new Unit(query, secretListeners, id) );
}

/**
 * endpoint module provides functionality 
 * {:path} - required - /(static name)/(dinamic data)/
 * {?:path} - not required - /(static name - required even if its value is not obligatory)/(dinamic data)/
 * {-:path} - convert to one part of query - /(expecting dinamic data)/
 * {-?:path} - convert to one part of query - not required - /(expecting dinamic data)/
 *
 * @constructor
 * @publick
 */
function Unit ( query, secret, id ) {


    this.id = id;
    this.query = query.replace(/\/+$/,'');
    // visible private map of handlers
    this[secret] = {};
    this.on = this.on.bind(this, secret);

    debug('Unit "'+this.id+'" created =>', query );
};

Unit.prototype = new Super({
    constructor: Unit,
    instance: 'Unit'

});
/*-------------------------------------------------
    PARAMS
---------------------------------------------------*/
/**
 * Constructor for provide a common to the each middlevare
 * 
 * @constructor
 * @publick
 */
function Params () {
    // simple copy all data to body params
    Object.assign.apply(Object,[this].concat(Array.prototype.slice.call(arguments)));
    
    // customization prepering params
    is.function(this.initialize)&&this.initialize();
};

Params.prototype = {
    constructor: Params,
    /**
     * method to override
     */
    initialize: function () { debug('default params initialize'); }
};
/*-------------------------------------------------
    ROUTER
---------------------------------------------------*/

/**
 * 
 * @param args: { Array } - arguments each listner
 * @param queue: { Array } - listeners
 * @param errorHandler: { Function } - cathc error
 * @private
 */
function executeAsyncQueue ( args, queue, errorHandler ) {
    var promise;
    if ( queue.length > 0 ) {
        // handler execute
        try { promise = queue[0].apply(null, args);
        } catch ( error ) {
            // debug('Error hadled', trace(error) );
            args[2].error = error;
            return errorHandler(args[0], args[1], args[2]);
        }
    }

    // can be a promise without delegation of data from promises
    if ( is.promise(promise) ) {
        promise.then(
            executeAsyncQueue.bind(null, args, queue.slice(1), errorHandler),
            function ( error ) {
                args[2].error = error;
                errorHandler(args[0], args[1], args[2]);
            }
        );
    } else if ( queue.length > 1 ) {
        executeAsyncQueue(args, queue.slice(1), errorHandler);
    }
}

 /**
 * slicing middleware
 *
 * @param secretEndpoint: { Symbol } - private key for getting map
 * @param secretListeners: { Symbol } - private key for getting map
 * @param request: { Object } - node server Request
 * @param response: { Object } - node server Response
 */
function slicingManager ( secretEndpoint, secretListeners, request, response ) {

    var endpoint;
    var router = this;
    var parsedURL = url.parse(request.url);

    // find a match among request url and endpoint
    for ( var point in router[secretEndpoint] ) {
        if ( router[secretEndpoint][point].compare(parsedURL.pathname) ) {
            endpoint = router[secretEndpoint][point];
            break;
        }
    }
    // prepare addition params
    var params = new Params({
        'url': parsedURL,
        'query': querystring.parse( parsedURL.query ),
        'options': endpoint ? endpoint.matchParams(parsedURL.pathname) : {},
    });
    // arguments for each listner
    var args = [request, response, params];

    if ( endpoint ) {
        debug('Handle request '+request.method+' on '+parsedURL.pathname, 'Endpoint: '+endpoint.id);
        executeAsyncQueue( args, []
            // queue of listeners for this request
            .concat( router[secretListeners].PREPROCESSOR||[] )
            .concat( router[secretListeners][request.method]||[] )
            .concat( endpoint[secretListeners].PREPROCESSOR||[] )
            .concat( endpoint[secretListeners][request.method]||[] ),
            function errorQueue (request, response, params) {
                executeAsyncQueue([request, response, params], []
                    // queue of error listeners
                    .concat(endpoint[secretListeners]['ERROR']||[])
                    .concat(router[secretListeners]['ERROR']||[]),
                    router.crash
                );
            }
        );
    } else {
        debug('otherwise request '+request.method+' on '+parsedURL.pathname);
        executeAsyncQueue( args, []
            // queue of listeners for otherwise request
            .concat( router[secretListeners]['PREPROCESSOR']||[] ).concat(router.otherwise),
            function errorQueue ( request, response, params ) {
                // queue of error listeners
                executeAsyncQueue([request, response, params], [].concat( router[secretListeners]['ERROR']||[] ), router.crash);
            }
        );
    }
}

/**
 * mapper for management and asynchronous extradition of routers by id
 *
 * @param id: { String } - name/id of router
 * @returns: { Router }
 * @publick
 */
var mapper = routerManager.bind({});
function routerManager ( id ) {
    assert(is.string(id), '"ID" of Router must be a string');
    return this[id] ? this[id] : (this[id] = new Router(id));
}

/**
 * Router module provides functionality 
 *
 * @constructor
 * @public
 */
function Router ( id ) {

    this.id = id;
    // router id is a caption for key of data storage
    var secretUnit = Symbol('units');
    var secretEndpoint = Symbol('endpoints');
    var secretListeners = Symbol('listeners');
    // make a map for router instance
    this[secretUnit] = {};
    this[secretEndpoint] = {};
    this[secretListeners] = {};
    // bounding by this
    this.middleware = slicingManager.bind(this, secretEndpoint, secretListeners);
    this.endpoint = endpointManager.bind(this, secretEndpoint, secretUnit, secretListeners);
    this.unit = unitManager.bind(this, secretUnit, secretListeners);
    this.on = this.on.bind(this, secretListeners);

    debug('Router "'+id+'" created\n');
}

Router.prototype = new Super({
    constructor: Router,
    instance: 'Router',
    /**
     * for extend prototype object of parameters
     * adding to prototype more easy operations creating for each handling request
     * 
     * @param extend: { Object||Function }
     */
    extendParams: function ( extend ) {
        assert(
            is.function(extend)||is._object(extend), '"extend" of params must be a object or function'
        );

        if ( is.function(extend) ) {
            Object.assign(Params.prototype, new extend() );
        } else if ( is._object(extend) ) {
            Object.assign(Params.prototype, extend);
        }

        debug(this.id, '=> Params was extendet');
    },
    /**
     * method to override
     */
    crash: function ( req, res, p ) {
        debug('crash report => ', trace(p.error));
        res.end('404');
    },
    otherwise: function ( req, res, p ) {
        debug('otherwise => method not allowed');
        res.end('404');
    },
});

/**
 * EXPORTS
 *
 * @public
 */
if ( is.platform.node() ) module.exports = mapper;

})() 