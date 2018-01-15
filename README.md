<!-- ## 前言

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
