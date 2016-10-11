
'use strict';

var ts = ({}).toString;
/*-------------------------------------------------
	constructor Params
---------------------------------------------------*/
module.exports = require('s-declare').privat('privat-store-for-s-router')('Params', function ( log ) {

	/**
	 * Constructor for provide a common to the each middlevare
	 * 
	 * @constructor
	 * @publick
	 */
	function Params () {
		// simple copy all data to body params
		Object.assign.apply(Object,[this].concat(Array.prototype.slice.call(arguments, 0)));
	};

	Params.prototype = {
		constructor: Params,
		instance: 'Params',
		log: log,
		/**
		 * @param: { any }
		 * @returns: { Boolean }
		 */
		isArray: function isArray ( data ) { return ts.call(data) == '[object Array]'; }
	};

	return Params;
});