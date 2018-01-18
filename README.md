## 前言

本文着重介绍import、require混用的情况下打包结果有何不同，以及webpack打包出的js运行机制。webpack负责将commonjs和es6模块转化为浏览器认识的语句。

## babel配置

```
{
  "presets": [
    ["es2015", {"modules": false}],
    "stage-2"
  ]
}
```

## 各模块均为es6模块的情况

### 项目结构：

app.js(entry):

```
import c from './c';
import {c1,c2} from './c'
console.log(c,c1,c2)
export default '我是a';
```

c.js

```
import b from './b'
export let c1 = '我是c111'
export let c2 = '我是c222'
export default '我是c';
```

b.js

```
export default 'bbb';
```

html

```
<script src='./app.js'></script>
<script type="text/javascript">
    console.log(app)
</script>
```

### 结果解析：

此种情况app.js、b.js、c.js都是es6模块。

1. html控制台输出

    ```
    我是c 我是c111 我是c222
    {default: "我是a", __esModule: true}
    ```

2. 打包出的app.js如下：

    ```
    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__c__ = __webpack_require__(2);
    console.log(__WEBPACK_IMPORTED_MODULE_0__c__["c" /* default */], __WEBPACK_IMPORTED_MODULE_0__c__["a" /* c1 */], __WEBPACK_IMPORTED_MODULE_0__c__["b" /* c2 */]);
    /* harmony default export */ __webpack_exports__["default"] = ('我是a');
    ```

    app暴露出的是一个对象，并且增加了default和__esModule属性。

3. c.js如下

    ```
    /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return c1; });
    /* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return c2; });
    /* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(4);
    var c1 = '我是c111';
    var c2 = '我是c222';
    /* harmony default export */ __webpack_exports__["c"] = ('我是c');
    ```

    c.js暴露了三个属性。并且c将export default转化为了"c"属性，然后会通过调用__WEBPACK_IMPORTED_MODULE_0__c__["c"]来获取c的default值。

4. b.js

    ```
    /* unused harmony default export */ var _unused_webpack_default_export = ('bbb');
    ```
    由于b.js虽然被c.js import了，但是没有使用，所以b.js并没有export出去。压缩模式下b.js会被删除。这就是webpack tree-shaking功能

### 结论：

    如果入口模块是es6模块，而且引用的模块也是es6模块，那么引用编译后不会添加{__esModule:true}，只有入口模块才会添加{__esModule:true}，如果入口模块有export default的值，那么default会转化为暴露对象的default属性。

## 引入的模块为commonjs模块的情况:

### 项目结构：

将案例一的c.js改为：

```
let c1 = 'c1'
let c2 = 'c2'
module.exports = {
	c1,
	c2,
}
```

### 结果解析：

此种情况app.js、b.js是es6模块,c.js是commonjs模块

1. c.js如下：

    ```
    var c1 = 'c1';
    var c2 = 'c2';
    module.exports = {
    	c1: c1,
    	c2: c2
    };
    ```

### 结论：

    如果入口模块是es6模块，引入的模块是commonjs模块，那么引入的模块会原样输出，并且引入的模块将不会有default属性。

## 引入的模块为commonjs模块但未使用的情况:

### 项目结构：

将案例一的b.js改为：

```
module.exports = 'bbb'
```

### 结果解析：

此种情况app.js、c.js是es6模块,b.js是commonjs模块，但b只是import了并未使用

1. b.js如下：

    ```
    module.exports = 'bbb'
    ```

### 结论：

    如果入口模块是es6模块，引入的模块是commonjs模块但并未使用，那么webpack的tree-shaking功能不会生效，将打包的js压缩后还是会存在b.js

## 入口模块为commonjs模块，引入的模块为es6模块:

### 项目结构：

将案例一的app.js改为：

```
var b = require('./b')
var c = require('./c')
console.log(b.default)
console.log(c)
module.exports = {
	a:'我是a'
}
```

### 结果解析：

此种情况b.js、c.js是es6模块,app.js是commonjs模块

1. app.js如下：

    ```
    var b = __webpack_require__(3);
    var c = __webpack_require__(0);
    console.log(b.default);
    console.log(c);
    module.exports = {
    	a: '我是a'
    }
    ```
2. b.js如下

    ```
    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    /* harmony default export */ __webpack_exports__["default"] = ('bbb');
    ```

