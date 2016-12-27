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
    "data": {
        "prop1": 1,
        "prop2": true,
        "prop3": "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est nihil veniam, placeat suscipit voluptates nostrum porro tenetur sit consequatur illum incidunt adipisci itaque id earum quae tempora dolorem blanditiis perferendis.",
        "prop4": { "qwe": [1,2,3] }
    }
};
/**
 * 
 * @example
    send('head','/event/123')

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

    it('mapper', function () {
        expect( router(config.routerID) ).to.have.property('id').and.equal( config.routerID );
    });

    before(function() {
        // process.env.DEBUG = true;
        return new Promise(function ( resolve, reject ) {
            server = http.createServer( function ( request, response ){
                // console.log('got request', request.method, request.url);
                router( config.routerID ).middleware( request, response );
            })
            .listen({ port: config.port, }, function() {
                console.log('server open');
                resolve();
            })
            .on('close', function () { console.log('server close'); })
            .on('error', function (e) { console.log('server error'); })
        });
    });

    after(function() {
        server.close();
        // delete process.env.DEBUG;
    });
    /*-------------------------------------------------
        UNITS    
    ---------------------------------------------------*/
    // require('./test-units.js');
    describe('units', function() {

        describe('name head-unit', function () {
            router(config.routerID).unit('head-unit', '');

            it('mapping', function () {
                expect( router(config.routerID).unit('head-unit') ).to.have.property('id').and.equal('head-unit');
                expect( router(config.routerID).unit('head-unit') ).to.have.property('query').and.equal('');
            });
            it('common "on"', function () {
                expect( router(config.routerID).unit('head-unit').on ).to.be.a('function');
            });

            router( config.routerID )
                .unit('head-unit')
                    .use(function ( request, response, params ) {
                        params.queue.push('head-unit => use');
                    })
                    .head(function ( request, response, params ) {
                        params.queue.push('head-unit => head');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'body': body
                        });
                        response.end('ok');
                    });
        });

        describe('name post-unit', function () {
            router(config.routerID).unit('post-unit', '');

            it('mapping', function () {
                expect( router(config.routerID).unit('post-unit') ).to.have.property('id').and.equal('post-unit');
                expect( router(config.routerID).unit('post-unit') ).to.have.property('query').and.equal('');
            });
            it('common "on"', function () {
                expect( router(config.routerID).unit('post-unit').on ).to.be.a('function');
            });

            router(config.routerID)
                .unit('post-unit')
                    .use(function ( request, response, params ) {
                        params.queue.push('post-unit => use');
                    })
                    .post(function ( request, response, params ) {
                        params.queue.push('post-unit => post');
                        return new Promise(function ( resolve, reject ) {
                            var body = '';
                            request.on('error', reject )
                                .on('data', function ( part ) { body += part; })
                                .on('end', function () {
                                    params.body = body;
                                    resolve();
                                })
                        });
                    })
        });

        describe('name auth-unit', function () {
            router(config.routerID).unit('auth-unit', '/{:auth}');

            it('mapping', function () {
                expect( router(config.routerID).unit('auth-unit') ).to.have.property('id').and.equal('auth-unit');
                expect( router(config.routerID).unit('auth-unit') ).to.have.property('query').and.equal('/{:auth}');
            });
            it('common "on"', function () {
                expect( router(config.routerID).unit('auth-unit').on ).to.be.a('function');
            });

            router(config.routerID)
                .unit('auth-unit')
                    .use(function ( request, response, params ) {
                        params.authData = 'auth-unit result';
                        params.queue.push('auth-unit => use1');
                    })
                    .use(function ( request, response, params ) {
                        params.queue.push('auth-unit => use2');
                    })
        });

    });
    /*-------------------------------------------------
        ENDPOINTS
    ---------------------------------------------------*/
    // require('./test-endpoints.js');
    describe('endpoints', function() {

        router(config.routerID).otherwise = function ( request, response, params ) {
            params.queue.push('router => otherwice');
            var body = JSON.stringify(params.queue);
            response.writeHead(404, {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                'body': body
            });
            response.end(body);
        };

        router(config.routerID)
            .use(function ( request, response, params ) {
                // create array for queue listeners
                params.queue = ['router => use'];
            })
            .error(function ( request, response, params ) {
                params.queue.push('router => error');
                var body = JSON.stringify(params.queue);
                response.writeHead(501, {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                });
                response.end(body);
            });


        describe('name post-unit.head-unit.event /event/123', function () {
            router(config.routerID).endpoint('post-unit.head-unit.event', '/{:event}');

            it('endpoint map', function () {
                expect( router(config.routerID).endpoint('post-unit.head-unit.event') ).to.have.property('id').and.equal('post-unit.head-unit.event');
            });
            it('endpoint common on', function () {
                expect( router(config.routerID).endpoint('post-unit.head-unit.event').on ).to.be.a('function');
            });
            // /event/123
            router(config.routerID)
                .endpoint('post-unit.head-unit.event')
                    .use(function ( request, response, params ) {
                        params.queue.push('post-unit.head-unit.event => use');
                    })
                    .get(function ( request, response, params ) {
                        params.queue.push('post-unit.head-unit.event => get');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    .post(function ( request, response, params ) {
                        params.queue.push('post-unit.head-unit.event => post');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    .put(function ( request, response, params ) {
                        params.queue.push('post-unit.head-unit.event => put');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    .delete(function ( request, response, params ) {
                        params.queue.push('post-unit.head-unit.event => delete');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
        });

        describe('name post-unit.auth-unit.event /auth/123/event/123', function () {
            router(config.routerID).endpoint('post-unit.auth-unit.event', '/{:event}');

            it('endpoint map', function () {
                expect( router(config.routerID).endpoint('post-unit.auth-unit.event') ).to.have.property('id').and.equal('post-unit.auth-unit.event');
            });
            it('endpoint common on', function () {
                expect( router(config.routerID).endpoint('post-unit.auth-unit.event').on ).to.be.a('function');
            });
            // /auth/123/event/123
            router(config.routerID)
                .endpoint('post-unit.auth-unit.event')
                    .use(function ( request, response, params ) {
                        params.queue.push('post-unit.auth-unit.event => use');
                    })
                    .get(function ( request, response, params ) {
                        params.queue.push('post-unit.auth-unit.event => get');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    .post(function ( request, response, params ) {
                        params.queue.push('post-unit.auth-unit.event => post');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    .put(function ( request, response, params ) {
                        params.queue.push('post-unit.auth-unit.event => put');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
                    .delete(function ( request, response, params ) {
                        params.queue.push('post-unit.auth-unit.event => delete');
                        var body = JSON.stringify(params.queue);
                        response.writeHead(200, {
                            'Content-Type': 'application/json',
                            'Content-Length': Buffer.byteLength(body)
                        });
                        response.end(body);
                    })
        });
    });


    var path = '/event/123';
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
                                'post-unit.head-unit.event => put'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
    });

    var path2 = '/auth/123/event/123';
    describe('requests '+path2, function() {
        it('OPTION auth answer expect', function ( done ) {
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
                                'auth-unit => use1',
                                'auth-unit => use2',
                                'post-unit.auth-unit.event => use',
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
                        'auth-unit => use1',
                        'auth-unit => use2',
                        'post-unit.auth-unit.event => use',
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
                                'auth-unit => use1',
                                'auth-unit => use2',
                                'post-unit.auth-unit.event => use',
                                'post-unit.auth-unit.event => get'
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
                                'auth-unit => use1',
                                'auth-unit => use2',
                                'post-unit.auth-unit.event => use',
                                'post-unit.auth-unit.event => delete'
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
                                'auth-unit => use1',
                                'auth-unit => use2',
                                'post-unit.auth-unit.event => use',
                                'post-unit => post',
                                'post-unit.auth-unit.event => post'
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
                                'auth-unit => use1',
                                'auth-unit => use2',
                                'post-unit.auth-unit.event => use',
                                'post-unit.auth-unit.event => put'
                            ]);
                            done();
                        })
                })
                .catch(done);
        });
    });

}); // s-router