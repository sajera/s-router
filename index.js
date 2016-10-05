
'use strict'

var log = require('s-logger').create('special-logger-for-s-router', {
	DEBUG: true,
	ERROR: {
		text: 'S-ROUTER-ERROR:',
		background: 'red',
		color: 'yellow',
	},
	WARN: {
		text: 'S-ROUTER-WARN:',
		background: 'yellow',
		color: 'red',
	},
	INFO: {
		text: 'S-ROUTER-INFO:',
		background: 'blue',
		color: 'white',
	},
	LOG: { text: 'S-ROUTER-LOG:'}
});

var Router = require('./lib/Router.js');
var MAP = {};

/**
 * mapper for management and asynchronous extradition routers by name
 *
 * @param: { String } - name/id
 * @param: { Object } - options
 * @returns: { Router }
 * @publick
 */
module.exports = mapper;

function mapper ( id, options ) {
	id = String( id );
	if ( !MAP[ id ] ) {
		MAP[ id ] = new Router( id, options );
	}
	return MAP[ id ];
}