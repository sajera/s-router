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
    if ( !args[1].finished ) {
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
            .concat( endpoint[secretListeners][request.method]||[] )
            .concat( router.otherwise ),
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
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
    },
    otherwise: function ( request, response, p ) {
        debug('otherwise => method not allowed');
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not Found\n");
        response.end();
    },
});
