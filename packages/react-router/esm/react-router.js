import createContext from 'mini-create-react-context';
import _inheritsLoose from '@babel/runtime/helpers/esm/inheritsLoose';
import React from 'react';
import PropTypes from 'prop-types';
import warning from 'tiny-warning';
import { createMemoryHistory, createLocation, locationsAreEqual, createPath } from 'history';
import invariant from 'tiny-invariant';
import pathToRegexp from 'path-to-regexp';
import _extends from '@babel/runtime/helpers/esm/extends';
import { isValidElementType } from 'react-is';
import _objectWithoutPropertiesLoose from '@babel/runtime/helpers/esm/objectWithoutPropertiesLoose';
import hoistStatics from 'hoist-non-react-statics'; // 功能类似于 Object.assign()，但能防止 React 中 static 被重写

// TODO: Replace with React.createContext once we can assume React 16+

var createNamedContext = function createNamedContext(name) {
    var context = createContext();
    context.displayName = name;
    return context;
};

var context =
    /*#__PURE__*/
    createNamedContext("Router");

/**
 * The public API for putting history on context.
 */
// Router 也是 React 组件
var Router =
    /*#__PURE__*/
    function (_React$Component) {
        _inheritsLoose(Router, _React$Component);  // Router 从 React.Component 原型上的继承属性和方法

        Router.computeRootMatch = function computeRootMatch(pathname) {
            return {
                path: "/",
                url: "/",
                params: {},
                isExact: pathname === "/"
            };
        };

        function Router(props) { // 首先定义一个类 Router，也是 React 组件
            var _this;

            _this = _React$Component.call(this, props) || this; // 继承自身属性和方法
            _this.state = {
                location: props.history.location
            };
            // This is a bit of a hack. We have to start listening for location
            // changes here in the constructor in case there are any <Redirect>s
            // on the initial render. If there are, they will replace/push when
            // they mount and since cDM fires in children before parents, we may
            // get a new location before the <Router> is mounted.

            _this._isMounted = false;
            _this._pendingLocation = null;

            if (!props.staticContext) {  // 如果不是 staticRouter
                _this.unlisten = props.history.listen((location) => { // 监听 history.location 变化，如果有变化，则更新 locaiton
                    if (_this._isMounted) {
                        _this.setState({
                            location: location
                        });
                    } else {
                        _this._pendingLocation = location;
                    }
                });
            }

            return _this;
        }

        var _proto = Router.prototype;  // 组件需要有生命周期，在原型对象上添加 componentDidMount、componentWillUnmount、render 方法

        _proto.componentDidMount = function componentDidMount() {
            this._isMounted = true;

            if (this._pendingLocation) {
                this.setState({
                    location: this._pendingLocation
                });
            }
        };

        _proto.componentWillUnmount = function componentWillUnmount() {
            if (this.unlisten) this.unlisten();  // 停止监听 location
        };

        _proto.render = function render() {
            // 使用了 React Context 传递 history、location、match、staticContext，使得所有子组件都可以获取
            // const value = {
            //   history: this.props.history,
            //   location: this.state.location,
            //   match: Router.computeRootMatch(this.state.location.pathname),
            //   staticContext: this.props.staticContext
            // }

            // return (
            //   <context.Provider value={value}>
            //     {this.props.children}
            //   </context.Provider>
            // )
            return React.createElement(context.Provider, {
                children: this.props.children || null,
                value: {
                    history: this.props.history,
                    location: this.state.location,
                    match: Router.computeRootMatch(this.state.location.pathname),
                    staticContext: this.props.staticContext // staticRouter 中的 API，不是公用 API
                }
            });
        };

        return Router;
    }(React.Component);

if (process.env.NODE_ENV !== "production") {
    Router.propTypes = {
        children: PropTypes.node,
        history: PropTypes.object.isRequired,
        staticContext: PropTypes.object
    };

    Router.prototype.componentDidUpdate = function (prevProps) {
        process.env.NODE_ENV !== "production" ? warning(prevProps.history === this.props.history, "You cannot change <Router history>") : void 0;
    };
}

