
[![NPM version][npm-image]][npm-url]
[![License][license-image]][license-url]

s-router
===============
###### Router for slicing a middleware by endpoints.

### installation
```shell
npm i s-router --save
```

### Router map 

The router offers several abstractions to build a route-map. Using these abstractions to create a clear and easy to use / configuring, a route map. It does not impose restrictions on the formation of your server architecture. And it allows you to distribute of the configuration and the execution of the routing so as you wish.

>**queue** - the sequence in which the handler will be executed

>**Params** - instances with results of handlers. Which make transmitting the data between them.

>**router** - owner of map with handlers

>**endpoint** - one of the routes of the router

>**unit** - route element

--------------

### Example configuring

To understand the the map makes sense to describe the endpoints in one place. This is not the only option, but popular.

```javascript
var mapper = require('s-router');
// create instance of router
var router = mapper('id-of-this-router'); 
// create instance of endpoint to handling /some/api/test/anyString[/] or /some/api/test[/]
var endpoint = router.endpoint('test-id-of-endpoint', '/some/api/{?:test}');
// create instance of endpoint to handling /some/api/test2/anyString[/]
var endpoint2 = router.endpoint('test-id-of-endpoint2', '/some/api/{:test2}');

```

### Example handling

When we already have started endpoints. We can refer to them by name. And set queue of handlers which would create response. Each method of adding processors can take as a function or an array of functions.

```javascript

var router = require('s-router')('id-of-this-router')

router
    // '/some/p1/1231'
    .endpoint('test-id-of-endpoint', 'some/{:p1}')
    .get(function ( request, response, params ) {
        params.prepareSome = 2;
    })
    .get(function ( request, response, params ) {
        params.prepareSome // 2
        response.end('nothing');
    })
    .post(function ( request, response, params ) {
        response.end('nothing');
    })
    .error(function ( request, response, params ) {
        params.error // contain error message for this endpoint
        response.end('error');
    })
    .use(function ( request, response, params ) {
        // execute before queue of endpoint

    })
    .use(function ( request, response, params ) {
        // execute before queue of endpoint but after previous endpoint 'use' handler
        // all next in the queue be wait this promise
        return new Promise(function ( resolve, reject ) { resolve(); });
    });

```

### Example pretreatment

In turn, the instance router may pretreated with any request. Each request and by methods. It contains the same methods as the endpoint. But his handlers are added to the top of the queue, before the queue of end point.

```javascript

var router = require('s-router')('id-of-this-router')

router.get(function ( request, response, params ) {
        // execute before get queue each of endpoints
    })
    .post(function ( request, response, params ) {
        // execute before post queue each of endpoints
    })
    .error(function ( request, response, params ) {
        // execute after errors each of endpoints
    })
    .use(function ( request, response, params ) {
        // execute before queue each of endpoints
    })
    .use(function ( request, response, params ) {
        // execute before queue each of endpoint but after previous router 'use' handler
        // all next in the queue be wait this promise
        return new Promise(function ( resolve, reject ) { resolve(); });
    });

```

### Example Params extend

An instance of the parameters(third arguments) for each request is new. If it becomes necessary to add the values - instance of router involves functionality the expansion prototype of the constructor Params. How it looks.

```javascript

var router = require('s-router')('id-of-this-router')

router.extendParams(function () {
    this.test = function () {
        console.log('I am a method - which will be available in all handlers like a params.test()');
    };
});

```

### Example Unit

Endpoints may use the same preparation handlers. They can put into groups called by actions they solve.

```javascript

var router = require('s-router')('id-of-this-router')

router.unit('someUnit', '/some/{:api}')
    .get(function ( request, response, params ) {
        params.options.api;
        params.somePrepare.push(1);
        console.log('unit some prepering action on GET');
    })
    .use(function ( request, response, params ) {
        params.somePrepare = [];
        console.log('unit some prepering action on each request');
    });
    
// create endpoint wich handle '/some/api/1/p1/1231'
router.endpoint('someUnit.id-of-endpoint', '/{:p1}')
    .get(function ( request, response, params ) {
        params.options.p1; // => 1231
        params.options.api; // => 1
        params.somePrepare; // => [1]
    });
    
// create endpoint wich handle '/some/api/2/p2/1231/id/2'
router.endpoint('someUnit.id-enother', '/{:p2}/{?:id}')
    .get(function ( request, response, params ) {
        params.options.p1; // => undefined
        params.options.p2; // => 1231
        params.options.id; // => 2
        params.options.api; // => 2
        params.somePrepare; // => [1]
    })
```

**Note:** You can build your map as you wish. These are only examples, "as it could be"

#### [```API documentation ```](https://github.com/sajera/s-router/blob/master/doc/API.md)

[npm-image]: https://badge.fury.io/js/s-router.svg
[npm-url]: https://npmjs.org/package/s-router
[license-image]: http://img.shields.io/npm/l/s-router.svg
[license-url]: LICENSE
