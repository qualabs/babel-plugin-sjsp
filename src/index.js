"use strict";

const profilerStr = require('./profiler');

module.exports = function({
  types,
  template
}) {
  let lines;
  const lineLimit = 100;

  const start = (fileName, line, col, funcName, lineSrc) => {
    return template(`var sjsp__state = sjsp__start(FILE_NAME, LINE, COL, FUNC_NAME, LINE_SRC)`)({
      FILE_NAME: types.stringLiteral(fileName),
      LINE: types.numericLiteral(line),
      COL: types.numericLiteral(col),
      FUNC_NAME: types.stringLiteral(funcName),
      LINE_SRC: types.stringLiteral(lineSrc),
    });
  };

  const end = () => template('sjsp__end(sjsp__state)')();

  const wrapReturn = (argument) => {
    var t = template(`(function(){
      var sjsp__return = RETURN_ARGUMENT;
      sjsp__end(sjsp__state);
      SJSP_RETURN
    }).call(this);`)({
      RETURN_ARGUMENT: argument,
      SJSP_RETURN: types.identifier('return sjsp__return'),
    });
    return t.expression;
  };

  const wrapFunction = (node, funcName = 'anonymous', loc, state) => {
    let line = 1
    let column = 0;
    let src = "unknown";
    try {
      line = loc.start.line;
      column = loc.start.column;
      src = lines[line - 1].substr(0, lineLimit);
    } catch (TypeError) {}

    const fileName = state.file.opts.filename;
    const startStatement = start(fileName, line, column + 1, funcName, src);

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
  };


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
        rewrite class methods
      */
      'FunctionDeclaration|ClassMethod' (path, state) {
        let name = 'anonymous';

        //Try to find a name for this function
        try {
          name = path.node.id.name; //FunctionDeclaration
        } catch (TypeError) {
          try {
            name = path.node.key.name; //ClassMethod
          } catch (TypeError) {}
        }

        if (name.startsWith("_")) { //skip webpack internal functions
          path.shouldSkip = true;
        } else {
          wrapFunction(path.node, name, path.node.loc, state);
        }
      },

      /*
      rewrite return
        return expr; -> return (function(arguments) { start(); var value = expr; end(); return value; }).call(this, arguments);
      */
      ReturnStatement(path, state) {
        path.node.argument = wrapReturn(path.node.argument);
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
            wrapFunction(init, declaration.id.name, init.loc, state);
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
          wrapFunction(right, name, right.loc, state);
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
            wrapFunction(arg, name, arg.loc, state);
          }
        });
      }


    }
  };
}
