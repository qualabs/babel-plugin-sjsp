# babel-plugin-sjsp ⚡

A babel plugin, for sjsp (Simple JavaScript Profiler).

[![Build Status](https://img.shields.io/travis/bokuweb/babel-plugin-sjsp.svg?style=flat-square)](https://travis-ci.org/bokuweb/babel-plugin-sjsp)
[![Version](https://img.shields.io/npm/v/babel-plugin-sjsp.svg?style=flat-square)](https://www.npmjs.com/package/babel-plugin-sjsp)


## What is it

This is a babel plugin for JavaScript profiler, inspired by [sjsp](https://github.com/itchyny/sjsp), which is implemented in Haskell.
And forked from [node-sjsp](https://github.com/45deg/node-sjsp).

## How to install

```
npm install --save-dev babel-plugin-sjsp
```

## Usage

- .babelrc

```
{
  "plugins": ["babel-plugin-sjsp", { "interval": 10 }]
}
```

- Options

### interval

Type: `number`
Default: `1` [sec]

output interval.

Open the page with your browser and you can see profiles in the JavaScript console every 1 seconds. (you can change this interval by `interval` option)

```
========== SORT BY TIME ==========
time:    0.60sec   count:    1777    something.js          test1   (line:   7, col: 17)   function test1(){
time:    0.60sec   count:    1701    something.js          test0   (line:   1, col: 17)   function test0(){
time:    0.58sec   count:    1601    something.js          test4   (line:  25, col: 17)   function test4(){
time:    0.57sec   count:    1703    something.js          test2   (line:  13, col: 17)   function test2(){
time:    0.54sec   count:    1632    something.js          test3   (line:  19, col: 17)   function test3(){
time:    0.53sec   count:    1586    something.js          test5   (line:  31, col: 17)   function test5(){
========== SORT BY COUNT ==========
time:    0.60sec   count:    1777    something.js          test1   (line:   7, col: 17)   function test1(){
time:    0.57sec   count:    1703    something.js          test2   (line:  13, col: 17)   function test2(){
time:    0.60sec   count:    1701    something.js          test0   (line:   1, col: 17)   function test0(){
time:    0.54sec   count:    1632    something.js          test3   (line:  19, col: 17)   function test3(){
time:    0.58sec   count:    1601    something.js          test4   (line:  25, col: 17)   function test4(){
```

For details, see [original document](https://github.com/itchyny/sjsp#usage)

## How it works

See [original document](https://github.com/itchyny/sjsp#how-it-works)

## Limitation

This profiling is available for browser only now.

## LICENSE

MIT
