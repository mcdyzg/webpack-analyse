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
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
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

//基本组件

// 如果本模块是es6模块，而且引用的c也是es6模块，那么c编译后不会添加{__esModule:true}，只有本模块才会添加{__esModule:true}
// 如果本模块是es6模块，调用的c是commonjs模块，那么c会原样输出，并且c将不会有default属性，c会原样输出module.exports的值


console.log(__WEBPACK_IMPORTED_MODULE_0__c__["c" /* default */], __WEBPACK_IMPORTED_MODULE_0__c__["a" /* c1 */], __WEBPACK_IMPORTED_MODULE_0__c__["b" /* c2 */]);

/* harmony default export */ __webpack_exports__["default"] = ('我是a');
var aaaa = '我是aaaa';

// // 如果是commonjs模块引用了es6模块，那么b编译后会添加{__esModule:true}。
// // 如果b中有export default语句，那么编译后的b文件会添加b.default = ...，这时调用b里default的变量就需要b.default。
// // 如果b文件是commonjs模块，那么b会原样输出。
// var b = require('./b')
// var c = require('./c')
// console.log(b.default)
// console.log(c)

// // 如果本模块是commonjs模块，那么不能出现import了
// // import b from './b'
// // console.log(b)

// module.exports = {
// 	a:'我是a'
// }


// 综上：
// 1. es6模块调用commonjs模块，可以直接使用commonjs模块，commonjs模块将不会被webpack的模块系统编译而是会原样输出，并且commonjs模块没有.default属性

// 2. es6模块调用es6模块,被调用的es6模块不会添加{__esModule:true}，只有调用者才会添加{__esModule:true}；并且可以进行tree-shaking操作，如果被调用的es6模块只是import进来，但是并没有被用到，那么被调用的es6模块将会被标记为/* unused harmony default export */，在压缩时此模块将会被删除（例外：如果被调用的es6模块里有立即执行语句，那么这些语句将会被保留）。

// 3. 如果是commonjs模块引用了es6模块，那么es6模块编译后会添加{__esModule:true}。// 如果被调用的es6模块中恰好有export default语句，那么编译后的es6模块将会添加.default = ...，这时调用require进来的es6模块默认值，就需要例如：var b = require('./b').default   console.log(b)

// 4. 如果commonjs模块调用commonjs模块，那么commonjs模块会原样输出。

// 5. commonjs模块中不能使用import语句，会报错

// 6. webpakc的output设置会设置模块的打包格式和保留变量，如果设置library = 'test'，那么打包后的js执行完成后所有的模块将会挂到var test上

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return c1; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return c2; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__b__ = __webpack_require__(3);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__b___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__b__);
// es6模块


console.log(__WEBPACK_IMPORTED_MODULE_0__b___default.a);

var c1 = '我是c111';
var c2 = '我是c222';

/* harmony default export */ __webpack_exports__["c"] = ('我是c');

//
// // // commonjs模块
//
// let c1 = 'c1'
// let c2 = 'c2'
// module.exports = {
// 	c1,
// 	c2,
// }

/***/ }),
/* 3 */
/***/ (function(module, exports) {

// // es6模块
// export default 'bbb';


// commonjs模块

// 如果c.js是commonjs文件，那么虽然b可以被import引用（编译成了webpack 的module），但是不能被tree-shaking了，
module.exports = 'bbb';

/***/ })
/******/ ]);
});