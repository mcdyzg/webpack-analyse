// // es6模块

export default 'bbb';






// commonjs模块

// 如果c.js是commonjs文件，那么虽然b可以被import引用（编译成了webpack 的module），但是不能被tree-shaking了，
// module.exports = 'bbb'