/**
 * The public API for a <Router> that stores location in memory.
 */

var MemoryRouter =
    /*#__PURE__*/
    function (_React$Component) {
        _inheritsLoose(MemoryRouter, _React$Component);

        function MemoryRouter() {
            var _this;

            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;
            _this.history = createMemoryHistory(_this.props); // 创建 Memory history 对象，其他和 BrowserRouter 没有大区别
            return _this;
        }

        var _proto = MemoryRouter.prototype;

        _proto.render = function render() {
            return React.createElement(Router, {
                history: this.history,
                children: this.props.children
            });
        };

        return MemoryRouter;
    }(React.Component);

if (process.env.NODE_ENV !== "production") {
    MemoryRouter.propTypes = {
        initialEntries: PropTypes.array,
        initialIndex: PropTypes.number,
        getUserConfirmation: PropTypes.func,
        keyLength: PropTypes.number,
        children: PropTypes.node
    };

    MemoryRouter.prototype.componentDidMount = function () {
        process.env.NODE_ENV !== "production" ? warning(!this.props.history, "<MemoryRouter> ignores the history prop. To use a custom history, " + "use `import { Router }` instead of `import { MemoryRouter as Router }`.") : void 0;
    };
}

// 生命周期：给路由添加生命周期
var Lifecycle =
    /*#__PURE__*/
    function (_React$Component) {
        _inheritsLoose(Lifecycle, _React$Component);

        function Lifecycle() {
            return _React$Component.apply(this, arguments) || this;
        }

        var _proto = Lifecycle.prototype;

        _proto.componentDidMount = function componentDidMount() {
            if (this.props.onMount) this.props.onMount.call(this, this);
        };

        _proto.componentDidUpdate = function componentDidUpdate(prevProps) {
            if (this.props.onUpdate) this.props.onUpdate.call(this, this, prevProps);
        };

        _proto.componentWillUnmount = function componentWillUnmount() {
            if (this.props.onUnmount) this.props.onUnmount.call(this, this);
        };

        _proto.render = function render() {
            return null;
        };

        return Lifecycle;
    }(React.Component);

/**
 * The public API for prompting the user before navigating away from a screen.
 */
// 离开一个页面时候，提示信息组件
function Prompt(_ref) {
    var message = _ref.message,
        _ref$when = _ref.when,
        when = _ref$when === void 0 ? true : _ref$when; // void 0 === undefined 为 true，解决 undefined 兼容性问题

    return React.createElement(context.Consumer, null, (context$$1) => {
        !context$$1 ? process.env.NODE_ENV !== "production" ? invariant(false, "You should not use <Prompt> outside a <Router>") : invariant(false) : void 0;

        if (!when || context$$1.staticContext) return null;
        var method = context$$1.history.block;  // 提示消息的方法

        return React.createElement(Lifecycle, {
            onMount: function onMount(self) {
                self.release = method(message); // componentDidMount 时，提示消息，返回”取消提示“方法
            },
            onUpdate: function onUpdate(self, prevProps) {
                if (prevProps.message !== message) {
                    self.release(); // 先取消上一次提示方法
                    self.release = method(message);  // 在重新提示消息，并返回取消提示方法
                }
            },
            onUnmount: function onUnmount(self) {
                self.release(); // 取消提示
            },
            message: message
        });
    });
}

if (process.env.NODE_ENV !== "production") {
    var messageType = PropTypes.oneOfType([PropTypes.func, PropTypes.string]);
    Prompt.propTypes = {
        when: PropTypes.bool,
        message: messageType.isRequired
    };
}

var cache = {};
var cacheLimit = 10000;
var cacheCount = 0;

function compilePath(path) {
    if (cache[path]) return cache[path];
    var generator = pathToRegexp.compile(path);

    if (cacheCount < cacheLimit) {
        cache[path] = generator;
        cacheCount++;
    }

    return generator;
}
/**
 * Public API for generating a URL pathname from a path and parameters.
 */


