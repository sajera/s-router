console.log('test');

var HTTP = require('http');
var router = require('../index.js')('router-id',{});
var log = require('s-logger').get('special-logger-for-s-router');


HTTP
	.createServer(function ( request, response ) {
		router.manager( request, response );
	})
	.listen( 80 );


router
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


router.extendParams(function ( data ) {
	this.test = function () {
		console.log(this);
	}
});



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

