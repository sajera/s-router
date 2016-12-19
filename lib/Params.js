/*-------------------------------------------------
    PARAMS
---------------------------------------------------*/
/**
 * Constructor for provide a common to the each middlevare
 * 
 * @constructor
 * @publick
 */
function Params () {
    // simple copy all data to body params
    Object.assign.apply(Object,[this].concat(Array.prototype.slice.call(arguments)));
    
    // customization prepering params
    is.function(this.initialize)&&this.initialize();
};

Params.prototype = {
    constructor: Params,
    /**
     * method to override
     */
    initialize: function () { debug('default params initialize'); }
};