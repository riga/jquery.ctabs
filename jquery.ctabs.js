/*!
 * jQuery Chrome Tabs Plugin v0.1
 * https://github.com/riga/jquery.ctabs
 *
 * Copyright 2012, Marcel Rieger
 * Dual licensed under the MIT or GPL Version 3 licenses.
 * http://www.opensource.org/licenses/mit-license
 * http://www.opensource.org/licenses/GPL-3.0
 *
 */

(function($) {

    $.widget("custom.ctabs", {
        version: "0.1",
        options: {
            active: 0,
            add: null,
            cssFlex: true,
            headLeft: "",
            headLeftWidth: 0,
            headRight: "",
            headRightWidth: 0,
            height: "100%",
            icon: "span",
            iconFormatter: null,
            marker: "*",
            showHash: false,
            width: "100%"
        },

        _settings: {
            overlap: 20,
            resizeCacheDelay: 500
        },

        _workflow: {
            currentHash: null,
            resizeTimeout: null,
            minTabWidth: null,
            maxTabWidth: null
        },

        // --- widget methods ---

        _create: function() {
            this._prepare();
            this._setupTarget();
            this._initialFill();
        },

        _setOption: function(key, value) {
            // try to apply the new option
            switch (key) {
                case "active":
                    if (!this._applyActive(value)) {
                        return;
                    }
                    break;
                case "add":
                    // dynamic
                    break;
                case "cssFlex":
                    // singular
                    return;
                    break;
                case "headLeft":
                    if (!this._applyHeadLeft(value)) {
                        return;
                    }
                    break;
                case "headLeftWidth":
                    if (!this._applyHeadLeftWidth(value)) {
                        return;
                    }
                    break;
                case "headRight":
                    if (!this._applyHeadRight(value)) {
                        return;
                    }
                    break;
                case "headRightWidth":
                    if (!this._applyHeadRightWidth(value)) {
                        return;
                    }
                    break;
                case "height":
                    if (!this._applyHeight(value)) {
                        return;
                    }
                    break;
                case "icon":
                    // singular
                    return;
                    break;
                case "iconFormatter":
                    // dynamic
                    break;
                case "marker":
                    if (!this._applyMarker(value)) {
                        return;
                    }
                    break;
                case "maxTabWidth":
                    if (!this._applyMaxTabWidth(value)) {
                        return;
                    }
                    break;
                case "minTabWidth":
                    if (!this._applyMinTabWidth(value)) {
                        return;
                    }
                    break;
                case "showHash":
                    // dynamic
                    break;
                case "width":
                    if (!this._applyWidth(value)) {
                        return;
                    }
                    break;
                default:
                    break;
            }
            // use _super to change the option
            this._super(key, value);
        },

        _refresh: function() {
            this._applyActive(this.options.active);
            this._applyHeadLeft(this.options.headLeft);
            this._applyHeadLeftWidth(this.options.headLeftWidth);
            this._applyHeadRight(this.options.headRight);
            this._applyHeadRightWidth(this.options.headRightWidth);
            this._applyHeight(this.options.height);
            this._applyMarker(this.options.marker);
            this._applyWidth(this.options.width);
            // try to resize
            this._resize();
        },

        // --- private methods ---

        _prepare: function() {
            // collect data
            var that = this;
            var tabList = this.element.find("ol, ul").first().hide();
            var tabs = tabList.children();
            // global storage and a list to keep track of the order
            this.store = {};
            this.hashes = [];
            // store data
            tabs.each(function() {
                var anchor = $("a", this).first();
                var hash = anchor.get(0).hash;
                var icon = $(that.options.icon, this).first();
                var panel = that.element.children(hash).first();
                that.store[hash] = {
                    hash: hash,
                    tab: $(this),
                    anchor: anchor,
                    panel: panel,
                    icon: icon
                };
                that.hashes.push(hash);
            });
        },

        _setupTarget: function() {
            var that = this;

            // head
            var head = $("<div>")
                .addClass("ctabs-head")
                .appendTo(this.element);
            // body
            var body = $("<div>")
                .addClass("ctabs-body")
                .appendTo(this.element);
            // head left
            var headLeftWrapper = $("<div>")
                .addClass("ctabs-head-left-wrapper")
                .appendTo(head);
            var headLeftTable = $("<div>")
                .addClass("ctabs-table")
                .appendTo(headLeftWrapper);
            var headLeft = $("<div>")
                .addClass("ctabs-table-cell-center")
                .appendTo(headLeftTable);
            // head right
            var headRightWrapper = $("<div>")
                .addClass("ctabs-head-right-wrapper")
                .appendTo(head);
            var headRightTable = $("<div>")
                .addClass("ctabs-table")
                .appendTo(headRightWrapper);
            var headRight = $("<div>")
                .addClass("ctabs-table-cell-center")
                .appendTo(headRightTable);
            // head center
            var headCenterWrapper = $("<div>")
                .addClass("ctabs-head-center-wrapper")
                .appendTo(head);
            var headCenter = $("<div>")
                .addClass("ctabs-head-center")
                .addClass(this.options.cssFlex ? "ctabs-head-center-flex" : "ctabs-head-center-fix")
                .appendTo(headCenterWrapper);
            // adder
            var adder = $("<div>")
                .addClass("ctabs-adder")
                .html("+")
                .appendTo(headCenter)
                .click(function() {
                    if ($.isFunction(that.options.add)) {
                        that.options.add.apply(null, arguments);
                    }
                });

            // make the tabs sortable using jQuery UI's sortable widget
            var sortableOptions = this.options.cssFlex ? {} : {
                placeholder: "ctabs-ctab-fix-placeholder",
                start: function(event, ui) {
                    ui.placeholder.css("width", ui.item.width() - that._settings.overlap);
                }
            };
            $(headCenter).sortable($.extend({
                axis: "x",
                distance: 20,
                tolerance: "pointer",
                items: ".ctabs-ctab",
                stop: function(event, ui) {
                    that._sortStop();
                }
            }), sortableOptions).disableSelection();

            // store some nodes
            this.nodes = {
                body: body,
                head: head,
                headLeftWrapper: headLeftWrapper,
                headLeft: headLeft,
                headRightWrapper: headRightWrapper,
                headRight: headRight,
                headCenterWrapper: headCenterWrapper,
                headCenter: headCenter,
                adder: adder
            };
        },

        _initialFill: function() {
            var that = this;
            $.each(this.store, function(hash) {
                that._createCTab(hash, undefined);
            });
            this._refresh();
            this.select(this.options.active);
        },

        _createCTab: function(hash) {
            var that = this;
            // hide and re-append the original nodes
            this.store[hash].tab.hide();
            this.store[hash].panel
                .hide()
                .appendTo(this.nodes.body);

            // ctab
            var ctab = $("<div>")
                .addClass("ctabs-ctab ctabs-ctab-dimensions")
                .addClass(this.options.cssFlex ? "ctabs-ctab-flex" : "ctabs-ctab-fix")
                .attr("hash", hash)
                .insertBefore(this.nodes.adder);
            // ctab left
            var ctabLeft = $("<div>")
                .addClass("ctabs-ctab-left-wrapper")
                .appendTo(ctab);
            $("<div>")
                .addClass("ctabs-ctab-left")
                .appendTo(ctabLeft);
            // ctab right
            var ctabRight = $("<div>")
                .addClass("ctabs-ctab-right-wrapper")
                .appendTo(ctab);
            $("<div>")
                .addClass("ctabs-ctab-right")
                .appendTo(ctabRight);
            // ctab center
            var ctabCenter = $("<div>")
                .addClass("ctabs-ctab-center")
                .appendTo(ctab);
            // icon
            var iconBoxWrapper = $("<div>")
                .addClass("ctabs-ctab-icon-wrapper")
                .appendTo(ctabCenter);
            var iconBox = $("<div>")
                .addClass("ctabs-table")
                .appendTo(iconBoxWrapper);
            var iconWrapper = $("<div>")
                .addClass("ctabs-table-cell-left")
                .append(this.store[hash].icon)
                .appendTo(iconBox);
            // close
            var closeBoxWrapper = $("<div>")
                .addClass("ctabs-ctab-close-wrapper")
                .appendTo(ctabCenter);
            var closeBox = $("<div>")
                .addClass("ctabs-table")
                .appendTo(closeBoxWrapper);
            var close = $("<div>")
                .addClass("ctabs-table-cell-right")
                .append("x")
                .appendTo(closeBox)
                .click(function() {
                    that.remove(hash);
                });
            // title
            var text = this.store[hash].anchor.html();
            this.store[hash].anchor
                .empty()
                .appendTo(ctabCenter)
                .click(function(event) {
                    if (!that.options.showHash) {
                        event.preventDefault();
                    }
                    that.select(hash);
                });
            var titleBoxWrapper = $("<div>")
                .addClass("ctabs-ctab-title-wrapper")
                .appendTo(this.store[hash].anchor);
            var titleBox = $("<div>")
                .addClass("ctabs-table")
                .appendTo(titleBoxWrapper);
            var titleWrapper = $("<div>")
                .addClass("ctabs-table-cell")
                .appendTo(titleBox);
            var title = $("<span>")
                .html(text)
                .appendTo(titleWrapper);
            // marker
            this.store[hash].marker = $("<span>").insertBefore(title);

            // store some nodes
            $.extend(this.store[hash], {
                ctab: ctab,
                iconWrapper: iconWrapper,
                close: close,
                title: title
            });
        },

        _resize: function() {
            // the methods only applies when cssFlex is disabled
            if (this.options.cssFlex) {
                return;
            }
            // calculate layout values
            var wf              = this._workflow;
            var children        = this.nodes.headCenter.children(".ctabs-ctab");
            var firstChild      = children.first();
            var nChildren       = parseFloat(children.size());
            wf.minTabWidth      = wf.minTabWidth || parseInt(firstChild.css('min-width'));
            wf.maxTabWidth      = wf.maxTabWidth || parseInt(firstChild.css('max-width'));
            var currentTabWidth = firstChild.width();
            var outerWidth      = this.nodes.headCenter.width();
            var adderWidth      = this.nodes.adder.width();
            var innerWidth      = adderWidth + nChildren * currentTabWidth - (nChildren - 1) * this._settings.overlap;
            var maxInnerWidth   = adderWidth + nChildren * wf.maxTabWidth - (nChildren - 1) * this._settings.overlap;
            var minInnerWidth   = adderWidth + nChildren * wf.minTabWidth - (nChildren - 1) * this._settings.overlap;
            var targetWidth     = currentTabWidth;

            // determine the new width of the ctabs
            if (outerWidth >= maxInnerWidth) {
                // the element is big enough, no need to shrink, use the maximum width
                targetWidth = wf.maxTabWidth;
            } else if (outerWidth <= minInnerWidth) {
                // the element is too small, all ctabs are their minimum, use the minimum width
                targetWidth = wf.minTabWidth;
            } else {
                // the ctab widths need to be scaled, revert the inner width calculation to obtain the new ctab width
                targetWidth = (outerWidth - adderWidth + (nChildren - 1) * this._settings.overlap) / nChildren;
            }
            // only apply the new width, when it differs from the old one
            if (targetWidth != currentTabWidth) {
                children.width(targetWidth);
            }
            // try to clear chached variables after a delay
            window.clearTimeout(wf.resizeTimeout);
            wf.resizeTimeout = window.setTimeout(function() {
                wf.minTabWidth = null;
                wf.maxTabWidth = null;

            }, this._settings.resizeCacheDelay);
        },

        _sortStop: function() {
            // reorder the hashes
            this.hashes = $.map(this.nodes.headCenter.children(".ctabs-ctab"), function(ctab) {
                return $(ctab).attr("hash");
            });
            // update the active options
            this._updateActive();
        },

        _updateActive: function() {
            if (!this._workflow.currentHash) {
                this.options.active = null;
            }
            // simply array index search
            var idx = $.inArray(this._workflow.currentHash, this.hashes)
            this.options.active = idx >= 0 ? idx : null;
        },

        _applyActive: function(value) {
            // declarative wrapper
            this.select(value);
            return true;
        },

        _applyHeadLeft: function(value) {
            this.nodes.headLeft.empty().append(value);
            return true;
        },

        _applyHeadLeftWidth: function(value) {
            this.nodes.headLeftWrapper.css("width", value);
            this.nodes.headCenterWrapper.css("left", value);
            return true;
        },

        _applyHeadRight: function(value) {
            this.nodes.headRight.empty().append(value);
            return true;
        },

        _applyHeadRightWidth: function(value) {
            this.nodes.headRightWrapper.css("width", value);
            this.nodes.headCenterWrapper.css("right", value);
            return true;
        },

        _applyHeight: function(value) {
            this.element.css("height", value);
            return true;
        },

        _applyMarker: function(value) {
            var that = this;
            $.each(this.store, function(hash) {
                that.mark(hash, undefined, value);
            });
            return true;
        },

        _applyWidth: function(value) {
            this.element.css("width", value);
            return true;
        },

        _getHash: function(hashOrIdx) {
            if (typeof(hashOrIdx) == "number") {
                return this.hashes[hashOrIdx] || hashOrIdx;
            }
            return hashOrIdx;
        },

        // --- public methods ---

        add: function(hash, data) {
            if (this.store[hash]) {
                return;
            }
            // extend data by defaults
            data = $.extend({title: "", content: "", icon: $()}, data);

            // create the structure based on the markup scheme
            // in order to simply call _createCTab
            var tabList = this.element.find("ol, ul").first();
            var tab = $("<li>").appendTo(tabList);
            var anchor = $("<a>")
                    .attr("href", hash)
                    .append(data.title)
                    .appendTo(tab);
            var panel;
            if (typeof(data.content) == "string") {
                panel = $("<div>").append(data.content);
            } else {
                 panel = $(data.content);
            }
            panel.attr("id", hash.substr(1));
            this.element.append(panel);

            // create a new store object
            this.store[hash] = {
                hash: hash,
                tab: tab,
                anchor: anchor,
                panel: panel,
                icon: data.icon
            };
            // push the hash to the list
            this.hashes.push(hash);
            // create the ctab
            this._createCTab(hash);
            return this.store[hash];
        },

        remove: function(hash) {
            hash = this._getHash(hash);
            if (!this.store[hash]) {
                return;
            }
            // try to deselect
            this.deselect(hash);
            // remove the markup
            this.store[hash].ctab.remove();
            this.store[hash].panel.remove();
            // try to resize 
            this._resize();
            // remove the hash for the list
            var idx = $.inArray(hash, this.hashes);
            if (idx >= 0) {
                this.hashes.splice(idx, 1);
            }
            // delete the store object
            delete this.store[hash];
        },

        get: function(hash, key) {
            hash = this._getHash(hash);
            if (!this.store[hash]) {
                return null;
            }
            return key ? this.store[hash][key] : this.store[hash];
        },

        select: function(hash) {
            hash = this._getHash(hash);
            if (!this.store[hash]) {
                return;
            }
            // deselect the current tab
            this.deselect();
            // show the panel and add the ctab's active class
            this.store[hash].panel.show();
            this.store[hash].ctab.toggleClass("ctabs-ctab-active", true);
            // update values
            this._workflow.currentHash = hash;
            this._updateActive();
        },

        deselect: function(hash) {
            hash = this._getHash(hash);
            if (!this._workflow.currentHash || !this.store[this._workflow.currentHash]) {
                return;
            }
            // check the hash condition if there is any
            if (hash && this._workflow.currentHash != hash) {
                return;
            }
            // hide the panel and remove the ctab's active class
            this.store[this._workflow.currentHash].panel.hide();
            this.store[this._workflow.currentHash].ctab.toggleClass("ctabs-ctab-active", false);
            // update values
            this._workflow.currentHash = null;
            this._updateActive();
        },

        title: function(hash, title) {
            hash = this._getHash(hash);
            if (!this.store[hash]) {
                return;
            }
            if (!title) {
                return this.store[hash].title.html();
            }
            this.store[hash].title.html(title);
        },

        icon: function(hash, icon) {
            hash = this._getHash(hash);
            if (!this.store[hash]) {
                return;
            }
            if (!icon) {
                return this.store[hash].icon;
            }
            if ($.isFunction(this.options.iconFormatter)) {
                icon = this.options.iconFormatter(hash, this.store[hash].icon, icon);
                if (!icon) {
                    return;
                }
            }
            this.store[hash].icon = icon;
            this.store[hash].iconWrapper
                .empty()
                .append(icon);
        },

        modified: function(hash) {
            hash = this._getHash(hash);
            if (!this.store[hash]) {
                return null;
            }
            return !!this.store[hash].marker.html();
        },

        mark: function(hash, modified, marker) {
            hash = this._getHash(hash);
            if (!this.store[hash]) {
                return;
            }
            if (modified === undefined) {
                modified = this.modified(hash);
            }
            this.store[hash].marker.html(modified ? (marker || this.options.marker) : "");
        },

        resize: function() {
            // this method simply wrapps around _resize
            // overwrite to add custom behavior
            this._resize();
        }
    });

})(jQuery);
