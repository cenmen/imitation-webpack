const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const { transformFromAst } = require('@babel/core')

const options = require('./webpack.config')

const modules = []
const filenames = []

function getAst(path) {
  // 读取入口文件
  const content = fs.readFileSync(path, 'utf-8')
  // 将文件内容转为AST抽象语法树
  return parser.parse(content, {
    sourceType: 'module'
  })
}

function getDependecies(ast, filename) {
  const dependecies = {}
  // 遍历所有的 import 模块,存入dependecies
  traverse(ast, {
    // 类型为 ImportDeclaration 的 AST 节点 (即为import 语句)
    ImportDeclaration({ node }) {
      const dirname = path.dirname(filename)
      // 保存依赖模块路径,之后生成依赖关系图需要用到
      const filepath = './' + path.join(dirname, node.source.value) + '.js'
      dependecies[node.source.value] = filepath
    }
  })
  return dependecies
}

function getCode(ast) {
  // AST转换为code
  const { code } = transformFromAst(ast, null, {
    presets: ['@babel/preset-env']
  })
  return code
}

function build(filename) {
  const ast = getAst(filename)
  const dependecies = getDependecies(ast, filename)
  const code = getCode(ast)
  return {filename, ast, dependecies, code}
}

function getModules(filename) {
  const info = build(filename)
  modules.push(info)
  modules.forEach(({ dependecies }) => {
    // 判断有依赖对象,递归解析所有依赖项
    if (JSON.stringify(dependecies) !== '{}') {
      for (const dependency in dependecies) {
        const filename = dependecies[dependency]
        if (filenames.includes(filename)) return
        filenames.push(filename)
        getModules(filename)
      }
    }
  })
}

function getDependencyGraph() {
  // 生成依赖关系图字符串
  let dependencyGraph = ''
  modules.forEach(item => {
    dependencyGraph += `
      "${item.filename}": {
        dependecies: ${JSON.stringify(item.dependecies)},
        fn: function (require, module, exports){
            ${item.code}
          }
      },
    `
  })
  return dependencyGraph
}

function bundle(graph, options) {
  // 输出文件路径
  const filePath = path.join(options.output.path, options.output.filename)
  const bundle = `
  (function(graph){
    function require(filename){
      const {fn, dependecies} = graph[filename];
      function localRequire(relativePath){
        //根据模块的路径在dependecies中找到对应的模块
        return require(dependecies[relativePath]);
      }
      const module = {exports:{}};
      //执行每个模块的代码。
      fn(localRequire, module, module.exports);
      return module.exports;
    }
    //执行入口文件，
    require('${options.entry}');
  })({${graph}})
`;

  // 把文件内容写入到文件系统(方法不能自动创建文件夹)
  fs.writeFileSync(filePath, bundle, 'utf-8')
}

function run(options) {
  getModules(options.entry)
  console.log(modules, filenames)
  const graph = getDependencyGraph()
  // console.log(graph)
  bundle(graph, options)
}

run(options)