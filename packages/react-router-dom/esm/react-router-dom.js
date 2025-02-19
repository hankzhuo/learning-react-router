import _inheritsLoose from '@babel/runtime/helpers/esm/inheritsLoose';
import React from 'react';
import { Router, __RouterContext, matchPath } from 'react-router';
export * from 'react-router';
import { createBrowserHistory, createHashHistory, createLocation } from 'history';
import PropTypes from 'prop-types';
import warning from 'tiny-warning';
import _extends from '@babel/runtime/helpers/esm/extends';
import _objectWithoutPropertiesLoose from '@babel/runtime/helpers/esm/objectWithoutPropertiesLoose';
import invariant from 'tiny-invariant';

/**
 * The public API for a <Router> that uses HTML5 history.
 */

var BrowserRouter =
    /*#__PURE__*/
    function (_React$Component) {
        _inheritsLoose(BrowserRouter, _React$Component); // BrowserRouter 继承 React.Component 属性和方法

        function BrowserRouter() {
            var _this;

            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this; // 继承自身属性和方法
            _this.history = createBrowserHistory(_this.props); // 创建 browser history 对象，是支持 HTML 5 的 history API
            return _this;
        }

        var _proto = BrowserRouter.prototype;

        _proto.render = function render() {
            return React.createElement(Router, { // 以 Router 为 element，history 和 children 作为 Router 的 props
                history: this.history,
                children: this.props.children
            });
        };

        return BrowserRouter;
    }(React.Component);

if (process.env.NODE_ENV !== "production") {
    BrowserRouter.propTypes = {
        basename: PropTypes.string,
        children: PropTypes.node,
        forceRefresh: PropTypes.bool,
        getUserConfirmation: PropTypes.func,
        keyLength: PropTypes.number
    };

    BrowserRouter.prototype.componentDidMount = function () {
        process.env.NODE_ENV !== "production" ? warning(!this.props.history, "<BrowserRouter> ignores the history prop. To use a custom history, " + "use `import { Router }` instead of `import { BrowserRouter as Router }`.") : void 0;
    };
}

/**
 * The public API for a <Router> that uses window.location.hash.
 */

var HashRouter =
    /*#__PURE__*/
    function (_React$Component) {
        _inheritsLoose(HashRouter, _React$Component);

        function HashRouter() {
            var _this;

            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
            _this.history = createHashHistory(_this.props); // 创建 hash history 对象，兼容老浏览器 hash，其他和 BrowserRouter 没有大区别
            return _this;
        }

        var _proto = HashRouter.prototype;

        _proto.render = function render() {
            return React.createElement(Router, {
                history: this.history,
                children: this.props.children
            });
        };

        return HashRouter;
    }(React.Component);

if (process.env.NODE_ENV !== "production") {
    HashRouter.propTypes = {
        basename: PropTypes.string,
        children: PropTypes.node,
        getUserConfirmation: PropTypes.func,
        hashType: PropTypes.oneOf(["hashbang", "noslash", "slash"])
    };

    HashRouter.prototype.componentDidMount = function () {
        process.env.NODE_ENV !== "production" ? warning(!this.props.history, "<HashRouter> ignores the history prop. To use a custom history, " + "use `import { Router }` instead of `import { HashRouter as Router }`.") : void 0;
    };
}

var resolveToLocation = function resolveToLocation(to, currentLocation) {
    return typeof to === "function" ? to(currentLocation) : to;
};
var normalizeToLocation = function normalizeToLocation(to, currentLocation) {
    return typeof to === "string" ? createLocation(to, null, null, currentLocation) : to;
};

function isModifiedEvent(event) {
    return !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);
}

function LinkAnchor(_ref) {
    var innerRef = _ref.innerRef,
        navigate = _ref.navigate,
        _onClick = _ref.onClick,
        rest = _objectWithoutPropertiesLoose(_ref, ["innerRef", "navigate", "onClick"]);

    var target = rest.target;
    return React.createElement("a", _extends({}, rest, {  // a 标签
        ref: innerRef // TODO: Use forwardRef instead
        ,
        onClick: function onClick(event) {
            try {
                if (_onClick) _onClick(event);
            } catch (ex) {
                event.preventDefault(); // ，使用 e.preventDefault() 防止跳转
                throw ex;
            }

            if (!event.defaultPrevented && // onClick prevented default
                event.button === 0 && ( // ignore everything but left clicks
                    !target || target === "_self") && // let browser handle "target=_blank" etc.
                !isModifiedEvent(event) // ignore clicks with modifier keys
            ) {
                event.preventDefault();
                navigate(); // 改变 location
            }
        }
    }));
}
/**
 * The public API for rendering a history-aware <a>.
 */


