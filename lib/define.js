var options = routerManager.bind({});
/**
 * @description
    router have default options properties to overade
 * @eaxmple

    // debug mode
    var router = require('../s-router.js');
    router.DEBUG = true;



 * @public
 */
options.DEBUG = false;


/**
 * @description
    npm i --save s-router

 * @example var router = require('s-router')    // in Node.js
 *
 * @exports s-router
 * @publick
 */
if ( is.platform.node() ) module.exports = options;
else debug('can not work on this platform');