function generatePath(path, params) {
    if (path === void 0) {
        path = "/";
    }

    if (params === void 0) {
        params = {};
    }

    return path === "/" ? path : compilePath(path)(params, {
        pretty: true
    });
}

/**
 * The public API for navigating programmatically with a component.
 */

function Redirect(_ref) {
    var computedMatch = _ref.computedMatch,
        to = _ref.to,
        _ref$push = _ref.push,
        push = _ref$push === void 0 ? false : _ref$push;
    return React.createElement(context.Consumer, null, (context$$1) => { // context.Consumer 第三个参数是一个函数
        !context$$1 ? process.env.NODE_ENV !== "production" ? invariant(false, "You should not use <Redirect> outside a <Router>") : invariant(false) : void 0;

        var history = context$$1.history,
            staticContext = context$$1.staticContext;
        var method = push ? history.push : history.replace; // method 方法：判断是否是替换（replace）当前的 state，还是往 state 堆栈中添加（push)一个新的 state
        var location = createLocation(computedMatch ? typeof to === "string" ? generatePath(to, computedMatch.params) : _extends({}, to, {
            pathname: generatePath(to.pathname, computedMatch.params)
        }) : to); // When rendering in a static context,
        // set the new location immediately.

        if (staticContext) { // 当渲染一个静态的 context 时，立即设置新 location
            method(location);
            return null;
        }

        return React.createElement(Lifecycle, {
            onMount: function onMount() {
                method(location);
            },
            onUpdate: function onUpdate(self, prevProps) {
                var prevLocation = createLocation(prevProps.to);
                // 触发更新时，对比前后 location 是否相等，不相等，则更新 location
                if (!locationsAreEqual(prevLocation, _extends({}, location, {
                    key: prevLocation.key
                }))) {
                    method(location);
                }
            },
            to: to
        });
    });
}

if (process.env.NODE_ENV !== "production") {
    Redirect.propTypes = {
        push: PropTypes.bool,
        from: PropTypes.string,
        to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired
    };
}

var cache$1 = {};
var cacheLimit$1 = 10000;
var cacheCount$1 = 0;

function compilePath$1(path, options) {
    var cacheKey = "" + options.end + options.strict + options.sensitive;
    var pathCache = cache$1[cacheKey] || (cache$1[cacheKey] = {});
    if (pathCache[path]) return pathCache[path];
    var keys = [];
    var regexp = pathToRegexp(path, keys, options);
    var result = {
        regexp: regexp,
        keys: keys
    };

    if (cacheCount$1 < cacheLimit$1) {
        pathCache[path] = result;
        cacheCount$1++;
    }

    return result;
}
/**
 * Public API for matching a URL pathname to a path.
 */


function matchPath(pathname, options) {
    if (options === void 0) {
        options = {};
    }

    if (typeof options === "string" || Array.isArray(options)) {
        options = {
            path: options
        };
    }

    var _options = options,
        path = _options.path,
        _options$exact = _options.exact,
        exact = _options$exact === void 0 ? false : _options$exact,
        _options$strict = _options.strict,
        strict = _options$strict === void 0 ? false : _options$strict,
        _options$sensitive = _options.sensitive,
        sensitive = _options$sensitive === void 0 ? false : _options$sensitive;
    var paths = [].concat(path);
    return paths.reduce((matched, path) => {
        if (!path) return null;
        if (matched) return matched;

        var _compilePath = compilePath$1(path, {
            end: exact,
            strict: strict,
            sensitive: sensitive
        }),
            regexp = _compilePath.regexp,
            keys = _compilePath.keys;

        var match = regexp.exec(pathname);
        if (!match) return null;
        var url = match[0],
            values = match.slice(1);
        var isExact = pathname === url;
        if (exact && !isExact) return null;
        return {
            path: path,
            // the path used to match
            url: path === "/" && url === "" ? "/" : url,
            // the matched portion of the URL
            isExact: isExact,
            // whether or not we matched exactly
            params: keys.reduce((memo, key, index) => {
                memo[key.name] = values[index];
                return memo;
            }, {})
        };
    }, null);
}