### 结论：

    如果入口模块是commonjs模块，引入的模块是es6模块，那么es6模块编译后会添加{__esModule:true}。如果被调用的es6模块中恰好有export default语句，那么编译后的es6模块将会添加.default = ...。这时候如果入口commonjs模块想调用es6模块的default值，就需要手动添加b.default。例如：var b = require('./b').default   console.log(b)。另：commonjs模块中不能使用import语句，会报错！


## 入口模块和引入的模块为commonjs模块的情况

### 结论：

    模块全部原样输出。没有export default的情况了。

## 综上

1. es6模块调用commonjs模块，可以直接使用commonjs模块，commonjs模块将不会被webpack的模块系统编译而是会原样输出，并且commonjs模块没有.default属性

2. es6模块调用es6模块,被调用的es6模块不会添加{__esModule:true}，只有调用者才会添加{__esModule:true}；并且可以进行tree-shaking操作，如果被调用的es6模块只是import进来，但是并没有被用到，那么被调用的es6模块将会被标记为/* unused harmony default export */，在压缩时此模块将会被删除（例外：如果被调用的es6模块里有立即执行语句，那么这些语句将会被保留）。

3. 如果是commonjs模块引用了es6模块，那么es6模块编译后会添加{__esModule:true}。如果被调用的es6模块中恰好有export default语句，那么编译后的es6模块将会添加.default = ...，这时调用require进来的es6模块默认值，就需要例如：var b = require('./b').default   console.log(b)

4. 如果commonjs模块调用commonjs模块，那么commonjs模块会原样输出。

5. commonjs模块中不能使用import语句，会报错

6. webpakc的output设置会设置模块的打包格式和保留变量，如果设置library = 'test'，那么打包后的js执行完成后所有的模块将会挂到window.test上


