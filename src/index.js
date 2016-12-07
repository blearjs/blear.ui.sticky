/**
 * 粘滞
 * @author ydr.me
 * @create 2016-05-12 18:33
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
    left: 0
};
var Sticky = UI.extend({
    className: 'Sticky',
    constructor: function (options) {
        var the = this;

        the[_options] = object.assign(true, {}, defaults, options);
        Sticky.parent(the, options);
        the[_initNode]();

        if (!supportSticky) {
            the[_firstUpdate] = true;
            the.update();
            the[_initEvent]();
        }
    },


    /**
     * 更新粘滞位置，当内容区发生位置变化需要重新执行一次
     * @returns {Sticky}
     */
    update: function () {
        var the = this;

        if (the[_lastState] === STATE_FIXED) {
            return the;
        }

        var position = attribute.style(the[_stickyEl], STR_POSITION);

        if (position !== the[_stickyPosition]) {
            the[_restorePostion]();
        }

        the[_stickyOuterWidth] = layout.outerWidth(the[_stickyEl]);
        the[_stickyOuterHeight] = layout.outerHeight(the[_stickyEl]);
        the[_stickyOffsetTop] = layout.offsetTop(the[_stickyEl]);
        the[_stickyMaxOffsetTop] = layout.offsetTop(the[_parentEl])
            + layout.height(the[_parentEl])
            - the[_stickyOuterHeight];

        layout.outerWidth(the[_stickyEl], the[_stickyOuterWidth]);
        layout.outerHeight(the[_stickyEl], the[_stickyOuterHeight]);

        if (the[_firstUpdate]) {
            the[_stickyPosition] = position;
            the[_firstUpdate] = false;
            return the;
        }

        return the;
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
var _options = Sticky.sole();
var _parentEl = Sticky.sole();
var _stickyEl = Sticky.sole();
var _placeholderEl = Sticky.sole();
var _firstUpdate = Sticky.sole();
var _initNode = Sticky.sole();
var _initEvent = Sticky.sole();
var _restorePostion = Sticky.sole();
var _stickyPosition = Sticky.sole();
var _stickyOffsetTop = Sticky.sole();
var _stickyMaxOffsetTop = Sticky.sole();
var _stickyOuterWidth = Sticky.sole();
var _stickyOuterHeight = Sticky.sole();
var _lastState = Sticky.sole();
var _scrollable = Sticky.sole();
var _onScrollSticky = Sticky.sole();
var STATE_FIXED = 0;
var STATE_RELATIVED = 1;


/**
 * 初始化节点
 */
pro[_initNode] = function () {
    var the = this;
    var options = the[_options];

    the[_stickyEl] = selector.query(the[_options].el)[0];

    if (supportSticky) {
        attribute.style(the[_stickyEl], {
            position: STR_STICKY,
            top: options.top,
            left: options.left,
            zIndex: UI.zIndex()
        });
    } else {
        the[_parentEl] = selector.parent(the[_stickyEl])[0];
        the[_placeholderEl] = modification.create('div', {
            style: {
                position: STR_RELATIVE
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
        width: 0,
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
        el: options.containerEl,
        offsetX: options.left,
        offsetY: options.top
    });
    the[_lastState] = -1;
    the[_scrollable].on('scroll', the[_onScrollSticky] = function (meta) {
        var scrollTop = meta.scrollTop;
        var state;
        var pos;

        if (scrollTop < the[_stickyOffsetTop] || scrollTop > the[_stickyMaxOffsetTop]) {
            state = STATE_RELATIVED;

            if (state !== the[_lastState]) {
                the[_restorePostion]();
            }
        } else {
            state = STATE_FIXED;

            if (state !== the[_lastState]) {
                pos = {
                    position: 'fixed',
                    top: options.top,
                    zIndex: UI.zIndex()
                };

                attribute.style(the[_placeholderEl], {
                    width: the[_stickyOuterWidth],
                    height: the[_stickyOuterHeight]
                });
                attribute.style(the[_stickyEl], pos);
            }
        }

        the[_lastState] = state;
    });
};

Sticky.defaults = defaults;
module.exports = Sticky;
