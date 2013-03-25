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
            add: function(){},
            cssFlex: true,
            headLeft: "",
            headLeftWidth: 0,
            headRight: "",
            headRightWidth: 0,
            height: "100%",
            icon: "span",
            marker: "*",
            maxTabWidth: 180,
            minTabWidth: 80,
            showHash: true,
            width: "100%"
        },

        _layout: {
            overlap: 20
        },

        _workflow: {
            currentHash: null
        },

        // --- widget methods ---

        _create: function() {
            this._prepare();
            this._setupTarget();
            this._initialFill();
            this._refresh();
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
                    if (!this._applyCssFlex(value)) {
                        return;
                    }
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
                    // singular option
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
            this._applyCssFlex(this.options.cssFlex);
            this._applyHeadLeft(this.options.headLeft);
            this._applyHeadLeftWidth(this.options.headLeftWidth);
            this._applyHeadRight(this.options.headRight);
            this._applyHeadRightWidth(this.options.headRightWidth);
            this._applyHeight(this.options.height);
            this._applyMarker(this.options.marker);
            this._applyMaxTabWidth(this.options.maxTabWidth);
            this._applyMinTabWidth(this.options.minTabWidth);
            this._applyWidth(this.options.width);
            // try to resize
            this._resize();
        },

        // --- private methods ---

        _prepare: function() {
            // collect data
            var that = this,
                tabList = this.element.find("ol, ul").first(),
                tabs = tabList.children();
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
                .addClass("ctabs-head-left-wrapper ctabs-table")
                .appendTo(head);
            var headLeft = $("<div>")
                .addClass("ctabs-head-left ctabs-table-cell")
                .appendTo(headLeftWrapper);
            // head right
            var headRightWrapper = $("<div>")
                .addClass("ctabs-head-right-wrapper ctabs-table")
                .appendTo(head);
            var headRight = $("<div>")
                .addClass("ctabs-head-right ctabs-table-cell")
                .appendTo(headRightWrapper);
            // head center
            var headCenterWrapper = $("<div>")
                .addClass("ctabs-head-center-wrapper")
                .appendTo(head);
            var headCenter = $("<div>")
                .addClass("ctabs-head-center")
                .appendTo(headCenterWrapper);
            // adder
            var adder = $("<div>")
                .addClass("ctabs-adder")
                .html("+")
                .appendTo(headCenter)
                .click(function() {
                    that.options.add();
                });

            // make the tabs sortable using jQuery UI's sortable widget
            $(headCenter).sortable({
                axis: "x",
                cursor: "default",
                tolerance: "pointer",
                distance: 20,
                items: ".ctabs-ctab",
                stop: function(event, ui) {
                    that._sortStop();
                }
            });

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
                .addClass("ctabs-ctab")
                .css({
                    'min-width': this.options.minTabWidth,
                    'max-width': this.options.maxTabWidth,
                    'width': this.options.maxTabWidth
                }).attr("hash", hash)
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
            var children      = this.nodes.headCenter.children(".ctabs-ctab"),
                nChildren     = parseFloat(children.size()),
                currentWidth  = children.first().width(),
                outerWidth    = this.nodes.headCenter.width(),
                adderWidth    = this.nodes.adder.width(),
                innerWidth    = adderWidth + nChildren * currentWidth - (nChildren - 1) * this._layout.overlap,
                maxInnerWidth = adderWidth + nChildren * this.options.maxTabWidth - (nChildren - 1) * this._layout.overlap,
                minInnerWidth = adderWidth + nChildren * this.options.minTabWidth - (nChildren - 1) * this._layout.overlap,
                targetWidth   = currentWidth;
            // determine the new width of the ctabs
            if (outerWidth >= maxInnerWidth) {
                // the element is big enough, no need to shrink, use the maximum width
                targetWidth = this.options.maxTabWidth;
            } else if (outerWidth <= minInnerWidth) {
                // the element is too small, all ctabs are their minimum, use the minimum width
                targetWidth = this.options.minTabWidth;
            } else {
                // the ctab widths need to be scaled, revert the inner width calculation to obtain the new ctab width
                targetWidth = (outerWidth - adderWidth + (nChildren - 1) * this._layout.overlap) / nChildren;
            }
            // only apply the new width, when it differs from the old one
            if (targetWidth != currentWidth) {
                children.width(targetWidth);
            }
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

        _applyCssFlex: function(value) {
            // change the headCenter class
            this.nodes.headCenter.toggleClass("ctabs-head-center-flex", value);
            this.nodes.headCenter.toggleClass("ctabs-head-center-fix", !value);
            // change the classes of the ctabs
            $.each(this.store, function(hash, obj) {
                obj.ctab
                    .toggleClass("ctabs-ctab-flex", value)
                    .toggleClass("ctabs-ctab-fix", !value);
            });
            // resize at the end
            this._resize();
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
                that.mark(hash);
            });
            return true;
        },

        _applyMaxTabWidth: function(value) {
            // apply the value to the ctab
            $.each(this.store, function(hash, obj) {
                obj.ctab.css('max-width', value);
            });
            return true;
        },

        _applyMinTabWidth: function(value) {
            // apply the value to the ctab
            $.each(this.store, function(hash, obj) {
                obj.ctab.css('min-width', value);
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
            var tabList = this.element.find("ol, ul").first(),
                tab = $("<li>").appendTo(tabList),
                anchor = $("<a>")
                    .attr("href", hash)
                    .append(data.title)
                    .appendTo(tab),
                panel;
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
            // apply cssFlex to add the behavior-specific classes to the ctab
            this._applyCssFlex(this.options.cssFlex);
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

        // TODO
        icon: function(hash, icon) {
            hash = this._getHash(hash);
            if (!this.store[hash]) {
                return;
            }
            if (!icon) {
                return this.store[hash].icon;
            }
            this.store[hash].icon.remove();
            this.store[hash].icon = icon;
            this.store[hash].iconBox.append(icon);
        },

        modified: function(hash) {
            hash = this._getHash(hash);
            if (!this.store[hash]) {
                return null;
            }
            return !!this.store[hash].marker.html();
        },

        mark: function(hash, modified) {
            hash = this._getHash(hash);
            if (!this.store[hash]) {
                return;
            }
            var marker = this.store[hash].marker;
            if (modified === undefined) {
                modified = this.modified(hash);
            }
            this.store[hash].marker.html(modified ? this.options.marker : '');
        },

        resize: function() {
            // this method simply wrapps around _resize
            // overwrite to add custom behavior
            this._resize();
        }
    });

})(jQuery);
