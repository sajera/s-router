
[![NPM version][npm-image]][npm-url]

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

>**router** - can contain endpoints and global handlers which be added to begin of queue

>**endpoint** - can contain handlers, which be added to queue after global handlers

--------------

### Example configuring

To understand the the map makes sense to describe the endpoints in one place. This is not the only option, but popular.

```javascript
var mapper = require('s-router');
// create instance of router
var router = mapper('id-of-this-router', {/* options */}); 
// create instance of endpoint to handling /some/api/test/anyString[/] or /some/api/test[/]
var endpoint = router.endpoint('test-id-of-endpoint', '/some/api/{?:test}');
// create instance of endpoint to handling /some/api/test2/anyString[/]
var endpoint2 = router.endpoint('test-id-of-endpoint2', '/some/api/{:test2}');

// easy delegate to another file
if (
    router === require('s-router')('id-of-this-router') &&
    endpoint === require('s-router')('id-of-this-router').endpoint('test-id-of-endpoint')
) {
	console.log( 'Completely usability victory !!!' );
} else {
	console.log( 'Completely fail ...' );
};

```

### Example handling

When we already have started endpoints. We can refer to them by name. And set queue of handlers which would create response. Each method of adding processors can take as a function or an array of functions.

```javascript

var router = require('s-router')('id-of-this-router')

router.endpoint('test-id-of-endpoint')
    .get(function ( request, response, params ) {
        params.test // from /some/api/test/anyString => 'anyString'
        params.prepareSome = 2;
        params.next();
    })
    .get(function ( request, response, params ) {
        params.query // ParsedQueryString
        params.urlObject // Url
        params.prepareSome // 2
        response.end('nothing');
    })
    .post(function ( request, response, params ) {
        params.test // from /some/api/test/anyString => 'anyString'
        params.body // string with body of post data
        response.end('nothing');
    })
    .error(function ( request, response, params ) {
        params.error // contain error message for this endpoint
        response.end('error');
    })
    .use(function ( request, response, params ) {
        // execute before queue of endpoint
        params.next();
    })
    .use(function ( request, response, params ) {
        // execute before queue of endpoint but after previous endpoint 'use' handler
        params.next();
    });

```

### Example pretreatment

In turn, the instance router may pretreated with any request. Each request and by methods. It contains the same methods as the endpoint. But his handlers are added to the top of the queue, before the queue of end point.

```javascript

var router = require('s-router')('id-of-this-router')

router.get(function ( request, response, params ) {
        // execute before get queue each of endpoints
        params.next();
    })
    .post(function ( request, response, params ) {
        // execute before post queue each of endpoints
        params.next();
    })
    .error(function ( request, response, params ) {
        // execute before errors each of endpoints
        params.next();
    })
    .use(function ( request, response, params ) {
        // execute before queue each of endpoints
        params.next();
    })
    .use(function ( request, response, params ) {
        // execute before queue each of endpoint but after previous router 'use' handler
        params.next();
    });

```

### Example Params extend

An instance of the parameters(third arguments) for each request is new. If it becomes necessary to add the values - instance of router involves functionality the expansion prototype of the constructor Params. How it looks.

```javascript

var router = require('s-router')('id-of-this-router')

router.extendParams(function ( request, response, params ) {
    this.test = function () {
        console.log('I am a method - which will be available in all handlers like a params.test()');
    };
});

```

**Note:** You can build your map as you wish. These are only examples, "as it could be"

[npm-image]: https://badge.fury.io/js/s-router.svg
[npm-url]: https://npmjs.org/package/s-router