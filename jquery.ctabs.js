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
            headLeft: "",
            headLeftWidth: 0,
            headRight: "",
            headRightWidth: 0,
            height: "100%",
            useFlex: true,
            width: "100%",
        },

        workflow: {
            currentHash: null
        },

        _create: function() {
            this._prepare();
            this._hideSource();
            this._createTarget();
            this._fillTarget();
        },

        _init: function() {
            this._initTarget();
        },

        _prepare: function() {
            var that = this;
            this.tabList = this.element.find("ol, ul").eq(0);
            this.tabs = this.tabList.children();
            this.anchors = this.tabs.map(function() {
                return $("a", this);
            });
            this.panels = $();
            this.store = {};
            $.each(this.anchors, function(i, anchor) {
                var hash = anchor.get(0).hash;
                var panel = that.element.children(hash).eq(0);
                that.panels = that.panels.add(panel);
                that.store[hash] = {
                    hash: hash,
                    tab: that.tabs.eq(i),
                    anchor: anchor,
                    panel: panel
                };
            });
            this.ctabs = $();
        },

        _hideSource: function() {
            this.tabList.hide();
            this.panels.hide();
        },

        _createTarget: function() {
            var that = this;
            this.element
                .addClass("ctabs-element")
                .css({
                    height: this.options.height,
                    width: this.options.width
                });
            this.nodes = {};
            this.nodes.head = $("<div>")
                .addClass("ctabs-head")
                .appendTo(this.element);
            this.nodes.body = $("<div>")
                .addClass("ctabs-body")
                .appendTo(this.element);
            this.nodes.headLeft = $("<div>")
                .addClass("ctabs-head-left ctabs-table-outer")
                .appendTo(this.nodes.head);
            $("<div>")
                .addClass("ctabs-table-inner")
                .append(this.options.headLeft)
                .appendTo(this.nodes.headLeft);
            this.nodes.headRight = $("<div>")
                .addClass("ctabs-head-right ctabs-table-outer")
                .appendTo(this.nodes.head);
            $("<div>")
                .addClass("ctabs-table-inner")
                .append(this.options.headRight)
                .appendTo(this.nodes.headRight);
            this.nodes.headCenter = $("<div>")
                .addClass("ctabs-head-center")
                .appendTo(this.nodes.head);

            this.nodes.adder = $("<div>")
                .addClass("ctabs-adder")
                .html("+")
                .appendTo(this.nodes.headCenter);

            $(this.nodes.headCenter).sortable({
                axis: "x",
                cursor: "default",
                tolerance: "pointer",
                distance: 20,
                items: ".ctabs-ctab"
            });
        },

        _initTarget: function() {
            this.nodes.headLeft.css("width", this.options.headLeftWidth);
            this.nodes.headRight.css("width", this.options.headRightWidth);
            this.nodes.headCenter.css({
                left: this.options.headLeftWidth,
                right: this.options.headRightWidth
            });
            this._refresh();
        },

        _fillTarget: function() {
            var that = this;
            $.each(this.store, function(hash) {
                that._createCTab(hash, undefined);
            });
            this.select(this.anchors[this.options.active].get(0).hash);
        },

        _createCTab: function(hash) {
            var that = this;
            this.store[hash].tab.hide();
            this.store[hash].panel
                .addClass("ctabs-panel")
                .appendTo(this.nodes.body);

            this.store[hash].ctab = ctab = $("<div>")
                .addClass("ctabs-ctab");
            this.nodes.adder.before(ctab);
            $("<div>")
                .addClass("ctabs-ctab-left")
                .appendTo(ctab);
            $("<div>")
                .addClass("ctabs-ctab-right")
                .appendTo(ctab);
            var center = $("<div>")
                .addClass("ctabs-ctab-center")
                .appendTo(ctab);
            var outerIcon = $("<div>")
                .addClass("ctabs-ctab-icon")
                .appendTo(center);
            var innerIcon = $("<div>")
                .addClass("ctabs-table-outer")
                .appendTo(outerIcon);
            this.store[hash].icon = $("<div>")
                .addClass("ctabs-table-inner-left")
                .appendTo(innerIcon);
            var outerClose = $("<div>")
                .addClass("ctabs-ctab-close")
                .appendTo(center);
            var innerClose = $("<div>")
                .addClass("ctabs-table-outer")
                .appendTo(outerClose);
            this.store[hash].close = close = $("<div>")
                .addClass("ctabs-table-inner-right")
                .append("x")
                .appendTo(innerClose)
                .click(function() {
                    that.remove(hash);
                });
            var anchorText = this.store[hash].anchor.html();
            this.store[hash].anchor
                .empty()
                .appendTo(center)
                .click(function(event) {
                    event.preventDefault();
                    that.select(hash);
                });
            var outerTitle = $("<div>")
                .addClass("ctabs-ctab-title")
                .appendTo(this.store[hash].anchor);
            var innerTitle = $("<div>")
                .addClass("ctabs-table-outer")
                .appendTo(outerTitle);
            this.store[hash].title = $("<div>")
                .addClass("ctabs-table-inner")
                .html(anchorText)
                .appendTo(innerTitle);

            this.ctabs = this.ctabs.add(ctab);
        },

        _refresh: function() {
            if (this.options.useFlex) {
                this.nodes.headCenter.toggleClass("ctabs-head-center-flex", true);
                this.ctabs.toggleClass("ctabs-ctab-flex", true);
            }
        },

        add: function(hash, data) {
            if (this.store[hash]) {
                return;
            }
            var id = hash;
            if (hash[0] == "#") {
                id = hash.substr(1);
            } else {
                hash = "#" + hash;
            }
            data = $.extend({title: "", content: ""}, data);
            var tab = $("<li>").appendTo(this.tabList);
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
            panel.attr("id", hash);
            this.element.append(panel);
            this.store[hash] = {
                hash: hash,
                tab: tab,
                anchor: anchor,
                panel: panel
            };
            this._createCTab(hash);
            this._refresh();
            return this.store[hash];
        },

        remove: function(hash) {
            if (!this.store[hash]) {
                return;
            }
            if (this.workflow.currentHash == hash) {
                this.deselect();
            }
            this.store[hash].ctab.remove();
            this.store[hash].panel.remove();
            delete this.store[hash];
        },

        select: function(hash) {
            if (!this.store[hash]) {
                return;
            }
            this.deselect();
            this.workflow.currentHash = hash;
            this.store[hash].panel.show();
        },

        deselect: function() {
            if (!this.workflow.currentHash) {
                return;
            }
            this.store[this.workflow.currentHash].panel.hide();
            this.workflow.currentHash = null;
        },

        title: function(hash, title) {
            if (!this.store[hash]) {
                return;
            }
            if (!title) {
                return this.store[hash].title.html();
            }
            this.store[hash].title.html(title);
        },

        mark: function(hash, modified) {
            modified = modified === undefined ? true : modified;
            var title = this.title(hash);
            console.log(title);
            if (modified && title[0] != "*") {
                this.title(hash, "*" + title);
            } else if (!modified && title[0] == "*") {
                this.title(hash, title.substr(1));
            }
        }
    });

})(jQuery);
