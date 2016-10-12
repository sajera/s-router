
'use strict'

module.exports = require('s-declare')(null, [
	'./lib/log.js',
	'./lib/Router.js',
	function ( log, Router ) {

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