function isEmptyChildren(children) {
    return React.Children.count(children) === 0;
}
/**
 * The public API for matching a single path and rendering.
 */


var Route =
    /*#__PURE__*/
    function (_React$Component) {
        _inheritsLoose(Route, _React$Component);

        function Route() {
            return _React$Component.apply(this, arguments) || this;
        }

        var _proto = Route.prototype;

        _proto.render = function render() {
            var _this = this;
            // context.Consumer 每个 Route 组件都可以消费 Provider 提供的 context
            return React.createElement(context.Consumer, null, function (context$$1) {
                !context$$1 ? process.env.NODE_ENV !== "production" ? invariant(false, "You should not use <Route> outside a <Router>") : invariant(false) : void 0;

                var location = _this.props.location || context$$1.location;
                var match = _this.props.computedMatch ? _this.props.computedMatch // <Switch> already computed the match for us
                    : _this.props.path ? matchPath(location.pathname, _this.props) : context$$1.match;

                var props = _extends({}, context$$1, { // 处理用 context 传递的还是自己传递的 location 和 match
                    location: location,
                    match: match
                });

                var _this$props = _this.props,
                    children = _this$props.children,
                    component = _this$props.component,
                    render = _this$props.render; // Preact uses an empty array as children by
                // default, so use null if that's the case.

                if (Array.isArray(children) && children.length === 0) {
                    children = null;
                }

                if (typeof children === "function") {
                    children = children(props);

                    if (children === undefined) {
                        if (process.env.NODE_ENV !== "production") {
                            var path = _this.props.path;
                            process.env.NODE_ENV !== "production" ? warning(false, "You returned `undefined` from the `children` function of " + ("<Route" + (path ? " path=\"" + path + "\"" : "") + ">, but you ") + "should have returned a React element or `null`") : void 0;
                        }

                        children = null;
                    }
                }

                return React.createElement(context.Provider, { // Route 内定义一个 Provider，给 children 传递 props
                    value: props
                }, children && !isEmptyChildren(children) ? children : props.match ? component ? React.createElement(component, props) : render ? render(props) : null : null);
            });
        };

        return Route;
    }(React.Component);

if (process.env.NODE_ENV !== "production") {
    Route.propTypes = {
        children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
        component: function component(props, propName) {
            if (props[propName] && !isValidElementType(props[propName])) {
                return new Error("Invalid prop 'component' supplied to 'Route': the prop is not a valid React component");
            }
        },
        exact: PropTypes.bool,
        location: PropTypes.object,
        path: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
        render: PropTypes.func,
        sensitive: PropTypes.bool,
        strict: PropTypes.bool
    };

    Route.prototype.componentDidMount = function () {
        process.env.NODE_ENV !== "production" ? warning(!(this.props.children && !isEmptyChildren(this.props.children) && this.props.component), "You should not use <Route component> and <Route children> in the same route; <Route component> will be ignored") : void 0;
        process.env.NODE_ENV !== "production" ? warning(!(this.props.children && !isEmptyChildren(this.props.children) && this.props.render), "You should not use <Route render> and <Route children> in the same route; <Route render> will be ignored") : void 0;
        process.env.NODE_ENV !== "production" ? warning(!(this.props.component && this.props.render), "You should not use <Route component> and <Route render> in the same route; <Route render> will be ignored") : void 0;
    };

    Route.prototype.componentDidUpdate = function (prevProps) {
        process.env.NODE_ENV !== "production" ? warning(!(this.props.location && !prevProps.location), '<Route> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.') : void 0;
        process.env.NODE_ENV !== "production" ? warning(!(!this.props.location && prevProps.location), '<Route> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.') : void 0;
    };
}

