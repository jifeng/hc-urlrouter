/*!
 * urlrouter - urlouter.test.js
 * Copyright(c) 2012 - 2013 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

"use strict";

/**
 * Module dependencies.
 */


var connect = require('connect');
var request = require('supertest');
var urlrouter = require('../');
var should = require('should');
var http = require('http');


var router1 = urlrouter(function (app) {
  app.all('/next*', function (req, res, next) {
    req.a = 1;
    next()
  })
});

var router2 = urlrouter(function (app) {
  app.all('/next*', function (req, res, next) {
    req.b = 2
    return res.end(JSON.stringify({a: req.a, b: req.b, url: req.url, originalUrl: req.originalUrl}));
  });
});

var app = connect();
app.use(router1);
app.use(router2);

app = http.createServer(app);
var port = Math.floor(Math.random()* 9000 + 1000);


describe('honeycomb runner', function () {
  before(function (done) {
    app.listen(port, done);
  });

  after(function () {
    app.close();
  });

  it('should /next/hello 200', function (done) {
    app.request().get('/next/hello').end(function (res) {
      res.should.status(200);
      var params = JSON.parse(res.body);
      params.should.eql({ a: 1, b: 2, url: '/hello', originalUrl: '/next/hello'});
      done();
    });
  });

  it('should /next/hello?a=b 200', function (done) {
    app.request().get('/next/hello?a=b').end(function (res) {
      res.should.status(200);
      var params = JSON.parse(res.body);
      params.should.eql({ a: 1, b: 2, url: '/hello?a=b', originalUrl: '/next/hello?a=b'});
      done();
    });
  });

  it('should /next 200', function (done) {
    app.request().get('/next').end(function (res) {
      res.should.status(200);
      var params = JSON.parse(res.body);
      params.should.eql({ a: 1, b: 2, url: '/', originalUrl: '/next' });
      done();
    });
  });

  it('should /next/ 200', function (done) {
    app.request().get('/next/').end(function (res) {
      res.should.status(200);
      var params = JSON.parse(res.body);
      params.should.eql({ a: 1, b: 2, url: '/', originalUrl: '/next/' });
      done();
    });
  });
});
