
'use strict';

/*-------------------------------------------------
	constructor Endpoint
---------------------------------------------------*/
module.exports = require('s-declare')(null, [
	'./lib/Super.js',
	'./lib/log.js',
	function ( Super, log ) {
	
	/**
	 * data endpoint preparing
	 * {:path} - required - /(static name)/(dinamic data)/
	 * {?:path} - not required - /(static name - required even if its value is not obligatory)/(dinamic data)/
	 * {-:path} - convert to one part of query - /(expecting dinamic data)/
	 * {-?:path} - convert to one part of query - not required - /(expecting dinamic data)/
	 *
	 * @param: { String } - humanised pattern of endpoint
	 * @constructor
	 * @publick
	 */
	function Endpoint ( query ) {

		if ( typeof query !== 'string' ) { throw new Error('"query" must be a string'); }

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
		
	};

	Endpoint.prototype = new Super({
		constructor: Endpoint,
		instance: 'Endpoint',
		/**
		 * compare query with this endpoint
		 *
		 * @param: { String }
		 * @returns: { Boolean }
		 */
		compare: function ( query ) {
			return this.matcher.test( query );
		},

		/**
		 * get a query params from url
		 *
		 * @param: { String }
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

	return Endpoint;
}]);