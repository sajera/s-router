
'use strict';

var ts = ({}).toString;
/*-------------------------------------------------
	constructor Params
---------------------------------------------------*/
module.exports = require('s-declare')(null, [
	'./lib/log.js',
	function ( log ) {

	/**
	 * Constructor for provide a common to the each middlevare
	 * 
	 * @constructor
	 * @publick
	 */
	function Params () {
		// simple copy all data to body params
		Object.assign.apply(Object,[this].concat(Array.prototype.slice.call(arguments, 0)));
		// customization prepering params
		this.initialize();
	};

	Params.prototype = {
		constructor: Params,
		instance: 'Params',
		log: log,
		/**
		 * @param: { any }
		 * @returns: { Boolean }
		 */
		isArray: function isArray ( data ) { return ts.call(data) == '[object Array]'; },
		/**
		 * method to override
		 */
		initialize: function () {}
	};

	return Params;
}]);