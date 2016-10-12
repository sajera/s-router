
'use strict';

var sourceMap = {};
/**
 * 
 * @param: { Object } - method name
 * @param: { Object } - from wich
 * @returns: { Array }
 */
function buildQueue ( method, point ) {
	return (point.PREPROCESSOR||[]).slice(0).concat((point[method]||[]).slice(0));
}

/**
 * 
 * @param: { Array } - handlers
 * @param: { Array } - arguments to handlers
 * @param: { Function } - cathc error
 */
function executeAsyncQueue ( queue, args, errorHandler ) {
	// make a unique next method for each handler
	function superNext () {
		queue.length > 1 && executeAsyncQueue(queue.slice(1), args, errorHandler);
	}
	// set method next to params (3-argument in execution handlers)
	args[args.length-1].next = superNext;
	// handler execute
	if ( typeof queue[0] == 'function' ) {
		var promis;
		try { promis = queue[0].apply(null, args);
		} catch ( error ) { errorHandler( error ); }
		// can be a promise without delegation of data from promises
		if ( promis && typeof promis.then == 'function' ) {
			promis.then(superNext, errorHandler);
		}
	} else { superNext(); } // protect array of queue from data types is not a function (skip)
}

module.exports = require('s-declare')(null, [
	'url',
	'querystring',
	'./lib/log.js',
	'./lib/Super.js',
	'./lib/Params.js',
	'./lib/Endpoint.js',
	function ( url, querystring, log, Super, Params, Endpoint ) {
	
	/**
	 * Router module provides functionality 
	 *
	 * @param: { Object } - options
	 * @constructor
	 * @public
	 */
	function Router ( name, options ) {
		/*-------------------------------------------------
				OPTIONS
		---------------------------------------------------*/
		// make a silence for router messages
		log.DEBUG = options.debug;
		// last error hadler wich has a last in each queue errors
		this.defaultError = options.error;


		// router name is a key for data storage
		this.name = name;
		// make a map for router instance
		sourceMap[this.name] = {};

		// Data storage can be seen but can not be changed from outside
		Object.defineProperty(this, 'map', {
			get: function() { return Object.assign({}, sourceMap[this.name]); },
			set: function() { log('WARN', 'properties "map" is private properties, its cannot be changed'); }
		});

		this.middleware = this.manager.bind(this);
	}

	Router.prototype = new Super({
		constructor: Router,
		instance: 'Router',
		/**
		 * middleware
		 *
		 * @param: { Object } - node server Request
		 * @param: { Object } - node server Response
		 */
		manager: function ( request, response ) {

			var urlObject = url.parse(request.url), router = this, body = [], endpoint;

			request
				.on('data', function ( chunk ) { body.push(chunk); })
				.on('end', function() {
					request.body = Buffer.concat(body).toString();
					// find a match among request url and endpoint
					for ( var key in sourceMap[router.name] ) {
						if ( sourceMap[router.name][key].compare(urlObject.pathname) ) {
							endpoint = sourceMap[router.name][key];
							break;
						}
					}

					if ( endpoint ) { // delegate the action to a query processor
						var queue = buildQueue(request.method, router).concat( buildQueue(request.method, endpoint) );
						// var params = endpoint.matchParams(request.url);
						var params = new Params(
							endpoint.matchParams(urlObject.pathname), // object query parameters
							{
								query: querystring.parse( urlObject.query ),
								body: Buffer.concat(body).toString(), // object with body request
								urlObject: urlObject, // url object
							}
						);
						executeAsyncQueue(queue, [request, response, params], function ( error ) {
							// make error
							params.error = error;
							executeAsyncQueue(
								(router.ERROR||[]).slice(0).concat((endpoint.ERROR||[]).slice(0)).concat(router.defaultError),
								[request, response, params],
								router.defaultError
							);
						});
					} else {
						// make error
						executeAsyncQueue(
							(router.ERROR||[]).slice(0).concat(router.defaultError),
							[request, response, new Params({error: 'endpoint does not match'})],
							router.defaultError
						);
					}
				})
				.on('error', function ( error ) {
					// make error
					executeAsyncQueue(
						(router.ERROR||[]).slice(0).concat(router.defaultError),
						[request, response, new Params({error: 'request error'})],
						router.defaultError
					);
				});
		},
		/**
		 * create or get endpoint
		 *
		 * @param: { String }
		 * @param: { String }
		 * @returns { Object }
		 */
		endpoint: function ( name, query ) {
			var endpoint = sourceMap[this.name][name];
			if ( !endpoint ) {
				sourceMap[this.name][name] = new Endpoint( query );
			}
			return sourceMap[this.name][name];
		},
		/**
		 * for extend prototype object of parameters
		 * 
		 * adding method to prototype more easy for operations creating for each handling request
		 * @param: { Function } - constructor
		 */
		extendParams: function ( extend ) {
			if ( typeof extend == 'function' ) {
				Object.assign(Params.prototype, new extend() );
			} else if (typeof extend == 'object') {
				Object.assign(Params.prototype, extend);
			}
		},
		/**
		 * method to override
		 */
		defaultError: function () { log('ERROR', 'defaultError:', arguments); }
	});
	/**
	 * EXPORT
	 *
	 * @constructor
	 * @public
	 */
	return Router;
}]);