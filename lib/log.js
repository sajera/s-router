
'use strict';

module.exports = require('s-declare').privat('privat-store-for-s-router')('log', ['s-logger',	function ( logger ) {
	// customize logger for router
	return logger.create('privat-logger-for-s-router', {
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
}]);