function Link(_ref2) {
    var _ref2$component = _ref2.component,
        component = _ref2$component === void 0 ? LinkAnchor : _ref2$component,
        replace = _ref2.replace,
        to = _ref2.to, // to 跳转链接的路径
        rest = _objectWithoutPropertiesLoose(_ref2, ["component", "replace", "to"]);

    // __RouterContext.Consumer == context.Consumer
    // eslint-disable-next-line prefer-arrow-callback
    return React.createElement(__RouterContext.Consumer, null, function (context) {
        !context ? process.env.NODE_ENV !== "production" ? invariant(false, "You should not use <Link> outside a <Router>") : invariant(false) : void 0;

        var history = context.history;
        var location = normalizeToLocation(resolveToLocation(to, context.location), context.location);
        var href = location ? history.createHref(location) : "";

        return React.createElement(component, _extends({}, rest, { // component 为 a 标签
            href: href,
            navigate: function navigate() {
                var location = resolveToLocation(to, context.location);
                var method = replace ? history.replace : history.push;
                method(location); // 如果有传 replace，则是替换掉当前 location，否则往 history 堆栈中添加一个 location
            }
        }));
    });
}

if (process.env.NODE_ENV !== "production") {
    var toType = PropTypes.oneOfType([PropTypes.string, PropTypes.object, PropTypes.func]);
    var refType = PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.shape({
        current: PropTypes.any
    })]);
    Link.propTypes = {
        innerRef: refType,
        onClick: PropTypes.func,
        replace: PropTypes.bool,
        target: PropTypes.string,
        to: toType.isRequired
    };
}

function joinClassnames() {
    for (var _len = arguments.length, classnames = new Array(_len), _key = 0; _key < _len; _key++) {
        classnames[_key] = arguments[_key];
    }

    // eslint-disable-next-line prefer-arrow-callback
    return classnames.filter(function (i) {
        return i;
    }).join(" ");
}
/**
 * A <Link> wrapper that knows if it's "active" or not.
 */

// 在 Link 组件基础上添加了一些属性和方法 isActive、className、style
function NavLink(_ref) {
    var _ref$ariaCurrent = _ref["aria-current"],
        ariaCurrent = _ref$ariaCurrent === void 0 ? "page" : _ref$ariaCurrent,
        _ref$activeClassName = _ref.activeClassName,
        activeClassName = _ref$activeClassName === void 0 ? "active" : _ref$activeClassName,
        activeStyle = _ref.activeStyle,
        classNameProp = _ref.className,
        exact = _ref.exact,
        isActiveProp = _ref.isActive,
        locationProp = _ref.location,
        strict = _ref.strict,
        styleProp = _ref.style,
        to = _ref.to,
        rest = _objectWithoutPropertiesLoose(_ref, ["aria-current", "activeClassName", "activeStyle", "className", "exact", "isActive", "location", "strict", "style", "to"]);

    // eslint-disable-next-line prefer-arrow-callback
    return React.createElement(__RouterContext.Consumer, null, function (context) {
        !context ? process.env.NODE_ENV !== "production" ? invariant(false, "You should not use <NavLink> outside a <Router>") : invariant(false) : void 0;

        var currentLocation = locationProp || context.location;
        var pathToMatch = currentLocation.pathname;
        var toLocation = normalizeToLocation(resolveToLocation(to, currentLocation), currentLocation);
        var path = toLocation.pathname; // Regex taken from: https://github.com/pillarjs/path-to-regexp/blob/master/index.js#L202

        var escapedPath = path && path.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
        var match = escapedPath ? matchPath(pathToMatch, {
            path: escapedPath,
            exact: exact,
            strict: strict
        }) : null;
        var isActive = !!(isActiveProp ? isActiveProp(match, context.location) : match);
        var className = isActive ? joinClassnames(classNameProp, activeClassName) : classNameProp;
        var style = isActive ? _extends({}, styleProp, activeStyle) : styleProp;

        return React.createElement(Link, _extends({
            "aria-current": isActive && ariaCurrent || null,
            className: className,
            style: style,
            to: toLocation
        }, rest));
    });
}

if (process.env.NODE_ENV !== "production") {
    var ariaCurrentType = PropTypes.oneOf(["page", "step", "location", "date", "time", "true"]);
    NavLink.propTypes = _extends({}, Link.propTypes, {
        "aria-current": ariaCurrentType,
        activeClassName: PropTypes.string,
        activeStyle: PropTypes.object,
        className: PropTypes.string,
        exact: PropTypes.bool,
        isActive: PropTypes.func,
        location: PropTypes.object,
        strict: PropTypes.bool,
        style: PropTypes.object
    });
}

export { BrowserRouter, HashRouter, Link, NavLink };