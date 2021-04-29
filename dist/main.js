(function (graph) {
  function require(filename) {
    const { fn, dependecies } = graph[filename];
    function localRequire(relativePath) {
      //根据模块的路径在 dependecies 中找到对应的模块
      return require(dependecies[relativePath]);
    }
    const module = { exports: {} };
    //执行每个模块的代码
    fn(localRequire, module, module.exports);
    console.log("main.js bundle :", filename, module, module.exports);
    return module.exports;
  }
  //执行入口文件，
  require("./src/index.js");
})({
  "./src/index.js": {
    dependecies: {
      "./utils/user": "./src/utils/user.js",
      "./utils/info": "./src/utils/info.js",
    },
    fn: function (require, module, exports) {
      "use strict";

      var _user = _interopRequireDefault(require("./utils/user"));

      var _info = _interopRequireDefault(require("./utils/info"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

      console.log("i am index.js");

      _user["default"].log("index.js");

      _info["default"].log("index.js");
    },
  },

  "./src/utils/user.js": {
    dependecies: {},
    fn: function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = void 0;
      console.log("i am user.js");
      var _default = {
        log: function log(username) {
          console.log("i am user.js used by the " + username);
        },
      };
      exports["default"] = _default;
    },
  },

  "./src/utils/info.js": {
    dependecies: { "./goods": "./src/utils/goods.js" },
    fn: function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = void 0;

      var _goods = _interopRequireDefault(require("./goods"));

      function _interopRequireDefault(obj) {
        return obj && obj.__esModule ? obj : { default: obj };
      }

      console.log("i am info.js");

      _goods["default"].log("info.js");

      var _default = {
        log: function log(username) {
          console.log("i am info.js used by the " + username);
        },
      };
      exports["default"] = _default;
    },
  },

  "./src/utils/goods.js": {
    dependecies: {},
    fn: function (require, module, exports) {
      "use strict";

      Object.defineProperty(exports, "__esModule", {
        value: true,
      });
      exports["default"] = void 0;
      console.log("i am goods.js");
      var _default = {
        log: function log(username) {
          console.log("i am goods.js used by the " + username);
        },
      };
      exports["default"] = _default;
    },
  },
});
