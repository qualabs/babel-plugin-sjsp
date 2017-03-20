import test from 'ava';
import { transformFileSync } from 'babel-core'
import vm from 'vm'
import plugin from '../src'
import profiler from '../src/profiler'

test('should transform function', async t => {
  const result = transformFileSync('./test/code/simple-func.js', {
    plugins: [[plugin, { 'interval': 2 }]],
  })
  const expected = `${profiler.replace('INTERVAL', 2)}

function simpleFunc() {
  var sjsp__state = sjsp__start("./test/code/simple-func.js", 1, 1, "simpleFunc", "function simpleFunc() {");

  return (function () {
    var sjsp__return = true;
    sjsp__end(sjsp__state);
    return sjsp__return;
  }).call(this);;
  sjsp__end(sjsp__state);
}`;
  t.deepEqual(result.code, expected);
});

test('should transform var function', async t => {
  const result = transformFileSync('./test/code/variable-func.js', {
    plugins: [plugin],
  })
  const expected = `${profiler.replace('INTERVAL', 1)}

var varFunc = function () {
  var sjsp__state = sjsp__start("./test/code/variable-func.js", 1, 15, "varFunc", "var varFunc = function () {");

  return (function () {
    var sjsp__return = true;
    sjsp__end(sjsp__state);
    return sjsp__return;
  }).call(this);;
  sjsp__end(sjsp__state);
};`;
  t.deepEqual(result.code, expected);
});

test('should transform assignment function', async t => {
  const result = transformFileSync('./test/code/assignment-func.js', {
    plugins: [plugin],
  })
  const expected = `${profiler.replace('INTERVAL', 1)}

var obj = {};

obj.test = function () {
  var sjsp__state = sjsp__start(\"./test/code/assignment-func.js\", 3, 12, \"obj.test\", \"obj.test = function () {\");

  return (function () {
    var sjsp__return = true;
    sjsp__end(sjsp__state);
    return sjsp__return;
  }).call(this);;
  sjsp__end(sjsp__state);
};`;
  t.deepEqual(result.code, expected);
});

test('should transform arrow function', async t => {
  const result = transformFileSync('./test/code/arrow-func.js', {
    plugins: [plugin],
  })
  const expected = `var _this = this;

${profiler.replace('INTERVAL', 1)}

const func = () => {
  var sjsp__state = sjsp__start("./test/code/arrow-func.js", 1, 14, "func", "const func = () => {");

  return (function () {
    var sjsp__return = true;
    sjsp__end(sjsp__state);
    return sjsp__return;
  }).call(_this);;
  sjsp__end(sjsp__state);
};`;
  t.deepEqual(result.code, expected);
});

test('should transform no block arrow function', async t => {
  const result = transformFileSync('./test/code/no-block-arrow-func.js', {
    plugins: [plugin],
  })
  const expected = `var _this = this;

${profiler.replace('INTERVAL', 1)}

const func = () => {
  var sjsp__state = sjsp__start("./test/code/no-block-arrow-func.js", 1, 14, "func", "const func = () => true;");
  return (function () {
    var sjsp__return = true;
    sjsp__end(sjsp__state);
    return sjsp__return;
  }).call(_this);;
  sjsp__end(sjsp__state);
};`;
  t.deepEqual(result.code, expected);
});

test('should transform multi declarations', async t => {
  const result = transformFileSync('./test/code/multi-variable-func.js', {
    plugins: [plugin],
  })
  const expected = `${profiler.replace('INTERVAL', 1)}

var varFunc0 = function () {
  var sjsp__state = sjsp__start("./test/code/multi-variable-func.js", 1, 16, "varFunc0", "var varFunc0 = function () {");

  return (function () {
    var sjsp__return = true;
    sjsp__end(sjsp__state);
    return sjsp__return;
  }).call(this);;
  sjsp__end(sjsp__state);
},
    varFunc1 = function () {
  var sjsp__state = sjsp__start("./test/code/multi-variable-func.js", 3, 15, "varFunc1", "}, varFunc1 = function () {");

  return (function () {
    var sjsp__return = true;
    sjsp__end(sjsp__state);
    return sjsp__return;
  }).call(this);;
  sjsp__end(sjsp__state);
};`;
  t.deepEqual(result.code, expected);
});

test('should transform callback function expression', async t => {
  const result = transformFileSync('./test/code/callback-func.js', {
    plugins: [plugin],
  })
  const expected = `${profiler.replace('INTERVAL', 1)}

setTimeout(function () {
  var sjsp__state = sjsp__start("./test/code/callback-func.js", 1, 12, "anonymous", "setTimeout(function () {");

  return (function () {
    var sjsp__return = true;
    sjsp__end(sjsp__state);
    return sjsp__return;
  }).call(this);;
  sjsp__end(sjsp__state);
});`;
  t.deepEqual(result.code, expected);
});

test('should transform if and return case', async t => {
  const result = transformFileSync('./test/code/if-return-func.js', {
    plugins: [plugin],
  })
  const expected = `${profiler.replace('INTERVAL', 1)}

function func() {
  var sjsp__state = sjsp__start("./test/code/if-return-func.js", 1, 1, "func", "function func() {");

  if (false) {
    return (function () {
      var sjsp__return = true;
      sjsp__end(sjsp__state);
      return sjsp__return;
    }).call(this);;
  }

  if (false) return (function () {
    var sjsp__return = true;
    sjsp__end(sjsp__state);
    return sjsp__return;
  }).call(this);;
  return (function () {
    var sjsp__return = true;
    sjsp__end(sjsp__state);
    return sjsp__return;
  }).call(this);;
  sjsp__end(sjsp__state);
}`;
  t.deepEqual(result.code, expected);
});

