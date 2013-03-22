/*!
 * jQuery Tabs Plugin v0.1
 * https://github.com/riga/jquery.ctabs
 *
 * Copyright 2012, Marcel Rieger
 * Dual licensed under the MIT or GPL Version 3 licenses.
 * http://www.opensource.org/licenses/mit-license
 * http://www.opensource.org/licenses/GPL-3.0
 *
 */

(function($) {

    $.widget('custom.ctabs', {
        version: '0.1',
        defaultElement: '<div>',
        //delay: 300,
        options: {
            header: 'h3'
        },
        _create: function() {
            console.log('_create', this, arguments);
            return this;
        },
        _init: function() {
            console.log('_init', this, arguments);
            return this;
        },
        _destroy: function() {},
        _open: function() {},
        _close: function() {}
    });

})(jQuery);
