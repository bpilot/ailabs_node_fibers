
var Fiber = module.require("fibers");

var FiberFuture = module.require("fibers_future.js");

function enterFiberJS(func)
{
  // void return value.
  Fiber(func).run();
}

function enterFiberTwoArgsJS(func, arg1, arg2)
{
  // void return value.
  Fiber( function() { func(arg1, arg2) }).run();
}

global.dg6fibers = {};
global.dg6fibers.enterFiberJS = enterFiberJS;
global.dg6fibers.enterFiberTwoArgsJS = enterFiberTwoArgsJS;
global.dg6fibers.FiberFuture = FiberFuture;
