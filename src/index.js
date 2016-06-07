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
var UI = require('blear.ui');


var namespace = UI.UI_CLASS + '-sticky';
var gid = 0;
var defaults = {
    /**
     * 粘滞的元素
     * @type String|HTMLElement
     */
    stickyEl: '',

    /**
     * 内容容器
     * @type String|HTMLElement
     */
    containerEl: '',

    /**
     * 滚动的元素
     * @type String|HTMLElement
     */
    scrollerEl: ''
};
var Sticky = UI.extend({
    className: 'Sticky',
    constructor: function (options) {
        var the = this;

        the[_options] = object.assign(true, {}, defaults, options);
        Sticky.parent(the, options);
        the[_initNode]();
        the[_firstUpdate] = true;
        the.update();
        the[_initEvent]();
    },


    /**
     * 更新粘滞位置，当内容区发生位置变化需要重新执行一次
     * @returns {Sticky}
     */
    update: function () {
        var the = this;

        if(the[_lastState] === STATE_FIXED) {
            return the;
        }

        var position = attribute.style(the[_stickyEl], 'position');

        if (position !== the[_stickyElementPosition]) {
            the[_restorePostion]();
        }

        the[_stickyElementOffsetLeft] = layout.offsetLeft(the[_stickyEl]);
        the[_containerElementClientTop] = layout.offsetTop(the[_containerEl]);
        the[_stickyElementOffsetTop] = layout.offsetTop(the[_stickyEl]) - the[_containerElementClientTop];
        the[_stickyElementOuterWidth] = layout.outerWidth(the[_stickyEl]);
        the[_stickyElementOuterHeight] = layout.outerHeight(the[_stickyEl]);

        if (the[_firstUpdate]) {
            the[_stickyElementPosition] = position;
            the[_stickyElementPositioned] = layout.positioned(the[_stickyEl]);
            the[_firstUpdate] = false;
            return the;
        }

        the[_onScrollSticky]();
        return the;
    },


    /**
     * 销毁实例
     */
    destroy: function () {
        var the = this;

        modification.remove(the[_placeholderEl]);
        the[_scrollable].destroy();
        Sticky.parent.destroy(the);
    }
});
var pro = Sticky.prototype;
var _options = Sticky.sole();
var _containerEl = Sticky.sole();
var _scrollerEl = Sticky.sole();
var _stickyEl = Sticky.sole();
var _placeholderEl = Sticky.sole();
var _firstUpdate = Sticky.sole();
var _initNode = Sticky.sole();
var _initEvent = Sticky.sole();
var _restorePostion = Sticky.sole();
var _containerElementClientTop = Sticky.sole();
var _stickyElementPositioned = Sticky.sole();
var _stickyElementPosition = Sticky.sole();
var _stickyElementOffsetLeft = Sticky.sole();
var _stickyElementOffsetTop = Sticky.sole();
var _stickyElementOuterWidth = Sticky.sole();
var _stickyElementOuterHeight = Sticky.sole();
var _lastState = Sticky.sole();
var _scrollable = Sticky.sole();
var _onScrollSticky = Sticky.sole();
var STATE_FIXED = 0;
var STATE_POSITIONED = 1;


/**
 * 初始化节点
 */
pro[_initNode] = function () {
    var the = this;

    the[_containerEl] = selector.query(the[_options].containerEl)[0];
    the[_scrollerEl] = selector.query(the[_options].scrollerEl)[0];
    the[_stickyEl] = selector.query(the[_options].stickyEl)[0];
    the[_placeholderEl] = modification.create('div', {
        style: {
            position: 'relative'
        },
        id: namespace + '-' + (gid++)
    });
    modification.insert(the[_placeholderEl], the[_stickyEl], 'afterend');
};


/**
 * 重置位置
 */
pro[_restorePostion] = function () {
    var the = this;
    var pos = {
        top: '',
        width: '',
        height: '',
        left: '',
        zIndex: ''
    };

    if (the[_stickyElementPositioned]) {
        pos.position = the[_stickyElementPosition];
    } else {
        pos.position = the[_stickyElementPosition] = 'relative';
    }

    attribute.style(the[_placeholderEl], {
        width: 0,
        height: 0
    });
    attribute.style(the[_stickyEl], pos);
};


/**
 * 初始化事件
 */
pro[_initEvent] = function () {
    var the = this;
    var options = the[_options];

    the[_scrollable] = new Scrollable({
        scrollerEl: the[_scrollerEl],
        containerEl: the[_containerEl]
    });

    the[_lastState] = -1;

    the[_scrollable].on('scroll', the[_onScrollSticky] = function () {
        var scrollTop = layout.scrollTop(the[_containerEl]);
        var state;
        var pos;

        if (scrollTop < the[_stickyElementOffsetTop]) {
            state = STATE_POSITIONED;

            if (state !== the[_lastState]) {
                the[_restorePostion]();
            }
        } else {
            state = STATE_FIXED;

            if (state !== the[_lastState]) {
                pos = {
                    position: 'fixed',
                    top: the[_containerElementClientTop],
                    left: the[_stickyElementOffsetLeft],
                    width: the[_stickyElementOuterWidth],
                    height: the[_stickyElementOuterHeight],
                    zIndex: 1
                };

                attribute.style(the[_placeholderEl], {
                    width: the[_stickyElementOuterWidth],
                    height: the[_stickyElementOuterHeight]
                });
                attribute.style(the[_stickyEl], pos);
            }
        }

        the[_lastState] = state;
    });
};

Sticky.defaults = defaults;
module.exports = Sticky;