function addLeadingSlash(path) {
    return path.charAt(0) === "/" ? path : "/" + path;
}

function addBasename(basename, location) {
    if (!basename) return location;
    return _extends({}, location, {
        pathname: addLeadingSlash(basename) + location.pathname
    });
}

function stripBasename(basename, location) {
    if (!basename) return location;
    var base = addLeadingSlash(basename);
    if (location.pathname.indexOf(base) !== 0) return location;
    return _extends({}, location, {
        pathname: location.pathname.substr(base.length)
    });
}

function createURL(location) {
    return typeof location === "string" ? location : createPath(location);
}

function staticHandler(methodName) {
    return function () {
        process.env.NODE_ENV !== "production" ? invariant(false, "You cannot %s with <StaticRouter>", methodName) : invariant(false);
    };
}

function noop() { }
/**
 * The public top-level API for a "static" <Router>, so-called because it
 * can't actually change the current location. Instead, it just records
 * location changes in a context object. Useful mainly in testing and
 * server-rendering scenarios.
 */

// 此 API 用于 SSR 中，从不会改变 location
var StaticRouter =
    /*#__PURE__*/
    function (_React$Component) {
        _inheritsLoose(StaticRouter, _React$Component);

        function StaticRouter() {
            var _this;

            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
            }

            _this = _React$Component.call.apply(_React$Component, [this].concat(args)) || this;

            _this.handlePush = function (location) {
                return _this.navigateTo(location, "PUSH");
            };

            _this.handleReplace = function (location) {
                return _this.navigateTo(location, "REPLACE");
            };

            _this.handleListen = function () {
                return noop;
            };

            _this.handleBlock = function () {
                return noop;
            };

            return _this;
        }

        var _proto = StaticRouter.prototype;

        _proto.navigateTo = function navigateTo(location, action) {
            var _this$props = this.props,
                _this$props$basename = _this$props.basename,
                basename = _this$props$basename === void 0 ? "" : _this$props$basename,
                _this$props$context = _this$props.context,
                context = _this$props$context === void 0 ? {} : _this$props$context;
            context.action = action;
            context.location = addBasename(basename, createLocation(location));
            context.url = createURL(context.location);
        };

        _proto.render = function render() {
            var _this$props2 = this.props,
                _this$props2$basename = _this$props2.basename,
                basename = _this$props2$basename === void 0 ? "" : _this$props2$basename,
                _this$props2$context = _this$props2.context,
                context = _this$props2$context === void 0 ? {} : _this$props2$context,
                _this$props2$location = _this$props2.location,
                location = _this$props2$location === void 0 ? "/" : _this$props2$location,
                rest = _objectWithoutPropertiesLoose(_this$props2, ["basename", "context", "location"]);

            var history = {
                createHref: function createHref(path) {
                    return addLeadingSlash(basename + createURL(path));
                },
                action: "POP",
                location: stripBasename(basename, createLocation(location)),
                push: this.handlePush,
                replace: this.handleReplace,
                go: staticHandler("go"),
                goBack: staticHandler("goBack"),
                goForward: staticHandler("goForward"),
                listen: this.handleListen,
                block: this.handleBlock
            };
            return React.createElement(Router, _extends({}, rest, {
                history: history,
                staticContext: context  // 此处 context 是一个普通 JavaScript 对象
            }));
        };

        return StaticRouter;
    }(React.Component);

if (process.env.NODE_ENV !== "production") {
    StaticRouter.propTypes = {
        basename: PropTypes.string,
        context: PropTypes.object,
        location: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    };

    StaticRouter.prototype.componentDidMount = function () {
        process.env.NODE_ENV !== "production" ? warning(!this.props.history, "<StaticRouter> ignores the history prop. To use a custom history, " + "use `import { Router }` instead of `import { StaticRouter as Router }`.") : void 0;
    };
}

/**
 * The public API for rendering the first <Route> that matches.
 */

