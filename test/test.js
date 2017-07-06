/*
* Unit tests for s-router.js
*/
var expect = require('chai').expect;

var http = require('http');
var parse = require('url').parse;
var Buffer = require('buffer').Buffer;
var router = module.exports = require('../s-router.js');

var server;
var config = {
    "port": 65530,
    "protocol": "http:",
    "routerID": "router-id",
    "urlId": '123',
    "data": {
        "prop1": 1,
        "prop2": true,
        "prop3": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est nihil veniam, placeat suscipit voluptates nostrum porro tenetur sit consequatur illum incidunt adipisci itaque id earum quae tempora dolorem blanditiis perferendis.",
        "prop4": { "qwe": [1,2,3] }
    }
};
/**
 * helper to make a requests
 * @example send('head','/event/123')
 * @param { String } : method
 * @param { String } : url
 * @param { Object } : data
 * @returns { Promise }
 */
function send ( method, url, data ) {

    var opt = Object.assign(parse(url), {
        port: config.port,
        protocol: config.protocol,
        method: method.toUpperCase()
    });

    return new Promise(function ( resolve, reject ) {
        var req = http.request(opt, resolve).on('error', reject);
        if ( data && req.write ) req.write( JSON.stringify(data) );
        req.end();
    });
}

describe('s-router', function() {
    // prepare router instance
    var routerInstance = router(config.routerID);

    it('s-router instance', function () {
        expect( routerInstance ).to.have.property('id').and.equal( config.routerID );
        expect( routerInstance.middleware ).to.be.a('function');
        expect( routerInstance.endpoint ).to.be.a('function');
        expect( routerInstance.unit ).to.be.a('function');
    });

    it('s-router instance shold have common "on"', function () {
        expect( routerInstance.on ).to.be.a('function');
    });

    it('s-router instance shold equal stored router', function () {
        expect( routerInstance ).to.equal( router(config.routerID) );
    });

    it('s-router options DEBUG enable', function () {
        router.DEBUG = true
        expect( router.DEBUG ).to.equal( require('../s-router.js').DEBUG );
    });

    routerInstance
        // set handler for each request
        // it will execute first
        .use(function ( request, response, params ) {
            // create array for queue listeners
            params.queue = ['router => use'];
        })
        // set handler for each errors
        // it will execute last in queue of errors
        .error(function ( request, response, params ) {
            params.queue.push('router => error');
            var body = JSON.stringify(params.queue);
            response.writeHead(501, {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            });
            response.end(body);
        });

    // set handler for unspecified requests
    routerInstance.otherwise = function ( request, response, params ) {
        params.queue.push('router => otherwice');
        var body = JSON.stringify(params.queue);
        response.writeHead(404, {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'body': body
        });
        response.end(body);
    };

    // start server with s-router instance
    before(function() {
        return new Promise(function ( resolve, reject ) {
            // short variant
            // server = http.createServer(routerInstance.middleware).listen({port: config.port}, resolve);
            // add your additional logic for preparing requests
            server = http.createServer( function ( request, response ){
                // console.log('got request', request.method, request.url);
                routerInstance.middleware( request, response );
            })
            .listen({ port: config.port }, function() {
                console.log('server start');
                resolve();
            })
            .on('close', function () { /*console.log('server close');*/ })
            .on('error', function (e) { console.log('server error'); })
        });
    });
    // stop server after tests
    after(function() { server.close(); });
    /*-------------------------------------------------
        UNITS
    ---------------------------------------------------*/
    describe('UNITS:', function() {

        describe('s-router instance create unit "head-unit"', function () {
            var unitName = 'head-unit';
            var unitUrlPart = '';
            var unitInstance = router(config.routerID).unit(unitName, unitUrlPart);

            it('s-router unit instance', function () {
                expect( unitInstance ).to.have.property('id').and.equal( unitName );
            });

            it('s-router unit instance shold equal stored unit', function () {
                expect( unitInstance ).to.equal( router(config.routerID).unit(unitName) );
            });

            it('s-router unit instance shold have common "on"', function () {
                expect( unitInstance.on ).to.be.a('function');
            });

            unitInstance
                // if it will be added to endpoint
                // Added only for tests to check the correctness of building queues of handlers
                .use(function ( request, response, params ) {
                    // Determines its place of execution in the queue
                    params.queue.push(unitName+' => use');
                })
                // case when unit hadle end responded for all head request
                // if it will be added to endpoint
                .head(function ( request, response, params ) {
                    // Determines its place of execution in the queue
                    params.queue.push(unitName+' => head');

                    var body = JSON.stringify(params.queue);
                    response.writeHead(200, {
                        'Content-Type': 'application/json',
                        'body': body
                    });
                    // each handler can prevent propogation of listeners
                    // if it use response.end
                    response.end('ok');
                });
        });

        describe('s-router instance create unit "post-unit"', function () {
            var unitName = 'post-unit';
            var unitUrlPart = '';
            var unitInstance = router(config.routerID).unit(unitName, unitUrlPart);

            it('s-router unit instance', function () {
                expect( unitInstance ).to.have.property('id').and.equal( unitName );
            });

            it('s-router unit instance shold equal stored unit', function () {
                expect( unitInstance ).to.equal( router(config.routerID).unit(unitName) );
            });

            it('s-router unit instance shold have common "on"', function () {
                expect( unitInstance.on ).to.be.a('function');
            });

            unitInstance
                // if it will be added to endpoint
                // Added only for tests to check the correctness of building queues of handlers
                .use(function ( request, response, params ) {
                    // Determines its place of execution in the queue
                    params.queue.push(unitName+' => use');
                })
                // case when unit hadle end prepare post data
                // if it will be added to endpoint
                .post(function ( request, response, params ) {
                    // Determines its place of execution in the queue
                    params.queue.push(unitName+' => post');

                    return new Promise(function ( resolve, reject ) {
                        var body = '';
                        // This approach is not recommended
                        // Used only for tests
                        request.on('error', reject )
                            .on('data', function ( part ) { body += part; })
                            .on('end', function () {
                                params.body = JSON.parse(body);
                                resolve();
                            })
                    });
                })
        });

        describe('s-router instance create unit "part-unit"', function () {
            var unitName = 'part-unit';
            var unitUrlPart = '/{:part}';
            var unitInstance = router(config.routerID).unit(unitName, unitUrlPart);

            it('s-router unit instance', function () {
                expect( unitInstance ).to.have.property('id').and.equal( unitName );
            });

            it('s-router unit instance shold equal stored unit', function () {
                expect( unitInstance ).to.equal( router(config.routerID).unit(unitName) );
            });

            it('s-router unit instance shold have common "on"', function () {
                expect( unitInstance.on ).to.be.a('function');
            });

            unitInstance
                // if it will be added to endpoint
                // Added to params object prepered data from url path
                .use(function ( request, response, params ) {
                    // prepare post data end add it to parameters
                    params.partData = unitName+' result: '+params.options.part;
                    // Determines its place of execution in the queue
                    params.queue.push(unitName+' => use1');
                })
                // if it will be added to endpoint
                // Added only for tests to check the correctness of building queues of handlers
                .use(function ( request, response, params ) {
                    // Determines its place of execution in the queue
                    params.queue.push(unitName+' => use2');
                })
        });
    });
    /*-------------------------------------------------
        ENDPOINTS
    ---------------------------------------------------*/
    describe('ENDPOINTS:', function() {

        describe('s-router instance create endpoint "post-unit.head-unit.event" (/event/123)', function () {
            var endpointName = 'post-unit.head-unit.event';
            var endpointUrlPart = '/{:event}';
            var endpointInstance = router(config.routerID).endpoint(endpointName, endpointUrlPart);

            it('s-router endpoint instance', function () {
                expect( endpointInstance ).to.have.property('id').and.equal( endpointName );
            });

            it('s-router endpoint instance shold equal stored endpoint', function () {
                expect( endpointInstance ).to.equal( router(config.routerID).endpoint(endpointName) );
            });

            it('s-router endpoint instance shold have common "on"', function () {
                expect( endpointInstance.on ).to.be.a('function');
            });

            endpointInstance // ... /event/123
                    // Added only for tests to check the correctness of building queues of handlers
                    .use(function ( request, response, params ) {
                        // Determines its place of execution in the queue
                        params.queue.push(endpointName+' => use');
                    })
                    // case when endpoint handler format answer for GET request
                    .get(function ( request, response, params ) {

                        describe('handle GET request of "'+endpointName+'"', function () {

                            it('url query params ', function () {
                                expect(params.options).to.be.a('object').have.property('event').to.be.equal(config.urlId);
                            });
                        });
                        // Determines its place of execution in the queue
                        params.queue.push(endpointName+' => get');
                        // send answer with queue to determine correctnes of execution queue
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    // case when endpoint handler format answer for POST request
                    .post(function ( request, response, params ) {

                        describe('handle POST request of "'+endpointName+'"', function () {

                            it('url query params ', function () {
                                expect(params.options).to.be.a('object').have.property('event').to.be.equal(config.urlId);
                            });
                            // in this case unit "post-unit" already got and prepare post data
                            it('post data shold equal sendend data', function () {
                                expect(params.body).to.be.a('object').and.eql(config.data);
                            });
                        });
                        // Determines its place of execution in the queue
                        params.queue.push(endpointName+' => post');
                        // send answer with queue to determine correctnes of execution queue
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    .put(function ( request, response, params ) {
                            // Determines its place of execution in the queue
                            params.queue.push(endpointName+' => put1');
                            // put data need to be prepared becose we specified prepering data only for POST =)
                            return new Promise(function ( resolve, reject ) {
                                var body = '';
                                // This approach is not recommended
                                // Used only for tests
                                request.on('error', reject )
                                    .on('data', function ( part ) { body += part; })
                                    .on('end', function () {
                                        params.body = JSON.parse(body);
                                        resolve();
                                    })
                            });
                    })
                    .put(function ( request, response, params ) {

                            describe('handle PUT request of "'+endpointName+'"', function () {

                                it('url query params ', function () {
                                    expect(params.options).to.be.a('object').have.property('event').to.be.equal(config.urlId);
                                });
                                // in this case unit "post-unit" du not prepare data becose it do this only on POST
                                // but we use 2 hendlers for put method and in previouse method prepare data
                                it('post data shold equal sendend data', function () {
                                    expect(params.body).to.be.a('object').and.eql(config.data);
                                });
                            });
                            // Determines its place of execution in the queue
                            params.queue.push(endpointName+' => put2');
                            // send answer with queue to determine correctnes of execution queue
                            var body = JSON.stringify(params.queue);
                            response.writeHead(200, {
                                'Content-Type': 'application/json',
                                'Content-Length': Buffer.byteLength(body)
                            });
                            response.end(body);
                    })
                    .delete(function ( request, response, params ) {
                        describe('handle DELETE request of "'+endpointName+'"', function () {
                            it('url query params ', function () {
                                expect(params.options).to.be.a('object').have.property('event').to.be.equal(config.urlId);
                            });
                        });
                        // Determines its place of execution in the queue
                        params.queue.push('post-unit.head-unit.event => delete');
                        // send answer with queue to determine correctnes of execution queue
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
        });

        describe('name post-unit.part-unit.event /part/123/event/123', function () {
            router(config.routerID).endpoint('post-unit.part-unit.event', '/{:event}');

            it('endpoint map', function () {
                expect( router(config.routerID).endpoint('post-unit.part-unit.event') ).to.have.property('id').and.equal('post-unit.part-unit.event');
            });
            it('endpoint common on', function () {
                expect( router(config.routerID).endpoint('post-unit.part-unit.event').on ).to.be.a('function');
            });
            // /part/123/event/123
            router(config.routerID)
                .endpoint('post-unit.part-unit.event')
                    .use(function ( request, response, params ) {
                        params.queue.push('post-unit.part-unit.event => use');
                    })
                    .get(function ( request, response, params ) {
                        params.queue.push('post-unit.part-unit.event => get');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    .post(function ( request, response, params ) {
                        params.queue.push('post-unit.part-unit.event => post');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    .put(function ( request, response, params ) {
                        params.queue.push('post-unit.part-unit.event => put');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    .delete(function ( request, response, params ) {
                        params.queue.push('post-unit.part-unit.event => delete');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
        });
    });


    var path = '/event/'+config.urlId;
    describe('requests '+path, function() {
        it('OPTIONS answer expect', function ( done ) {
            send('options', path)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(404);
                    expect( success ).to.have.property('statusMessage').and.equal('Not Found');
                    var body = '';
                    success
                        .on('data', function ( part ) { body+=part; })
                        .on('end', function () {
                            expect( JSON.parse(body) ).to.be.a('array').and.eql([
                                'router => use',
                                'post-unit => use',
                                'head-unit => use',
                                'post-unit.head-unit.event => use',
                                'router => otherwice'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
        it('HEAD answer expect', function ( done ) {
            send('head', path)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(200);
                    expect( success ).to.have.property('statusMessage').and.equal('OK');
                    expect( JSON.parse(success.headers.body) ).to.be.a('array').and.eql([
                        'router => use',
                        'post-unit => use',
                        'head-unit => use',
                        'post-unit.head-unit.event => use',
                        'head-unit => head'
                    ]);
                    done();
                })
                .catch(done);
        });
        it('GET answer expect', function ( done ) {
            send('GET', path)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(200);
                    expect( success ).to.have.property('statusMessage').and.equal('OK');
                    var body = '';
                    success
                        .on('data', function ( part ) { body+=part; })
                        .on('end', function () {
                            expect( JSON.parse(body) ).to.be.a('array').and.eql([
                                'router => use',
                                'post-unit => use',
                                'head-unit => use',
                                'post-unit.head-unit.event => use',
                                'post-unit.head-unit.event => get'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
        it('DELETE answer expect', function ( done ) {
            send('delete', path)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(200);
                    expect( success ).to.have.property('statusMessage').and.equal('OK');
                    var body = '';
                    success
                        .on('data', function ( part ) { body+=part; })
                        .on('end', function () {
                            expect( JSON.parse(body) ).to.be.a('array').and.eql([
                                'router => use',
                                'post-unit => use',
                                'head-unit => use',
                                'post-unit.head-unit.event => use',
                                'post-unit.head-unit.event => delete'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
        it('POST answer expect', function ( done ) {
            send('post', path, config.data)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(200);
                    expect( success ).to.have.property('statusMessage').and.equal('OK');
                    var body = '';
                    success
                        .on('data', function ( part ) { body+=part; })
                        .on('end', function () {
                            expect( JSON.parse(body) ).to.be.a('array').and.eql([
                                'router => use',
                                'post-unit => use',
                                'head-unit => use',
                                'post-unit.head-unit.event => use',
                                'post-unit => post',
                                'post-unit.head-unit.event => post'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
        it('PUT answer expect', function ( done ) {
            this.timeout(5000);
            send('put', path, config.data)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(200);
                    expect( success ).to.have.property('statusMessage').and.equal('OK');
                    var body = '';
                    success
                        .on('data', function ( part ) { body+=part; })
                        .on('end', function () {
                            expect( JSON.parse(body) ).to.be.a('array').and.eql([
                                'router => use',
                                'post-unit => use',
                                'head-unit => use',
                                'post-unit.head-unit.event => use',
                                'post-unit.head-unit.event => put1',
                                'post-unit.head-unit.event => put2'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
    });

    var path2 = '/part/'+config.urlId+'/event/'+config.urlId;
    describe('requests '+path2, function() {
        it('OPTION part answer expect', function ( done ) {
            send('options', path2)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(404);
                    expect( success ).to.have.property('statusMessage').and.equal('Not Found');
                    var body = '';
                    success
                        .on('data', function ( part ) { body+=part; })
                        .on('end', function () {
                            expect( JSON.parse(body) ).to.be.a('array').and.eql([
                                'router => use',
                                'post-unit => use',
                                'part-unit => use1',
                                'part-unit => use2',
                                'post-unit.part-unit.event => use',
                                'router => otherwice'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
        it('HEAD answer expect', function ( done ) {
            send('head', path2)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(404);
                    expect( success ).to.have.property('statusMessage').and.equal('Not Found');
                    expect( JSON.parse(success.headers.body) ).to.be.a('array').and.eql([
                        'router => use',
                        'post-unit => use',
                        'part-unit => use1',
                        'part-unit => use2',
                        'post-unit.part-unit.event => use',
                        'router => otherwice'
                    ]);
                    done();
                })
                .catch(done);
        });
        it('GET answer expect', function ( done ) {
            send('GET', path2)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(200);
                    expect( success ).to.have.property('statusMessage').and.equal('OK');
                    var body = '';
                    success
                        .on('data', function ( part ) { body+=part; })
                        .on('end', function () {
                            expect( JSON.parse(body) ).to.be.a('array').and.eql([
                                'router => use',
                                'post-unit => use',
                                'part-unit => use1',
                                'part-unit => use2',
                                'post-unit.part-unit.event => use',
                                'post-unit.part-unit.event => get'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
        it('DELETE answer expect', function ( done ) {
            send('delete', path2)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(200);
                    expect( success ).to.have.property('statusMessage').and.equal('OK');
                    var body = '';
                    success
                        .on('data', function ( part ) { body+=part; })
                        .on('end', function () {
                            expect( JSON.parse(body) ).to.be.a('array').and.eql([
                                'router => use',
                                'post-unit => use',
                                'part-unit => use1',
                                'part-unit => use2',
                                'post-unit.part-unit.event => use',
                                'post-unit.part-unit.event => delete'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
        it('POST answer expect', function ( done ) {
            send('post', path2, config.data)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(200);
                    expect( success ).to.have.property('statusMessage').and.equal('OK');
                    var body = '';
                    success
                        .on('data', function ( part ) { body+=part; })
                        .on('end', function () {
                            expect( JSON.parse(body) ).to.be.a('array').and.eql([
                                'router => use',
                                'post-unit => use',
                                'part-unit => use1',
                                'part-unit => use2',
                                'post-unit.part-unit.event => use',
                                'post-unit => post',
                                'post-unit.part-unit.event => post'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
        it('PUT answer expect', function ( done ) {
            send('put', path2, config.data)
                .then(function ( success ) {
                    expect( success ).to.be.a('object');
                    expect( success ).to.have.property('headers');
                    expect( success ).to.have.property('statusCode').and.equal(200);
                    expect( success ).to.have.property('statusMessage').and.equal('OK');
                    var body = '';
                    success
                        .on('data', function ( part ) { body+=part; })
                        .on('end', function () {
                            expect( JSON.parse(body) ).to.be.a('array').and.eql([
                                'router => use',
                                'post-unit => use',
                                'part-unit => use1',
                                'part-unit => use2',
                                'post-unit.part-unit.event => use',
                                'post-unit.part-unit.event => put'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
    });

}); // s-router
