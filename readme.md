# blear.ui.sticky

[![npm module][npm-img]][npm-url]
[![build status][travis-img]][travis-url]
[![coverage][coveralls-img]][coveralls-url]

[travis-img]: https://img.shields.io/travis/blearjs/blear.ui.sticky/master.svg?maxAge=2592000&style=flat-square
[travis-url]: https://travis-ci.org/blearjs/blear.ui.sticky

[npm-img]: https://img.shields.io/npm/v/blear.ui.sticky.svg?maxAge=2592000&style=flat-square
[npm-url]: https://www.npmjs.com/package/blear.ui.sticky

[coveralls-img]: https://img.shields.io/coveralls/blearjs/blear.ui.sticky/master.svg?maxAge=2592000&style=flat-square
[coveralls-url]: https://coveralls.io/github/blearjs/blear.ui.sticky?branch=master


## 容器示意
```
  _____ ----------> scroller
 |    |
 |    |
====|====|==== ------> container
 |    | ----------> sticky
====|====|====
 |    |
 |    |
 -----
```
这里必须保证你的 scroller 是一个 div，container 是一个 div，
然后 container 不能被嵌套在可滚动容器里

