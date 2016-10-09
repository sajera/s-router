
'use strict';

var log = require('s-logger').get('special-logger-for-s-router');
/**
 * getting node methods 
 */
var supportedMethods = (require('http')).METHODS || [
    'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','HEAD', 'PATCH', 'SEARCH',
    'TRACE', 'MOVE', 'COPY', 'LOCK', 'UNLOCK', 'MKCOL', 'M-SEARCH',
    'PURGE', 'PROPFIND', 'PROPPATCH', 'REPORT', 'MKACTIVITY', 'CONNECT',
    'CHECKOUT', 'MERGE', 'NOTIFY', 'SUBSCRIBE', 'UNSUBSCRIBE' 
];
/**
 * adding custom router methods 
 */
supportedMethods = supportedMethods.concat('PREPROCESSOR', 'ERROR');

/**
 * @param: { any }
 * @returns: { Boolean }
 */
var ts = ({}).toString;
function isArray ( data ) {
	return ts.call(data) == '[object Array]';
};
/**
 * checking support of method by name for this node
 *
 * @param: { string }
 * @returns: { Boolean }
 */
function isSupportedMethod ( methodName ) {
	return supportedMethods.indexOf( methodName.toUpperCase() ) > -1;
}

/**
 * adding common functionality
 *
 * @constructor prototype
 * @privat
 */
module.exports = Super;

function Super ( extend ) {
	// extend prototype wich be created
	Object.assign.apply(Object,[this].concat(Array.prototype.slice.call(arguments, 0)));
	this.instance = this.constructor.name;
};

Super.prototype = {
	instance: 'Super',
	constructor: Super,
	isSupportedMethod: isSupportedMethod,
	/**
	 * to adding a handlers for router endpoint methods
	 *
	 * @param: { String } - name of method
	 * @param: { Array|Function } - handlers of request
	 * @returns: { Object }
	 */
	on: function ( method, handler ) {
		if ( isSupportedMethod(method) ) {
			method = method.toUpperCase();
			this[method] = this[method] || [];
			if ( isArray(handler) ) {
				this[method].concat(handler);
			} else if ( typeof handler == 'function' ) {
				this[method].push(handler);
			}
		} else { log('ERROR', 'Your node.js '+process.version+' doesn`t support method '+method); }
		return this;
	},

	/**
	 * executed before queue point
	 *
	 * @param: { Array|Function }
	 * @returns: { Object }
	 */
	use: function ( handlers ) { return this.on('PREPROCESSOR', handlers); },
	/**
	 * execution on error by point
	 *
	 * @param: { Array|Function }
	 * @returns: { Object }
	 */
};

/*-------------------------------------------------
	Create a method nammed like express
---------------------------------------------------*/
for ( var name in supportedMethods) {
	Super.prototype[name.toLowerCase()] = function alias ( handlers ) {
		return this.on(name.toUpperCase(), handlers);
	}
}
