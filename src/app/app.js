"use strict";
//基本组件

// 如果本模块是es6模块，而且引用的c也是es6模块，那么c编译后不会添加{__esModule:true}，只有本模块才会添加{__esModule:true}
// 如果本模块是es6模块，调用的c是commonjs模块，那么c会原样输出，并且c将不会有default属性，c会原样输出module.exports的值
import c from './c';
import {c1,c2} from './c'
console.log(c,c1,c2)

export default '我是a';







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