var Switch =
    /*#__PURE__*/
    function (_React$Component) {
        _inheritsLoose(Switch, _React$Component);

        function Switch() {
            return _React$Component.apply(this, arguments) || this;
        }

        var _proto = Switch.prototype;

        _proto.render = function render() {
            var _this = this;

            return React.createElement(context.Consumer, null, function (context$$1) {
                !context$$1 ? process.env.NODE_ENV !== "production" ? invariant(false, "You should not use <Switch> outside a <Router>") : invariant(false) : void 0;
                var location = _this.props.location || context$$1.location;
                var element, match; // We use React.Children.forEach instead of React.Children.toArray().find()
                // here because toArray adds keys to all child elements and we do not want
                // to trigger an unmount/remount for two <Route>s that render the same
                // component at different URLs.
                // 只会匹配第一个 child 中 url
                React.Children.forEach(_this.props.children, function (child) {
                    if (match == null && React.isValidElement(child)) {
                        element = child;
                        var path = child.props.path || child.props.from;
                        match = path ? matchPath(location.pathname, _extends({}, child.props, {
                            path: path
                        })) : context$$1.match;
                    }
                });
                return match ? React.cloneElement(element, {
                    location: location,
                    computedMatch: match  // 加强版的 match
                }) : null;
            });
        };

        return Switch;
    }(React.Component);

if (process.env.NODE_ENV !== "production") {
    Switch.propTypes = {
        children: PropTypes.node,
        location: PropTypes.object
    };

    Switch.prototype.componentDidUpdate = function (prevProps) {
        process.env.NODE_ENV !== "production" ? warning(!(this.props.location && !prevProps.location), '<Switch> elements should not change from uncontrolled to controlled (or vice versa). You initially used no "location" prop and then provided one on a subsequent render.') : void 0;
        process.env.NODE_ENV !== "production" ? warning(!(!this.props.location && prevProps.location), '<Switch> elements should not change from controlled to uncontrolled (or vice versa). You provided a "location" prop initially but omitted it on a subsequent render.') : void 0;
    };
}

/**
 * A public higher-order component to access the imperative API
 */

function withRouter(Component) {
    var displayName = "withRouter(" + (Component.displayName || Component.name) + ")";

    var C = function C(props) {
        var wrappedComponentRef = props.wrappedComponentRef, // 外部传递 ref
            remainingProps = _objectWithoutPropertiesLoose(props, ["wrappedComponentRef"]);

        return React.createElement(context.Consumer, null, function (context$$1) {
            !context$$1 ? process.env.NODE_ENV !== "production" ? invariant(false, "You should not use <" + displayName + " /> outside a <Router>") : invariant(false) : void 0;

            return React.createElement(Component, _extends({}, remainingProps, context$$1, {
                ref: wrappedComponentRef
            }));
        });
    };

    C.displayName = displayName;
    C.WrappedComponent = Component;

    if (process.env.NODE_ENV !== "production") {
        C.propTypes = {
            wrappedComponentRef: PropTypes.oneOfType([PropTypes.string, PropTypes.func, PropTypes.object])
        };
    }

    return hoistStatics(C, Component);  // 把 Component 自身属性和方法传递给组件 C，返回组件 C
}

if (process.env.NODE_ENV !== "production") {
    if (typeof window !== "undefined") {
        var global = window;
        var key = "__react_router_build__";
        var buildNames = {
            cjs: "CommonJS",
            esm: "ES modules",
            umd: "UMD"
        };

        if (global[key] && global[key] !== "esm") {
            var initialBuildName = buildNames[global[key]];
            var secondaryBuildName = buildNames["esm"]; // TODO: Add link to article that explains in detail how to avoid
            // loading 2 different builds.

            throw new Error("You are loading the " + secondaryBuildName + " build of React Router " + ("on a page that is already running the " + initialBuildName + " ") + "build, so things won't work right.");
        }

        global[key] = "esm";
    }
}

export { MemoryRouter, Prompt, Redirect, Route, Router, StaticRouter, Switch, generatePath, matchPath, withRouter, context as __RouterContext };