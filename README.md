
[![NPM version][npm-image]][npm-url]

s-router
===============
###### Router for slicing a middleware by endpoints

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


Example 
--------------

```javascript
var uid = require('s-uid');

// generate from default base (just random not more)
uid();		// => "sbhcsnb-nlu9-7hgl-ejtc-n6iibgp"

// generate from costom base
uid('SSSSSS');				// => "bfvuuq"
uid('NNNNNN');				// => "928890"
uid('XXXXXX');				// => "5tr8lh"
uid('XXX-4NNN-dummy-SSS');	// => "uf3-4223-dummy-qea"
```


**Note:** Sory release not ready yet.


[npm-image]: https://badge.fury.io/js/s-router.svg
[npm-url]: https://npmjs.org/package/s-router