
console.log('test');

var is = require('s-is');
var router = require('../s-router.js');
router.DEBUG = true;

var routerInstance = router('router-id');

var server = (require('http')).createServer(routerInstance.middleware)
    .listen({
        port: 80
    }, function() {
        console.log('server ready', arguments);
    })
    .on('close', function () {
        console.log('close', arguments);
    });

if ( is.platform.browser() ) {
    window.router = router;
    window.server = server;
    window.is = is;
}

router('router-id').unit('some', '/some/api/{:p1}').use([function ( request, response, params ) {
    console.log('unit some', params.options);
}])

router('router-id')
    // '/some/api/p1/12345/p2/12345/static/1234/p4/1234/'
    .endpoint('some.test', '/{:p2}/static/{-:p3}/{?:p4}')
    .on('get', function ( request, response, params ) {
        console.log('endpoint test get');
        params.test();
    })
    .get([function ( request, response, params ) {
        return new Promise(function ( resolve, reject ) {
            console.log('endpoint test get2');
                // throw new Error('test error'); // error
            setTimeout(function () {
                console.log('endpoint test get2 end');
                // reject();
                resolve();
                response.end('test');
            }, 1000);
        });
    }]);


router('router-id').error(function ( request, response, params ) {
    console.log('test error handler', params.error, '\n'+request.url);

    response.end('error');
    // throw new Error('huy');
});

router('router-id').extendParams(function () {
    this.test = function () {
        console.log('test this params');
    }
});
