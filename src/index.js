"use strict";

const template = require('babel-template');
const types = require('babel-types');
const profilerStr = require('./profiler');

const lineLimit = 100;

const end = () => template('sjsp__end(sjsp__state)')();

const start = (fileName, line, col, funcName, lineSrc) => {
  return template(`var sjsp__state = sjsp__start(FILE_NAME, LINE, COL, FUNC_NAME, LINE_SRC)`)({
    FILE_NAME: types.stringLiteral(fileName),
    LINE: types.numericLiteral(line),
    COL: types.numericLiteral(col),
    FUNC_NAME: types.stringLiteral(funcName),
    LINE_SRC: types.stringLiteral(lineSrc),
  });
}

const wrapReturn = (type, value) => {
  return template(`(function(){
  var sjsp__return = RETURN_ARGUMENT;
  sjsp__end(sjsp__state);
  SJSP_RETURN;
}).call(this);`)({
      RETURN_ARGUMENT: types[type](value),
      SJSP_RETURN: types.identifier('return sjsp__return'),
    });
}

module.exports = (babel) => {
  let lines;
  const wrapFunction = (node, funcName = 'anonymous', { line, column }, state) => {
    const fileName = state.file.opts.filename;
    const startStatement = start(fileName, line, column + 1, funcName, lines[line - 1].substr(0, lineLimit));
    if (types.isBlockStatement(node.body)) {
      const body = node.body.body;
      body.unshift(startStatement);
      body.push(end());
    } else {
      node.body = types.blockStatement([
        startStatement,
        types.returnStatement(node.body),
        end(),
      ]);
    }
  }

  return {
    visitor: {
      Program: {
        enter(path, state) {
          lines = state.file.code.split(/\r?\n/);
        },
        exit(path, state) {
          const profiler = template(profilerStr)({ INTERVAL: types.numericLiteral(state.opts.interval || 1) });
          path.node.body.unshift(profiler);
        },
      },
      /* 
        rewrite function
          function foo(){ body } -> function() { start('foo'); body; end; }
          function(){ body } -> function() { start('anonymous'); body; end; }
      */
      FunctionDeclaration(path, state) {
        wrapFunction(path.node, path.node.id.name, path.parent.loc.start, state);
      },
      /*
      rewrite return
        return expr; -> return (function(arguments) { start(); var value = expr; end(); return value; }).call(this, arguments);
      */
      ReturnStatement(path, state) {
        const { value, type } = path.node.argument;
        path.node.argument = wrapReturn(type, value);
      },

      /*
        rewrite var func
        var test = function() { body; }; -> function() { start("test"); body; end(); };
      */
      VariableDeclaration(path, state) {
        const { declarations } = path.node;
        if (!declarations || !declarations[0]) return;
        declarations.forEach((declaration) => {
          const { init } = declaration;
          if (!init) return;
          if (init.type === "FunctionExpression" || init.type === "ArrowFunctionExpression") {
            wrapFunction(init, declaration.id.name, init.loc.start, state);
            return;
          }
        });
      },

      /*
       rewrite assign func
          a.test = function() { body; }; -> function() { start("a.test"); body; end(); };
      */
      AssignmentExpression(path, state) {
        const { right, left } = path.node;
        const name = (left.object ? left.object.name : '') + (left.property ? ('.' + left.property.name) : '');
        if (right.type === "FunctionExpression" || right.type === "ArrowFunctionExpression") {
          wrapFunction(right, name, right.loc.start, state);
          return;
        }
      },

      /*
       rewrite callback func
          setTimeout(function() { body; }); -> setTimeout(function() { start("anonymous"); body; end(); });
      */
      CallExpression(path, state) {
        path.node.arguments.forEach((arg) => {
          if (arg.type === 'FunctionExpression' || arg.type === "ArrowFunctionExpression") {
            const name = arg.id && arg.id.name || 'anonymous';
            wrapFunction(arg, name, arg.loc.start, state);
          }
        });
      }
    }
  }
}
