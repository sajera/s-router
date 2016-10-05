
'use strict';

console.log('Params.js');

var ts = ({}).toString;

/**
 * 
 * @param: { Object } - extend of parameters
 * @param: { Array } - decorators of parameters
 * @constructor
 * @publick
 */
module.exports = Params;

function Params () {
	// simple copy all data to body params
	Object.assign.apply(Object,[this].concat(Array.prototype.slice.call(arguments, 0)));
};


Params.prototype = {
	constructor: Params,
	instance: 'Params',
	isArray: function ( data ) { return ts.call(data) == '[object Array]'; },
};