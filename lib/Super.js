
'use strict';

var ts = ({}).toString;
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
 * checking support of method by name for this node
 *
 * @param: { string }
 * @returns: { Boolean }
 */
function isSupportedMethod ( methodName ) {
	return supportedMethods.indexOf( methodName.toUpperCase() ) > -1;
}
/*-------------------------------------------------
	constructor Super
---------------------------------------------------*/
module.exports = require('s-declare')(null, [
	'./lib/log.js',
	function ( log ) {

		/**
		 * adding common functionality
		 *
		 * @constructor prototype
		 * @privat
		 */
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
					if ( ts.call(handler) == '[object Array]' ) {
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
		};
		/*-------------------------------------------------
			Create a method nammed like express
		---------------------------------------------------*/
		for ( var name of supportedMethods) {
			Super.prototype[name.toLowerCase()] = function alias ( handlers ) {
				return this.on(name.toUpperCase(), handlers);
			}
		}

		return Super;
}]);