[项目地址](https://github.com/mcdyzg/webpack-analyse.git)




## 第二部分：webpack模块化是如何实现的

## 前言

我们都知道，浏览器是无法识别commonjs规范的模块和es6 module的。将这些规范的模块转化为浏览器认识的语句就是webpack做的最基本事情，webpack 本身维护了一套模块系统，这套模块系统兼容了所有前端历史进程下的模块规范，包括 amd commonjs es6 等。当然babel也具有将es6模块转化的能力，但是由于webpack 具有tree-shaking的功能，比起babel来更加具有优势。所以一般babel配置里都会禁止掉babel的module功能。["es2015", {"modules": false}]

## commonjs规范

### 项目结构：

1. app.js(entry)：

```
var c = require('./c')
console.log(c)
```

2. c.js(entry)：

```
let c1 = 'c1'
let c2 = 'c2'
module.exports = {
	c1,
	c2,
}
```

### 打包结果：

```
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["app"] = factory();
	else
		root["app"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return  (function(modules) { // webpackBootstrap
 	// The module cache
 	var installedModules = {};

 	// The require function
 	function __webpack_require__(moduleId) {

 		// Check if module is in cache
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}
 		// Create a new module (and put it into the cache)
 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};

 		// Execute the module function
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

 		// Flag the module as loaded
 		module.l = true;

 		// Return the exports of the module
 		return module.exports;
 	}


 	// expose the modules object (__webpack_modules__)
 	__webpack_require__.m = modules;

 	// expose the module cache
 	__webpack_require__.c = installedModules;

 	// define getter function for harmony exports
 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, {
 				configurable: false,
 				enumerable: true,
 				get: getter
 			});
 		}
 	};

 	// getDefaultExport function for compatibility with non-harmony modules
 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};

 	// Object.prototype.hasOwnProperty.call
 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

 	// __webpack_public_path__
 	__webpack_require__.p = "";

 	// Load entry module and return exports
 	return __webpack_require__(__webpack_require__.s = 0);
 })
/************************************************************************/
 ([
/* 0 */
 (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


 }),
/* 1 */
 (function(module, exports, __webpack_require__) {

"use strict";

var c = __webpack_require__(2);
console.log(c);

module.exports = {
	a: '我是a'
};

 }),
/* 2 */
 (function(module, exports) {

var c1 = 'c1';
var c2 = 'c2';
module.exports = {
	c1: c1,
	c2: c2
};

 })
 ]);
});
```

### 解析：

打包生成的是个立即执行函数，简化来写就是

```
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["app"] = factory();
	else
		root["app"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {解析完的模块部分})
```

可以看到模块部分被作为factory参数传入了webpackUniversalModuleDefinition中，如果检测到module.exports有定义，那么模块赋值给module.exports；如果检测到amd的模块系统有定义，赋值给define的模块系统；最后如果上述模块系统都未检测到，赋值给webpack.output.library定义的全局变量。浏览器可以通过window.app拿到解析好的模块。

下面看模块解析部分

factory：
```
function(){
    return (function(modules){
        解析模块的方法
    })([function(){模块1},function(){模块1},...])
}
```

factory方法最后return出去的就是webpack entry的js：app.js暴露的值。

解析模块的方法：
```
var installedModules = {};
function __webpack_require__(moduleId) {
	if(installedModules[moduleId]) {
		return installedModules[moduleId].exports;
	}
	var module = installedModules[moduleId] = {
		i: moduleId,
		l: false,
		exports: {}
	};
	modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
	module.l = true;
	return module.exports;
}
__webpack_require__.m = modules;
__webpack_require__.c = installedModules;
__webpack_require__.d = function(exports, name, getter) {
	if(!__webpack_require__.o(exports, name)) {
		Object.defineProperty(exports, name, {
			configurable: false,
			enumerable: true,
			get: getter
		});
	}
};
__webpack_require__.n = function(module) {
	var getter = module && module.__esModule ?
		function getDefault() { return module['default']; } :
		function getModuleExports() { return module; };
	__webpack_require__.d(getter, 'a', getter);
	return getter;
};
__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
__webpack_require__.p = "";
return __webpack_require__(__webpack_require__.s = 0);
```

1. 定义了installedModules ，这个变量被用来缓存已加载的模块。
2. 定义了__webpack_require__ 这个函数，函数参数为模块的id。这个函数用来实现模块的require。
3. __webpack_require__ 函数首先会检查是否缓存了已加载的模块，如果有则直接返回缓存模块的exports。
4. 如果没有缓存，也就是第一次加载，则首先初始化模块，并将模块进行缓存。初始化->

    ```
    {
		i: moduleId,
		l: false,
		exports: {}
	}
    ```
5. 然后调用模块函数，也就是前面webpack对我们的模块的包装函数，将module、module.exports和__webpack_require__作为参数传入。注意这里做了一个动态绑定，将模块函数的调用对象绑定为module.exports，这是为了保证在模块中的this指向当前模块。
6. 调用完成后，模块标记为已加载。
7. 返回模块exports的内容。
8. 利用前面定义的__webpack_require__ 函数，require第0个模块，也就是入口模块。

> https://segmentfault.com/a/1190000010349749

再看编号为 0 的模块

```
function(module, exports, __webpack_require__) {
    module.exports = __webpack_require__(1);
}
```

直接让expoprts = __webpack_require__(1),此时

```
installedModules[0] = {i: 1, l: true, exports: __webpack_require__(1)}
```

再看编号为 1 的模块

```
function(module, exports, __webpack_require__) {
    "use strict";
    var c = __webpack_require__(2);
    console.log(c);
    module.exports = {
    	a: '我是a'
    }
}
```

直接让module.exports = {a: '我是a'},此时：

```
installedModules[1] = {i: 1, l: true, exports: {a:'我是a'}}
```

再看编号为 2 的模块

```
function(module, exports) {
    var c1 = 'c1';
    var c2 = 'c2';
    module.exports = {
    	c1: c1,
    	c2: c2
    };
}
```

直接让module.exports = {c1: 'c1',c2: 'c2'},因为2模块没有require其他模块，因此没有接收到__webpack_require__。此时：

```
installedModules[2] = {i: 2, l: true, exports: {c1: 'c1',c2: 'c2'}}
```

结束，现在installedModules的结果是

```
{
    0: {i: 0, l: true, exports: {a:'我是a'}}
    1: {i: 1, l: true, exports: {a:'我是a'}}
    2: {i: 2, l: true, exports: {c1: 'c1',c2: 'c2'}}
}
```

factory函数要return的是`return __webpack_require__(__webpack_require__.s = 0);`

因此入口模块：app.js的返回结果是{a:'我是a'}，同时window.app = {a:'我是a'}

结论：webpack使用自定义的__webpack_require__函数实现了commonjs require的功能，并且使用installedModules变量保存了module.exports的模块输出。完成了对commonjs模块的转化。

> [webpack模块化原理-commonjs](https://segmentfault.com/a/1190000010349749)

## es6 module

### 项目结构：

1. app.js(entry)：

```
import c,{c1,c2} from './c';

console.log(c,c1,c2)

export default '我是a';
export let a = '我是aa';
```

2. c.js：

```
import b from './b'
console.log(b)

export let c1 = '我是c111'
export let c2 = '我是c222'

export default '我是c';
```

3. b.js:

```
export default 'bbb';
```

### 打包结果：

与commonjs部分基本相同，只有模块部分解析的不同

模块0与上述相同。
下面看编号为 1 的模块(app.js)

```
function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    __webpack_require__.d(__webpack_exports__, "aaaa", function() { return aaaa; });
    var __WEBPACK_IMPORTED_MODULE_0__c__ = __webpack_require__(2);

    console.log(__WEBPACK_IMPORTED_MODULE_0__c__["c" /* default */], __WEBPACK_IMPORTED_MODULE_0__c__["a" /* c1 */], __WEBPACK_IMPORTED_MODULE_0__c__["b" /* c2 */]);

    __webpack_exports__["default"] = ('我是a');
    var aaaa = '我是aaaa';
```

结论：

1. 因为app.js是es6的模块，所以webpack对该模块增加了__esModule属性(true)。

2. 由于es6模块有export default的功能，因此webpack把本模块暴露出的default属性赋给了module.exports的default属性。

3. **注意：只有该模块是入口模块，并且是es6模块时，该模块export default的值才会被转为module.exports的default属性。**

4. export 暴露的变量被转化成了```__webpack_require__.d(__webpack_exports__, "aaaa", function() { return aaaa; });```，可以发现export暴露的变量名aaaa被原本的输出了。

5. import语句被转成了```var __WEBPACK_IMPORTED_MODULE_0__c__ = __webpack_require__(2);```，可以看出import c,{c1,c2}的语句webpack没有处理，而是直接通过新变量__WEBPACK_IMPORTED_MODULE_0__c__接收了c模块的exports对象。所有用到c,c1,c2的地方都到 __WEBPACK_IMPORTED_MODULE_0__c__上取。

此时：

```
installedModules[1] = {
    i: 1,
    l: true,
    exports: {
        default:'我是a',
        aaaa:"我是aaaa",
        __esModule:true
    }
}
```

再看模块2(c.js)：

```
function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_require__.d(__webpack_exports__, "a", function() { return c1; });
    __webpack_require__.d(__webpack_exports__, "b", function() { return c2; });
    var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(3);

    console.log(__WEBPACK_IMPORTED_MODULE_0__b__["a" /* default */]);

    var c1 = '我是c111';
    var c2 = '我是c222';

    __webpack_exports__["c"] = ('我是c');
}
```

结论：

1. export 暴露的变量被转化成了```__webpack_require__.d(__webpack_exports__, "a", function() { return c1; });```，可以发现与入口的es6模块不同的是：export暴露的变量名被随机改变了。default被转为了c, c1被转为了a,c2被转为了b。因此当入口模块(app.js)import了本模块并使用default,c1,c2属性时，相应的被webpack对应改为了c,a,b(见模块1调用的地方)

2. 与入口模块不同的是，本模块的export default被转化成了```__webpack_exports__["c"] = ('我是c');```，并没有被转化为default属性，而是同样被转成了一个随机属性名。

此时：

```
installedModules[2] = {
    i: 2,
    l: true,
    exports: {
        a:"我是c111",
        b:"我是c222",
        c: "我是c"
    }
}
```

再看模块3

```
function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    __webpack_exports__["a"] = ('bbb');
}
```

结论：

模块3的export default被转化成了__webpack_exports__["a"] = ('bbb'); default被随机改为了a，然后调用到地方同样要使用 ['a']取值。

综上,installedModules:

```
{
    0: {i: 0, l: true, exports: {a:'我是a',_esModule:true}}
    1: {i: 1, l: true, exports: {a:'我是a',_esModule:true}}
    2: {i: 2, l: true, exports: {a:"我是c111", b:"我是c222",c: "我是c"}}
    3: {i: 3, l: true, exports: {a:"bbb"}}
}
```

结论：

1. 入口模块如果为es6模块的话，会被添加__esModule ，值为true，表明这是一个es模块。而被入口的es6模块引用的其他es6模块不会被添加__esModule属性。

2. es6模块作为入口模块时，export出去的default属性和其他属性名都会被原样保留。default属性通过```__webpack_exports__["default"] = ...```的方式导出，其他属性通过```__webpack_require__.d(__webpack_exports__, "aaaa", function() { return aaaa; });```方式导出。

3. es6模块不是入口模块而是被其他es6模块引用时，export出去的default属性和其他属性名都会被随机赋予新的属性名称，例如```export default '我是c';```转为了```__webpack_exports__["c"] = ('我是c');```。default属性同样通过```__webpack_exports__["c"] = ...```的方式导出，其他属性同样通过```__webpack_require__.d(__webpack_exports__, "b", function() { return c2; });```的方式导出。

4. es6模块的import语法被转化成了```var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(3);```。


## commonjs模块与es6模块混用

### 情景一：es6引用commonjs

### 项目结构：

1. app.js(entry)：

```
import c,{c1,c2} from './c';
console.log(c,c1,c2)

export default '我是a';
export let aaaa = '我是aaaa';
```

2. c.js：

```
let c1 = 'c1'
let c2 = 'c2'
module.exports = {
	c1,
	c2,
}
```

### 打包结果：

```
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["app"] = factory();
	else
		root["app"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return  (function(modules) { // webpackBootstrap
 	var installedModules = {};
 	function __webpack_require__(moduleId) {
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}
 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
 		module.l = true;
 		return module.exports;
 	}
 	__webpack_require__.m = modules;
 	__webpack_require__.c = installedModules;
 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, {
 				configurable: false,
 				enumerable: true,
 				get: getter
 			});
 		}
 	};
 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};
 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
 	__webpack_require__.p = "";
 	return __webpack_require__(__webpack_require__.s = 0);
 })
/************************************************************************/
 ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(1);


/***/ }),
/* 1 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "aaaa", function() { return aaaa; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__c__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__c___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__c__);



console.log(__WEBPACK_IMPORTED_MODULE_0__c___default.a, __WEBPACK_IMPORTED_MODULE_0__c__["c1"], __WEBPACK_IMPORTED_MODULE_0__c__["c2"]);

/* harmony default export */ __webpack_exports__["default"] = ('我是a');
var aaaa = '我是aaaa';

/***/ }),
/* 2 */
/***/ (function(module, exports) {

var c1 = 'c1';
var c2 = 'c2';
module.exports = {
	c1: c1,
	c2: c2
};

/***/ })
/******/ ]);
});
```

入口模块(app.js)为es6模块，引用的模块(c.js)是commonjs模块。

模块0依旧不变，看模块1(app.js)的打包情况

```
function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    __webpack_require__.d(__webpack_exports__, "aaaa", function() { return aaaa; });
    var __WEBPACK_IMPORTED_MODULE_0__c__ = __webpack_require__(2);
    var __WEBPACK_IMPORTED_MODULE_0__c___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__c__);

    console.log(__WEBPACK_IMPORTED_MODULE_0__c___default.a, __WEBPACK_IMPORTED_MODULE_0__c__["c1"], __WEBPACK_IMPORTED_MODULE_0__c__["c2"]);

    __webpack_exports__["default"] = ('我是a');
    var aaaa = '我是aaaa';
}
```

可以发现模块1引用commonjs模块的地方打包结果发生了改变。

```
var __WEBPACK_IMPORTED_MODULE_0__c__ = __webpack_require__(2);
// 与import es6模块相比增加了以下部分
var __WEBPACK_IMPORTED_MODULE_0__c___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__c__);
```

当发现引用模块是commonjs模块时，在调用__webpack_require__()之后，还会调用__webpack_require__.n，

```
__webpack_require__.n = function(module) {
	var getter = module && module.__esModule ?
		function getDefault() { return module['default']; } :
		function getModuleExports() { return module; };
	__webpack_require__.d(getter, 'a', getter);
	return getter;
};
```

本方法的作用是：如果传入模块是es6模块转化成的commonjs模块，即__esModule=true，那么返回的是该模块的default属性的值，如果传入的模块原来就是commonjs模块，返回模块本身，并且令该模块的a属性 = 模块本身。结果就是生成了两个变量__WEBPACK_IMPORTED_MODULE_0__c__和__WEBPACK_IMPORTED_MODULE_0__c___default。

```
__WEBPACK_IMPORTED_MODULE_0__c__={
	c1,
	c2,
}
__WEBPACK_IMPORTED_MODULE_0__c___default = function getModuleExports(){return module}
__WEBPACK_IMPORTED_MODULE_0__c___default.a = module
```

结论：

1. es6模块引用commonjs模块时，因为import name from '..'想取的是模块的default属性，而commonjs模块没有暴露default的方法，所以webpack将整个模块作为了default属性的值输出。

再看模块2：

```
function(module, __webpack_exports__) {
    "use strict";
    var c1 = 'c1';
    var c2 = 'c2';
    module.exports = {
    	c1: c1,
    	c2: c2
    };
}
```

原样输出

综上：

1. es6调用commonjs模块，import 默认值的情况会特殊处理

2. 被引用的commonjs模块会原样输出。

### 情景二：commonjs调用es6模块

### 项目结构：

1. app.js(entry)：

```
var b = require('./b')
var c = require('./c')
console.log(b.default)
console.log(c)
module.exports = {
	a:'我是a'
}
```

2. c.js：

```
import b from './b'
console.log(b)
export let c1 = '我是c111'
export let c2 = '我是c222'

export default '我是c';
```

### 打包结果：

```
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["app"] = factory();
	else
		root["app"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return  (function(modules) { // webpackBootstrap
 	// The module cache
 	var installedModules = {};

 	// The require function
 	function __webpack_require__(moduleId) {

 		// Check if module is in cache
 		if(installedModules[moduleId]) {
 			return installedModules[moduleId].exports;
 		}
 		// Create a new module (and put it into the cache)
 		var module = installedModules[moduleId] = {
 			i: moduleId,
 			l: false,
 			exports: {}
 		};

 		// Execute the module function
 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

 		// Flag the module as loaded
 		module.l = true;

 		// Return the exports of the module
 		return module.exports;
 	}


 	// expose the modules object (__webpack_modules__)
 	__webpack_require__.m = modules;

 	// expose the module cache
 	__webpack_require__.c = installedModules;

 	// define getter function for harmony exports
 	__webpack_require__.d = function(exports, name, getter) {
 		if(!__webpack_require__.o(exports, name)) {
 			Object.defineProperty(exports, name, {
 				configurable: false,
 				enumerable: true,
 				get: getter
 			});
 		}
 	};

 	// getDefaultExport function for compatibility with non-harmony modules
 	__webpack_require__.n = function(module) {
 		var getter = module && module.__esModule ?
 			function getDefault() { return module['default']; } :
 			function getModuleExports() { return module; };
 		__webpack_require__.d(getter, 'a', getter);
 		return getter;
 	};

 	// Object.prototype.hasOwnProperty.call
 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };

 	// __webpack_public_path__
 	__webpack_require__.p = "";

 	// Load entry module and return exports
 	return __webpack_require__(__webpack_require__.s = 0);
 })
/************************************************************************/
 ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {
module.exports = __webpack_require__(1);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var b = __webpack_require__(2);
var c = __webpack_require__(3);
console.log(b.default);
console.log(c);
module.exports = {
	a: '我是a'
};

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {
"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
__webpack_exports__["default"] = ('bbb');

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
 __webpack_require__.d(__webpack_exports__, "c1", function() { return c1; });
 __webpack_require__.d(__webpack_exports__, "c2", function() { return c2; });

var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(0);
console.log(__WEBPACK_IMPORTED_MODULE_0__b__["default"]);

var c1 = '我是c111';
var c2 = '我是c222';
/***/ })
/******/ ]);
});
```

入口模块(app.js)为commonjs模块，引用的模块(b.js,c.js)是es6模块。

模块0依旧不变，看模块1(app.js)的打包情况

```
function(module, exports, __webpack_require__) {
    "use strict";
    var b = __webpack_require__(2);
    var c = __webpack_require__(3);
    console.log(b.default);
    console.log(c);
    module.exports = {
    	a: '我是a'
    }
}
```

仅仅是使用__webpack_require__方法替代了原来的require方法

再看模块2(b.js)和模块3(c.js)

b.js
```
function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    __webpack_exports__["default"] = ('bbb');
}
```

c.js
```
function(module, __webpack_exports__, __webpack_require__) {
    "use strict";
    Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
    __webpack_require__.d(__webpack_exports__, "c1", function() { return c1; });
    __webpack_require__.d(__webpack_exports__, "c2", function() { return c2; });
    var c1 = '我是c111';
    var c2 = '我是c222';
    __webpack_exports__["default"] = ('我是c');
}
```

结论：

1. 可以发现commonjs模块引用es6模块，被引用的es6模块会被增加__esModule属性(true)

2. export语法被转为了```__webpack_require__.d(__webpack_exports__, "c1", function() { return c1; });```。

3. export default语句被转为了```__webpack_exports__["default"] = ('我是c');```

4. 使用import b from './b'调用es6模块，如果需要调用b的默认值，需要用```__WEBPACK_IMPORTED_MODULE_0__b__["default"];```

5. 使用import b from './b'调用commonjs模块，需要以下方式：

    ```
    var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(0);
    var __WEBPACK_IMPORTED_MODULE_0__b___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__b__);
    console.log(__WEBPACK_IMPORTED_MODULE_0__b___default.a);
    ```

综上：

1. commonjs模块被打包时，require部分会被__webpack_require__函数替代，其他部分原样输出。

2. commonjs模块被import时，由于commonjs模块没有暴露默认值的功能，所以import默认值的语法会被解析成：

    ```
    // import c from './c'被解析成：
    var __WEBPACK_IMPORTED_MODULE_0__c__ = __webpack_require__(2);
    var __WEBPACK_IMPORTED_MODULE_0__c___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__c__);
    // 使用c时被解析成：
    console.log(__WEBPACK_IMPORTED_MODULE_0__c___default.a)
    ```

3. 即使在es6模块中使用require()引用，不管require的是es6模块还是commonjs模块，都只会被简单的解析成```var c = __webpack_require__(2);```。可以认为commonjs规范的require会被__webpack_require__直接替换。

4. es6模块被require时(不论require语句出现在commonjs还是es6的模块里)，es6模块都会被添加__esModule=true。es6模块被import时则都不会添加__esModule属性。es6模块被当做入口模块时，也会被添加__esModule=true，可以认为做为入口模块时的命运就是会被打包成commonjs模块暴露出去，此时就需要一个变量来标识我以前是es6模块，只不过被强行变成了commonjs模块，一经打包完成，本模块再被引用时将不会触发tree-shaking功能。

5. es6模块被直接import时，会触发webpack的tree-shaking功能，可以认为webpack只有对es6模块进行静态解析后才能调用tree-shaking。

6. es6模块被打包时，export语句被解析成：

    ```
    __webpack_require__.d(__webpack_exports__, "a", function() { return c1; });
    ```

    export default语句被解析成：

    ```
    __webpack_exports__["c"] = ('我是c');
    ```

    当然所有的属性名都是被随机赋予了新的名称，一般是按a,b,c,d...的顺序。

    例外情况：如果es6模块被当做入口模块，export和export default语句暴露的属性名会保留，例如：

    ```
    __webpack_require__.d(__webpack_exports__, "aaaa", function() { return aaaa; });
    __webpack_exports__["default"] = ('我是a');
    ```

7. es6模块被import时，import语句会被解析成：

    ```
    var __WEBPACK_IMPORTED_MODULE_0__c__ = __webpack_require__(2);
    ```

    不会出现__webpack_require__.n的使用。

    此时调用es6模块暴露出的所有属性都通过__WEBPACK_IMPORTED_MODULE_0__c__['随机属性名']的方式，例如：

    ```
    console.log(__WEBPACK_IMPORTED_MODULE_0__c__["c" /* default */])
    ```

8. es6模块被require时，简单的多：

    ```
    var c = __webpack_require__(2);
    ```

    调用任何属性都通过c直接调用。

简述：

    import->__webpack_require__ 和 __webpack_require__.n(引用commonjs模块时出现)
    require->__webpack_require__
    export->__webpack_require__.d
    export default->__webpack_exports__[".."]
    module.exports->不变

> [webpack模块化原理-ES module](https://segmentfault.com/a/1190000010955254)

> [import、require、export、module.exports 混合使用详解](https://segmentfault.com/a/1190000012386576#articleHeader8)

[项目代码](https://github.com/mcdyzg/webpack-analyse.git)

根据以上思路，如果实现了文件按路径加载，就能写出一个简单的模块化工具了。
