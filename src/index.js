/**
 * 粘滞
 * @author ydr.me
 * @create 2016-05-12 18:33
 * @update 2017年02月16日14:07:36
 */


'use strict';

var Scrollable = require('blear.classes.scrollable');
var layout = require('blear.core.layout');
var attribute = require('blear.core.attribute');
var modification = require('blear.core.modification');
var selector = require('blear.core.selector');
var object = require('blear.utils.object');
var compatible = require('blear.utils.compatible');
var UI = require('blear.ui');

var STR_POSITION = 'position';
var STR_STICKY = 'sticky';
var STR_RELATIVE = 'relative';
var supportSticky = compatible.css(STR_POSITION, STR_STICKY).key !== '';
var namespace = UI.UI_CLASS + '-' + STR_STICKY;
var gid = 0;
var win = window;
var doc = document;
var htmlEl = doc.documentElement;
var bodyEl = doc.body;
var defaults = {
    /**
     * 粘滞的元素
     * @type String|HTMLElement
     */
    el: '',

    /**
     * 容器元素
     * @type String|HTMLElement
     */
    containerEl: document,

    /**
     * 上位移
     * @type Number
     */
    top: 0,

    /**
     * 左位移
     * @type Number
     */
    left: 0,

    /**
     * 层级
     * @type Number
     */
    zIndex: 9
};
var Sticky = UI.extend({
    className: 'Sticky',
    constructor: function (options) {
        var the = this;

        the[_options] = object.assign(true, {}, defaults, options);
        Sticky.parent(the, options);
        the[_initNode]();

        if (!supportSticky) {
            the[_initEvent]();
        }
    },

    update: function () {
        // 保留方法
    },

    /**
     * 销毁实例
     */
    destroy: function () {
        var the = this;

        if (!supportSticky) {
            modification.remove(the[_placeholderEl]);
            the[_scrollable].destroy();
        }

        Sticky.invoke('destroy', the);
    }
});
var pro = Sticky.prototype;
var sole = Sticky.sole;
var _options = sole();
var _parentEl = sole();
var _containerEl = sole();
var _stickyEl = sole();
var _placeholderEl = sole();
var _initNode = sole();
var _initEvent = sole();
var _restorePostion = sole();
var _stickyOuterWidth = sole();
var _stickyOuterHeight = sole();
var _lastState = sole();
var _scrollable = sole();
var _onScrollSticky = sole();
var STATE_FIXED = 0;
var STATE_RELATIVED = 1;


/**
 * 初始化节点
 */
pro[_initNode] = function () {
    var the = this;
    var options = the[_options];

    the[_containerEl] = selector.query(the[_options].containerEl)[0];
    the[_stickyEl] = selector.query(the[_options].el)[0];

    if (supportSticky) {
        attribute.style(the[_stickyEl], {
            position: STR_STICKY,
            top: options.top,
            left: options.left,
            zIndex: options.zIndex
        });
    } else {
        the[_parentEl] = selector.parent(the[_stickyEl])[0];
        the[_placeholderEl] = modification.create('div', {
            style: {
                position: STR_RELATIVE,
                width: the[_stickyOuterWidth] = layout.outerWidth(the[_stickyEl]),
                height: 0
            },
            id: namespace + '-' + (gid++)
        });
        attribute.style(the[_stickyEl], STR_POSITION, STR_RELATIVE);
        modification.insert(the[_placeholderEl], the[_stickyEl], 3);
    }
};


/**
 * 重置位置
 */
pro[_restorePostion] = function () {
    var the = this;

    attribute.style(the[_placeholderEl], {
        height: 0
    });
    attribute.style(the[_stickyEl], {
        position: STR_RELATIVE,
        zIndex: ''
    });
};


/**
 * 初始化事件
 */
pro[_initEvent] = function () {
    var the = this;
    var options = the[_options];

    the[_scrollable] = new Scrollable({
        el: the[_containerEl],
        offsetX: options.left,
        offsetY: options.top
    });
    the[_lastState] = -1;
    the[_scrollable].on('scroll', the[_onScrollSticky] = function (meta) {
        var scrollTop = meta.scrollTop;
        var state;
        var pos;
        var min = layout.offsetTop(the[_placeholderEl]) + getContainerScrollTop(the[_containerEl]);
        var max = min + layout.outerHeight(the[_parentEl]);

        if (scrollTop < min || scrollTop > max) {
            state = STATE_RELATIVED;

            if (state !== the[_lastState]) {
                the[_restorePostion]();
            }
        } else {
            state = STATE_FIXED;

            if (state !== the[_lastState]) {
                attribute.style(the[_placeholderEl], 'height', 'auto');
                pos = {
                    position: 'fixed',
                    top: options.top,
                    zIndex: options.zIndex,
                    width: the[_stickyOuterWidth]
                };

                attribute.style(the[_stickyEl], pos);
            }
        }

        the[_lastState] = state;
    });
};

Sticky.defaults = defaults;
module.exports = Sticky;

/**
 * 匹配是否为 root el
 * @param el
 * @returns {boolean}
 */
function matchesRootEl(el) {
    return el === win || el === doc || el === htmlEl || el === bodyEl;
}

/**
 * 计算容器的 scrollTop
 * @param containerEl
 * @returns {*}
 */
function getContainerScrollTop(containerEl) {
    if(matchesRootEl(containerEl)) {
        return 0;
    }

    return layout.scrollTop(containerEl);
}
