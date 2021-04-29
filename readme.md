## 手写 webpack 原理

参考文章：<br>
https://segmentfault.com/a/1190000021494964<br>
https://zhuanlan.zhihu.com/p/58151131  

1. npm init 初始
2. 安装依赖 npm install -D @babel/core @babel/parser @babel/preset-env @babel/traverse
3. 建立调试文件
```javascript
/* ./src/index.js */
import user from './utils/user'
import info from './utils/info'

console.log('i am index.js')
user.log('index.js')
info.log('index.js')
```
```javascript
/* ./src/utils/user.js */
console.log('i am user.js')

export default {
  log(username) {
    console.log('i am user.js used by the ' + username)
  }
}
```
```javascript
/* ./src/utils/info.js */
import goods from './goods'

console.log('i am info.js')
goods.log('info.js')

export default {
  log(username) {
    console.log('i am info.js used by the ' + username)
  }
}
```
```javascript
/* ./src/utils/goods.js */
console.log('i am goods.js')

export default {
  log(username) {
    console.log('i am goods.js used by the ' + username)
  }
}
```
4. 开始编写 webpack.js 打包代码
    - 3.1 读取入口文件、使用 @babel/parser 的 parse 方法将文件内容转为 AST 抽象语法树
    - 3.2 使用 @babel/traverse 对 AST 解析文件依赖生成依赖描述
    - 3.3 使用 @babel/core 的 transformFromAst 对 AST 中的文件代码转换成 es5
    - 3.4 根据文件依赖关系递归解析输出所有依赖项
    - 3.5 根据 3.4 的依赖关系生成想要运行的代码字符串
    - 3.6 编写核心启动代码字符串（重点！！！后面讲解）
    - 3.7 根据字符串使用 fs.writeFileSync 把文件内容写入到文件系统
    - 3.8 执行 node webpack.js 运行生成 ./dist/main.js 文件
```javascript
/* 3.4 输出的依赖项 */
[
  {
    filename: './src/index.js',
    ast: Node {
      type: 'File',
      start: 0,
      end: 115,
      loc: [SourceLocation],
      range: undefined,
      leadingComments: undefined,
      trailingComments: undefined,
      innerComments: undefined,
      extra: undefined,
      errors: [],
      program: [Node],
      comments: []
    },
    dependecies: {
      './utils/user': './src/utils/user.js',
      './utils/info': './src/utils/info.js'
    },
    code: '"use strict";\n' +
      '\n' +
      'var _user = _interopRequireDefault(require("./utils/user"));\n' +
      '\n' +
      'var _info = _interopRequireDefault(require("./utils/info"));\n' +
      '\n' +
      'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
      '\n' +
      "console.log('i am index.js');\n" +
      '\n' +
      '_user["default"].log();\n' +
      '\n' +
      '_info["default"].log();'
  },
  {
    filename: './src/utils/user.js',
    ast: Node {
      type: 'File',
      start: 0,
      end: 64,
      loc: [SourceLocation],
      range: undefined,
      leadingComments: undefined,
      trailingComments: undefined,
      innerComments: undefined,
      extra: undefined,
      errors: [],
      program: [Node],
      comments: []
    },
    dependecies: {},
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports["default"] = void 0;\n' +
      'var _default = {\n' +
      '  log: function log() {\n' +
      "    console.log('i am user.js');\n" +
      '  }\n' +
      '};\n' +
      'exports["default"] = _default;'
  },
  {
    filename: './src/utils/info.js',
    ast: Node {
      type: 'File',
      start: 0,
      end: 93,
      loc: [SourceLocation],
      range: undefined,
      leadingComments: undefined,
      trailingComments: undefined,
      innerComments: undefined,
      extra: undefined,
      errors: [],
      program: [Node],
      comments: []
    },
    dependecies: { './goods': './src/utils/goods.js' },
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports["default"] = void 0;\n' +
      '\n' +
      'var _goods = _interopRequireDefault(require("./goods"));\n' +
      '\n' +
      'function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }\n' +
      '\n' +
      'var _default = {\n' +
      '  log: function log() {\n' +
      "    console.log('i am info.js');\n" +
      '  }\n' +
      '};\n' +
      'exports["default"] = _default;'
  },
  {
    filename: './src/utils/goods.js',
    ast: Node {
      type: 'File',
      start: 0,
      end: 65,
      loc: [SourceLocation],
      range: undefined,
      leadingComments: undefined,
      trailingComments: undefined,
      innerComments: undefined,
      extra: undefined,
      errors: [],
      program: [Node],
      comments: []
    },
    dependecies: {},
    code: '"use strict";\n' +
      '\n' +
      'Object.defineProperty(exports, "__esModule", {\n' +
      '  value: true\n' +
      '});\n' +
      'exports["default"] = void 0;\n' +
      'var _default = {\n' +
      '  log: function log() {\n' +
      "    console.log('i am goods.js');\n" +
      '  }\n' +
      '};\n' +
      'exports["default"] = _default;'
  }
] 
```

贴张 main.js 执行流程的图方便理解
