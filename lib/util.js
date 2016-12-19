/*-------------------------------------------------
    DEPENDENCIES for router declare and/or prepare
---------------------------------------------------*/
var querystring = require('querystring');
var assert = require('assert');
var http = require('http');
var url = require('url');
var is = require('s-is');

/**
 * getting node methods
 */
var supportedMethods = (http.METHODS || [
    'GET', 'POST', 'PUT', 'DELETE', 'OPTIONS','HEAD', 'PATCH', 'SEARCH',
    'TRACE', 'MOVE', 'COPY', 'LOCK', 'UNLOCK', 'MKCOL', 'M-SEARCH',
    'PURGE', 'PROPFIND', 'PROPPATCH', 'REPORT', 'MKACTIVITY', 'CONNECT',
    'CHECKOUT', 'MERGE', 'NOTIFY', 'SUBSCRIBE', 'UNSUBSCRIBE' 
]).concat('PREPROCESSOR', 'ERROR');

/**
 * checking support of method by name for this node
 *
 * @param name: { String }
 * @returns: { Boolean }
 */
function isSupportedMethod ( name ) {
    return supportedMethods.indexOf( name.toUpperCase() ) > -1;
}

/**
 * debug log
 * @privat
 */
var debugPrefix = is.platform.browser() ? 's-debug:' : '\x1B[0m\x1B[41m s-debug:\x1B[49m\x1B[0m';
function debug () {
    if ( process.env.DEBUG&&!is.empty(arguments) ) {
        console.log.apply(console, [debugPrefix].concat(Array.prototype.slice.call(arguments)));
    }
}
/**
 * first element form error stack
 *
 * @param error: { Error } - error which the stack need to write
 * @privat
 */
var stackPrefix = is.platform.browser() ? 'source: ' : '\x1B[0m\x1B[31m source:\x1B[39m\x1B[0m ';
function trace ( error ) {
    return stackPrefix+(is.error(error) ? error.stack.split('\n')[1].replace(/(.*\()|(\).*)|(.*s>)/g,'') : '...');
}