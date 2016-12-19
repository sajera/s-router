/*-------------------------------------------------
    ENDPOINT
---------------------------------------------------*/
/**
 * mapper for management and asynchronous extradition of endpoints by id
 *
 * @param secretEndpoint: { Symbol } - bounded private key for map
 * @param secretUnit: { Symbol } - bounded private key for map
 * @param secretListeners: { Symbol } - bounded private key for map
 * @param id: { String } - identifier (mostly for humanize)
 * @param query: { String } - humanised pattern of endpoint
 * @returns { Object }
 */
function endpointManager ( secretEndpoint, secretUnit, secretListeners, id, query ) {

    assert(is.string(id), '"ID" of Endpoint must be a string');

    var map = this[secretEndpoint];
    !map[id]&&assert(is.string(query), 'for create endpoint "query" required and must be a string');
        
    return map[id] ? map[id] : ( map[id] = new Endpoint(query, secretListeners, this[secretUnit], id) );
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
function Endpoint ( query, secret, unitsMap, id ) {
    
    this.id = id;
    // visible private map of handlers
    this[secret] = {};
    this.on = this.on.bind(this, secret);

    var units = id.split('.').slice(0, -1);
    var before = '';
    // extend by units
    for ( var key = 0; key < units.length; key++ ) {
        before+=unitsMap[units[key]].query;
        // add listeners
        for ( var method in unitsMap[units[key]][secret] ) {
            this.on(method, unitsMap[units[key]][secret][method]);
        }
    }
    // extend query before create matchers
    query = before+query;

    var params = this.params = {};
    var order = 1; // order is a position in array of result
    // make an expression for a comparison with the query string
    this.matcher = new RegExp('^'+query.replace(/\{[^}]*}\/?/gi, function ( humanised ) {
        // get a properties name
        var name = humanised.replace(/[\W]/gi,'');
        // flags for this parameter
        var flags = humanised.replace(/[\w\:\/\{\}]/gi,'');
        // get a requirement of parameter
        var required = !/\?/.test(flags);
        // order of parameter
        params[name] = order++;
        /*-------------------------------------------------
            make expression for part of query string
        ---------------------------------------------------*/
        var pattern = /\-/.test(flags) ? (required ? '' : '?') : name+'/'+(required ? '' : '?');
        return pattern+'([^\\W]+)'+(required ? '' : '?')+'/';
    })+'?$', 'i');

    debug('Endpoint "'+this.id+'" created => ', query );
};

Endpoint.prototype = new Super({
    constructor: Endpoint,
    instance: 'Endpoint',
    /**
     * compare query with this endpoint (fast)
     *
     * @param query: { String } - parsed url - pathname
     * @returns: { Boolean }
     */
    compare: function ( query ) {
        return this.matcher.test( query );
    },

    /**
     * get a query params from url
     *
     * @param query: { String } - parsed url - pathname
     * @returns: { Object }
     */
    matchParams: function ( query ) {
        var result = {};
        var intermediate = query.match( this.matcher );
        if ( intermediate ) {
            for ( var name in this.params ) {
                result[name] = intermediate[this.params[name]];
            }
        }
        return result;
    }
});
