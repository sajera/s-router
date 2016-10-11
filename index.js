
'use strict'

module.exports = require('s-declare')('router', [
	'../../lib/log.js',
	'../../lib/Super.js',
	'../../lib/Params.js',
	'../../lib/Endpoint.js',
	'../../lib/Router.js',
	function ( log, Super, Params, Endpoint, Router ) {

		var MAP = {};
		/**
		 * mapper for management and asynchronous extradition routers by name
		 *
		 * @param: { String } - name/id
		 * @param: { Object } - options
		 * @returns: { Router }
		 * @publick
		 */
		return function ( id, options ) {
			id = String( id );
			!MAP[ id ] && ( MAP[ id ] = new Router( id, options||{}) );
			return MAP[ id ];
		};
}]);