(function () {
"use strict";

var Fiber = require("fibers");

var extend = require('util')._extend;

function FiberFuture()
{
  this.fiber = Fiber.current;
  this.resolved = false;
  this.yielded = false;

  // Bind JS methods for resolve so can be used as callbacks.
  this.resolve = this.resolve.bind(this);
  this.resolveValue = this.resolveValue.bind(this);
  this.resolveError = this.resolveError.bind(this);
}

FiberFuture.prototype.resolve = function (err, res) {

    var self = this;
    if (this.resolved) return;
    this.resolved = true;
    if (err && ! (err instanceof Error)) {
      if (typeof err === 'string')
        err = new Error(err);
      else if (typeof err === 'object')
        err = extend(new Error, err);
      if (! err.message) err.message = '[syncho] Unknown error captured';
    }
    if (this.yielded) {
      process.nextTick(function () {
        if (err) {
          self.fiber.run(err);
        } else {

try {

          self.fiber.run(res);
}
catch(e) {
  console.log("Error captured:", e);
  throw e;
}


        }
        self.fiber = null;
      });
    } else {
      this.error = err;
      this.result = res;
      this.fiber = null;
    }
};

FiberFuture.prototype.resolveValue = function (res)
{
  this.resolve(null, res);
};

FiberFuture.prototype.resolveError = function (err)
{
  this.resolve(err, null);
};

FiberFuture.prototype.wait = function ()
{
    if (! this.resolved) {
      try {
        this.result =  this.produce();
      }
      catch (err) {
        this.error = err;
      }
    }
    this.fiber = null;
    var result = this.result, error = this.error;
    this.result = null;
    this.error = null;

    if (error)
      throw error;
    else
      return result;
};

FiberFuture.prototype.produce = function ()
{
    this.yielded = true;
    var res = Fiber.yield();
    if (res instanceof Error) throw res;
    else return res;
};

// static: utility to sleep for N ms
FiberFuture.sleep = function sleep (ms)
{
  var future = new FiberFuture();

  setTimeout(future.resolveValue, ms);

  future.wait();
};

module.exports = FiberFuture;

})();
