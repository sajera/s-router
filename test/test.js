
'use strict';

console.log('test');

var log = console.log.bind(console);
var HTTP = require('http');
var router = require('../index.js')('router-id',{
	debug: true,
	error: function ( request, response, params ) {
		log('WARN', 'defaultError:', arguments);

		// TEST !!!!!
		response.end('qwe');
	}
});

// make a server for testing
HTTP.createServer(router.middleware).listen( 80 );


router
	// '/some/api/p1/12345/p2/12345/static/1234/p4/1234/'
	.endpoint('test', '/some/api/{:p1}/{:p2}/static/{-:p3}/{?:p4}')
	.on('get', function ( request, response, params ) {
		log('endpoint test1 get', params);
		params.test();
		params.next();
	})
	.on('get', function ( request, response, params ) {
		return new Promise(function ( resolve, reject ) {
			log('endpoint test2 get', params);
				throw new Error('test error'); // error
			setTimeout(function () {
				log('endpoint test2 end', params);
				// reject();
				resolve();
			}, 1000);
		});
	});


router
	.endpoint('test')
	.on('get', function ( request, response, params ) {
		log('endpoint test3 get', params);
		params.next();
	});


router
	.on('get', function ( request, response, params ) {
	log('router test get', params);
	params.next();
})

router
	.on('error', function ( request, response, params ) {
		log('router test error', params);
		params.next();
	});

router
	.endpoint('test')
	.on('error', function ( request, response, params ) {
		log('endpoint test error', params);
		params.next();
	});


router.extendParams(function () {
	this.test = function () {
		console.log(this);
	}
});

var mapper = require('../index.js');

var router = mapper('id-of-this-router', {/* options */}); 

var endpoint = router.endpoint('test-id-of-endpoint', '/some/api/{:test}')



if (
	router === require('../index.js')('id-of-this-router') &&
	endpoint === require('../index.js')('id-of-this-router').endpoint('test-id-of-endpoint')
) {
	console.log( 'Completely usability victory !!!' );
} else {
	console.log( 'Completely fail ...' );
};



	// TEST Endpoint matcher
	// '/some/api/{=:p1}/{=:p2}/static/{-:p3}/{?:p4}/';
	// console.log({
	// 	query: query,
	// 	matcher: this.matcher,
	// 	'/some/api/p1/12345/p2/12345/static/1234/p4/1234/': {
	// 		mathc: this.matchParams('/some/api/p1/12345/p2/12345/static/1234/p4/1234/'),
	// 		test: this.compare('/some/api/p1/12345/p2/12345/static/1234/p4/1234/'),
	// 	},
	// 	'/some/api/p1/12345/p2/12345/static/1234/p4/1234': {
	// 		mathc: this.matchParams('/some/api/p1/12345/p2/12345/static/1234/p4/1234'),
	// 		test: this.compare('/some/api/p1/12345/p2/12345/static/1234/p4/1234'),
	// 	},
	// 	'/some/api/p1/12345/p2/12345/static/1234/p4/': {
	// 		mathc: this.matchParams('/some/api/p1/12345/p2/12345/static/1234/p4/'),
	// 		test: this.compare('/some/api/p1/12345/p2/12345/static/1234/p4/'),
	// 	},
	// 	'/some/api/p1/12345/p2/12345/static/1234/p4': {
	// 		mathc: this.matchParams('/some/api/p1/12345/p2/12345/static/1234/p4'),
	// 		test: this.compare('/some/api/p1/12345/p2/12345/static/1234/p4/'),
	// 	},
	// 	'/some/api/p1/12345/p2/12345/static/q_we/p4/qw_e/': {
	// 		mathc: this.matchParams('/some/api/p1/12345/p2/12345/static/q_we/p4/qw_e/'),
	// 		test: this.compare('/some/api/p1/12345/p2/12345/static/q_we/p4/qw_e/'),
	// 	},
	// 	// wrong
	// 	'/some/api/p1/12345/p2/12345/static/123/': {
	// 		mathc: this.matchParams('/some/api/p1/12345/p2/12345/static/123/'),
	// 		test: this.compare('/some/api/p1/12345/p2/12345/static/123/'),
	// 	},
	// 	'/some/api/p1/12345/p2/12345/static/123': {
	// 		mathc: this.matchParams('/some/api/p1/12345/p2/12345/static/123'),
	// 		test: this.compare('/some/api/p1/12345/p2/12345/static/123'),
	// 	}
	// });
