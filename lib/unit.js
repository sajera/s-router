/*-------------------------------------------------
    UNIT
---------------------------------------------------*/
/**
 * mapper for management and asynchronous extradition of endpoints by id
 *
 * @param secretUnit: { Symbol } - bounded private key for map
 * @param secretListeners: { Symbol } - bounded private key for map
 * @param id: { String } - identifier (mostly for humanize)
 * @param query: { String } - humanised pattern of endpoint
 * @returns { Object }
 */
function unitManager ( secretUnit, secretListeners, id, query ) {

    assert(is.string(id), '"ID" of Unit must be a string');

    var map = this[secretUnit];
    !map[id]&&assert(is.string(query), 'for create unit "query" required and must be a string');
        
    return map[id] ? map[id] : ( map[id] = new Unit(query, secretListeners, id) );
}

/**
 * endpoint module provides functionality 
 * {:path} - required - /(static name)/(dinamic data)/
 * {?:path} - not required - /(static name - required even if its value is not obligatory)/(dinamic data)/
 * {-:path} - convert to one part of query - /(expecting dinamic data)/
 * {-?:path} - convert to one part of query - not required - /(expecting dinamic data)/
 *
 * @constructor
 * @publick
 */
function Unit ( query, secret, id ) {

    this.id = id;
    this.query = query.replace(/\/+$/,'');
    // visible private map of handlers
    this[secret] = {};
    this.on = this.on.bind(this, secret);

    debug('Unit "'+this.id+'" created =>', query );
};

Unit.prototype = new Super({
    constructor: Unit,
    instance: 'Unit'

});