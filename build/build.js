

/**
 * hasOwnProperty.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module.exports) {
    module.exports = {};
    module.client = module.component = true;
    module.call(this, module.exports, require.relative(resolved), module);
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  var index = path + '/index.js';

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (has.call(require.modules, path)) return path;
  }

  if (has.call(require.aliases, index)) {
    return require.aliases[index];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!has.call(require.modules, from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    if ('.' != path.charAt(0)) {
      var segs = parent.split('/');
      var i = lastIndexOf(segs, 'deps') + 1;
      if (!i) i = 0;
      path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
      return path;
    }
    return require.normalize(p, path);
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return has.call(require.modules, localRequire.resolve(path));
  };

  return localRequire;
};
require.register("threepointone-iso/index.js", function(exports, require, module){
function transform(pxlen, height, x, y, z, offset) {
    // convert a point from 
    // isometric x, y, z space to 
    // top, left, zIndex
    offset = offset || {}

    pxlen = pxlen || 24;
    height = height || 33;

    x = x || 0;
    y = y || 0;
    z = z || 0;

    return {
        left: ((offset.left || 0) + ((x - y) * pxlen)) + 'px',
        top: ((offset.top || 0 ) - (((x + y) * 0.6 * pxlen) + (z * height))) + 'px',
        zIndex: Math.round(1000 + (1000 * z) - ((x + y))) + ''
    }
}

var faceMap = {
    front: {
        rotateZ: '-30deg',
        skewX: '-30deg',
        skewY: '0deg',
        translateX: '0px',
        translateY: '0px',
        scaleY:'1'
    },
    left: {
        rotateZ: '30deg',
        skewX: '30deg',
        skewY: '0deg',
        translateX: '-30px',
        translateY: '14.2px',
        scaleY:'1'
    },
    top: {
        rotateZ: '-30deg',
        skewX: '30deg',
        skewY: '0deg',
        translateX: '16px',
        translateY: '-28px',
        scaleY:'0.88'
    }
};

function face(type) {
    return faceMap[type];
}

module.exports = {
    transform: transform,
    face: face
};
});
require.register("threepointone-times/index.js", function(exports, require, module){
var has = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;

var isArray = Array.isArray ||
function(obj) {
    return toString.call(obj) == '[object Array]';
};

module.exports = function(n, fn) {
    var args = arguments;
    // combination forloop / map. 
    // compatible with regular _.times
    // WARNING - fn is called with (index, value), not the other (regular) way around
    var times = isArray(n) ? n.length : n;
    var arr = isArray(n) ? n : [];
    var ret = [];

    // check if .invoke 
    if('string' === typeof fn){
        fn = (function(f){
            return function(i, el){
                return el[f].apply(el, Array.prototype.slice.call(args, 2));
            };
        }(fn));
    }
    // default iterator
    fn = fn || function(i, el){ return el; };

    for(var i = 0; i < times; i++) {
        ret.push(fn(i, arr[i]));
    }
    return ret;
};
});
require.register("threepointone-flatten/index.js", function(exports, require, module){
var isArray = require('isArray'),
    each = require('each');

function flatten(input, shallow, output) {
    each(input, function(value) {
        if (isArray(value)) {
            shallow ? [].push.apply(output, value) : flatten(value, shallow, output);
        } else {
            output.push(value);
        }
    });
    return output;
}

module.exports = function(arr, shallow) {
    return flatten(arr, shallow, []);
};
});
require.register("threepointone-iso-grid/index.js", function(exports, require, module){
module.exports = Grid;
"use strict";

var slice = [].slice,
    beam = require('beam'),
    each = require('each'),
    extend = require('extend'),
    iso = require('iso'),
    times = require('times'),
    flatten = require('flatten'),
    isArray = require('isArray'),
    doc = document,
    isValue = function(v) {
        return v != null;
    };


function Grid(el, options) {
    if (!(this instanceof Grid)) return new Grid(el, options);
    this.el = el || document.body;
    this.el.className = (this.el.className || '').split(' ').concat(['iso-grid']).join(' ');
    options = options || {};
    this.faces = [];
    this.offset = options.offset || 0;

    this.colorMap = {
        front: '#444444',
        left: '#222222',
        top: '#777777'
    };

}

extend(Grid.prototype, {
    add: function() {
        var els = flatten(slice.call(arguments, 0)),
            me = this.el,
            t = this;
        each(els, function(el) {
            if (el.parentNode !== me) {
                me.appendChild(el);
                t.faces.push(el);
            }
        });
    },
    face: function(pos) {
        var el = doc.createElement('div');
        el.className = 'face';
        el.style.zIndex = 1;
        el.style.opacity = 0;

        el.style.backgroundColor = '#000';

        var dir = pos.dir || 'front';
        var coOrds = extend({
            backgroundColor: this.colorMap[dir]
        }, iso.transform(null, null, pos.x, pos.y, pos.z, this.offset), {
            transform: iso.face(dir),
            opacity: 1
        });
        el.setAttribute('face', dir);
        el.setAttribute('x:y:z', [pos.x, pos.y, pos.z].join(':'));

        beam(el, coOrds);

        // guh.

        el.__beam__.multiply(0.007);
        el.__beam__.tweens.zIndex.multiply(0.5);
        el.__beam__.transformer.multiply(0.007);

        return el;

    },
    cube: function(pos) {
        var t = this;
        return times(['front', 'left', 'top'], function(i, face) {
            return t.face(extend({
                dir: face
            }, pos));
        });
    },
    move: function(faces, pos) {
        var t = this;

        each(!isArray(faces) ? [faces] : faces, function(face) {

            var position = (typeof pos === 'function' ? pos(face) : pos),
                pieces = face.getAttribute('x:y:z').split(':'),
                dir = pos.dir || face.getAttribute('face'),
                xyz = times(pieces, function(i, p) {
                    return parseFloat(p, 10);
                }),
                x = isValue(pos.x) ? pos.x : xyz[0],
                y = isValue(pos.y) ? pos.y : xyz[1],
                z = isValue(pos.z) ? pos.z : xyz[2];

            var coOrds = extend({
                backgroundColor: t.colorMap[dir]
            }, iso.transform(null, null, x, y, z, t.offset), {
                transform: iso.face(dir)
            });

            face.setAttribute('face', dir);
            face.setAttribute('x:y:z', [x, y, z].join(':'));

            beam(face, coOrds);

        });

        return this;
    },
    closest: function(x, y, faces) {
        // return an array sorted by 'distance' to x, y

        faces = times(faces || this.faces); // a quick clone
        faces.sort(function(a, b) {
            var axyz = a.getAttribute('x:y:z').split(':');
            var bxyz = b.getAttribute('x:y:z').split(':');

            var ax = parseFloat(axyz[0], 10),
                ay = parseFloat(axyz[1], 10);
            var bx = parseFloat(bxyz[0], 10),
                by = parseFloat(bxyz[1], 10);

            var expr = Math.sqrt(((ax - x) * (ax - x)) + ((ay - y) * (ay - y))) - Math.sqrt(((bx - x) * (bx - x)) + ((by - y) * (by - y)));

            return -1 * expr;

        });
        return faces;

    }
});

Grid.each = each;
Grid.times = times;
Grid.isArray = isArray;
Grid.extend = extend;
Grid.iso = iso;
Grid.beam = beam;
});
require.register("threepointone-game-of-life/index.js", function(exports, require, module){
module.exports = Grid;

function Grid(options) {
    options = options || {};
    // assuming 2 dimensional grid, standard rules
    if (!(this instanceof Grid)) return new Grid(options);
    this.grid = [];
    this.added = [];
    this.removed = [];
    this.unchanged = [];
    this.width = options.width || 20;
    this.height = options.height || 20;
}

Grid.prototype.at = function(x, y, live) {
    if (typeof live === 'boolean') {
        this.grid[y] = this.grid[y] || [];
        if (live) {
            if (!this.grid[y][x]) {
                this.added.push({
                    x: x,
                    y: y
                });
            } 

        } else {
            if (this.grid[y][x]) {
                this.removed.push({
                    x: x,
                    y: y
                });
            }
        }
        this.grid[y][x] = live;
        return this;
    }

    if (this.grid[y]) {
        return this.grid[y][x] || false;
    }
    return false;
};

Grid.prototype.step = function() {
    var _grid = [];

    var added = [];
    var removed = [];
    var unchanged = [];

    for (var i = this.width; i--;) {
        for (var j = this.height; j--;) {
            var state = this.rules(i, j);
            if (state) {
                _grid[j] = _grid[j] || [];
                _grid[j][i] = state;

                if (!this.grid[j] || (this.grid[j] && !this.grid[j][i])) {
                    added.push({
                        x: i,
                        y: j
                    });
                }
                else{
                    unchanged.push({
                        x:i,
                        y:j
                    });
                }
            } else {
                if (this.grid[j] && this.grid[j][i]) {
                    removed.push({
                        x: i,
                        y: j
                    });
                }
            }
        }
    }
    this.grid = _grid;
    this.added = added;
    this.removed = removed;
    this.unchanged = unchanged;
    return this;
};

Grid.prototype.rules = function(x, y) {
    // applies rules and sends back true or false on basis of live or dead
    if (this.at(x, y) === true) { // live cell
        switch (this.neighbors(x, y)) {
            case 0:
            case 1:
                return false;
            case 2:
            case 3:
                return true;
            default:
                return false;
        }
    } else {
        if (this.neighbors(x, y) === 3) {
            return true;
        }
    }
    return false;
};

Grid.prototype.neighbors = function(x, y) {
    var ctr = 0;
    for (var i = x - 1; i < x + 2; i++) {
        for (var j = y - 1; j < y + 2; j++) {
            if ((i >= 0) && (i < this.width) && (j >= 0) && (j < this.height) && (!((x === i) && (y === j))) && (this.at(i, j) === true)) {
                ctr++;
            }
        }
    }
    return ctr;
};

Grid.prototype.str = function() {
    var str = [];
    for (var j = 0; j < this.height; j++) {
        for (var i = 0; i < this.width; i++) {
            str += (this.at(i, j) ? 'O' : '.');
        }
        str += '\n';
    }
    return str;

};
});
require.register("segmentio-extend/index.js", function(exports, require, module){

module.exports = function extend (object) {
    // Takes an unlimited number of extenders.
    var args = Array.prototype.slice.call(arguments, 1);

    // For each extender, copy their properties on our object.
    for (var i = 0, source; source = args[i]; i++) {
        if (!source) continue;
        for (var property in source) {
            object[property] = source[property];
        }
    }

    return object;
};
});
require.register("threepointone-twain/lib/twain.js", function(exports, require, module){
(function(name, context, definition) {

    if(typeof module != 'undefined' && module.exports) module.exports = definition();
    else if(typeof define == 'function' && define.amd) define(definition);
    else context[name] = definition();

})('Twain', this, function() {
    // some helper functions
    var nativeForEach = [].forEach,
        slice = [].slice,
        has = {}.hasOwnProperty;

    function each(obj, iterator, context) {
        if(obj == null) return;
        if(nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if(obj.length === +obj.length) {
            for(var i = 0, l = obj.length; i < l; i++) {
                if(iterator.call(context, obj[i], i, obj) === {}) return;
            }
        } else {
            for(var key in obj) {
                if(has.call(obj, key)) {
                    if(iterator.call(context, obj[key], key, obj) === {}) return;
                }
            }
        }
    }

    function collect(obj, fn) {
        var o = {};
        each(obj, function(el, index) {
            o[index] = (typeof fn === 'string') ? el[fn] : fn(el, index);
        });
        return o;
    }

    function extend(obj) {
        each(slice.call(arguments, 1), function(source) {
            for(var prop in source) {
                if(has.call(source, prop)) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    }

    function isValue(v) {
        return v != null; // matches undefined and null
    }

    function abs(n) {
        return n < 0 ? -n : n;
    }

    function identity(x) {
        return x;
    }

    // defaults for a single tweener. pass these params into constructor to change the nature of the animation
    var defaults = {
        // used for snapping, since the algorithm doesn't ever reach the 'end'
        threshold: 0.2,
        // fraction to moveby per frame * fps. this determines "speed"
        // defaults to ~ 15% * (1000/60)
        multiplier: 0.01,
        // timer function, so you can do a custom f(t)
        now: function() {
            return new Date().getTime();
        }
    };


    // meat and potatoes

    function Tween(config) {
        if(!(this instanceof Tween)) return new Tween(config);

        this.config = config = extend({}, config);

        // merge the defaults with self
        each(defaults, function(val, key) {
            this[key] = isValue(config[key]) ? config[key] : val;
        }, this);
    }

    extend(Tween.prototype, {
        // Number: defines 'origin', ie - the number to start from
        from: function(from) {
            this._from = this.value = from;
            isValue(this._to) || this.to(from);
            return this;
        },
        // Number: defines 'destinations', ie - the number to go to
        to: function(to) {
            isValue(this._from) || this.from(to);
            this._to = to;
            return this;
        },
        // run one step of the tween. updates internal variables, and return spec object for this 'instant'
        step: function() {

            isValue(this.time) || (this.time = this.now());

            // this is the heart of the whole thing, really. 
            // an implementation of an exponential smoothing function
            // http://en.wikipedia.org/wiki/Exponential_smoothing
            var now = this.now(),
                period = now - this.time,
                fraction = Math.min(this.multiplier * period, 1),
                delta = fraction * (this._to - this.value),
                value = this.value + delta;

            // snap if we're close enough to the target (defined by `this.threshold`)
            if(abs(this._to - value) < this.threshold) {
                delta = this._to - this.value;
                this.value = value = this._to;
                fraction = 1;

            } else {
                this.value = value;
            }

            this.time = now;

            this._update({
                time: this.time,
                period: period,
                fraction: fraction,
                delta: delta,
                value: value
            });

            return this;

        },
        // default handler for every step. change this by using this.update(fn)
        _update: function() {
            // blank
        },
        // if function is passed, it registers that as the step handler. else, it executes a step and returns self
        update: function(fn) {
            if(!fn) return this.step();
            this._update = fn;
            return this;

        },
        // resets time var so that next time it starts with a fresh value
        stop: function() {
            this.time = null;
            return this;
        },
        multiply: function(n){
            this.multiplier = typeof n === 'function'? n.apply(this) : n;            
        }

    });


    // Twain.
    // this basically holds a collection of tweeners for easy usage. 
    // check out examples on how to use.

    function Twain(obj) {
        if(!(this instanceof Twain)) return new Twain(obj);

        extend(this, {
            config: obj || {},
            tweens: {}
        });

        this.encode = this.config.encode || identity;
        this.decode = this.config.decode || identity;

        // reset the config encode/decode functions. we don't want it to propogate through
        // ... or do we?        
        this.config.encode = this.config.decode = identity;

    }

    extend(Twain.prototype, {
        // convenience to get a tween for a prop, and generate if required.
        // send T == true to generate a nested twain instead
        $t: function(prop, T) {
            return(this.tweens[prop] || (this.tweens[prop] = (T ? Twain : Tween)(this.config)));
        },

        from: function(_from) {
            var from = this.encode(_from);
            each(from, function(val, prop) {
                this.$t(prop, typeof val === 'object').from(val);
            }, this);
            return this;
        },

        to: function(_to) {
            var to = this.encode(_to);
            each(to, function(val, prop) {
                this.$t(prop, typeof val === 'object').to(val);
            }, this);
            return this;
        },

        step: function() {
            var val = this.value = collect(this.tweens, function(tween) {
                return tween.step().value;
            });
            this._update(val);
            return this;
        },
        decoded: function(){
            return this.decode(this.value);
        },

        multiply: function(n){
            each(this.tweens, function(t){
                t.multiply(n);
            });
        },

        _update: function() {
            // blank
        },

        update: function(fn) {
            if(!fn) return this.step();
            this._update = fn;
            return this;
        },
        stop: function() {
            each(this.tweens, function(tween) {
                tween.stop();
            });
            return this;
        }
    });

    // export some pieces 
    Twain.Tween = Tween;

    Twain.util = {
        isValue: isValue,
        extend: extend,
        each: each,
        collect: collect
    };

    return Twain;

});
});
require.register("threepointone-claw/index.js", function(exports, require, module){
(function(name, context, definition) {
    if(typeof module != 'undefined' && module.exports) module.exports = definition();
    else if(typeof define == 'function' && define.amd) define(definition);
    else context[name] = definition();
})('claw', this, function() {

    var nativeForEach = [].forEach,
        slice = [].slice,
        has = {}.hasOwnProperty;


    function each(obj, iterator, context) {
        if(obj == null) return;
        if(nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if(obj.length === +obj.length) {
            for(var i = 0, l = obj.length; i < l; i++) {
                if(iterator.call(context, obj[i], i, obj) === {}) return;
            }
        } else {
            for(var key in obj) {
                if(has.call(obj, key)) {
                    if(iterator.call(context, obj[key], key, obj) === {}) return;
                }
            }
        }
    }


    var isArray = Array.isArray ||
    function(obj) {
        return toString.call(obj) == '[object Array]';
    };


    function extend(obj) {
        each(Array.prototype.slice.call(arguments, 1), function(source) {
            each(source, function(val, prop){
                obj[prop] = val;
            });
        });
        return obj;
    }


    var transform = (function() {
        var styles = document.createElement('a').style,
            props = ['WebkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'],
            i;
        for(i = 0; i < props.length; i++) {
            if(props[i] in styles) return props[i];
        }
    })();

    function formatTransform(v) {
        var str = '';
        each(v, function(val, prop) {
            str += (prop + '(' + val + ') '); // arrays should get normalized with commas
        });
        return str;
    }

    function claw(el, vals) {
        var t = this;
        el.__claw__ = el.__claw__ || {};
        el.__clawprev__ = el.__clawprev__ || '';

        extend(el.__claw__, vals);
        var str = formatTransform(el.__claw__);

        if(el.__clawprev__ !== str){
            el.style[transform] = str;
            el.__clawprev__ = str
                
        }

        // return a curried function for further chaining
        return function(v) {
            return claw.call(t, el, v);
        }

    }
    // export some helpers
    claw.transform = transform;
    claw.formatTransform = formatTransform;
    return claw;
});
});
require.register("threepointone-beam/beam.js", function(exports, require, module){
(function(name, context, definition) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition();
    else if (typeof define == 'function' && define.amd) define(definition);
    else context[name] = definition();
})('beam', this, function() {

    // first get your modules
    var req = typeof require === 'function';
    var claw = req ? require('claw') : claw,
        Twain = req ? require('twain') : Twain,
        // import some useful functions
        each = Twain.util.each,
        isValue = Twain.util.isValue,
        // some globals 
        doc = document,
        unitless = {
            lineHeight: 1,
            zoom: 1,
            zIndex: 1,
            opacity: 1,
            transform: 1
        };

    // which property name does this browser use for transform
    var transform = function() {
        var styles = doc.createElement('a').style,
            props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'],
            i;
        for (i = 0; i < props.length; i++) {
            if (props[i] in styles) return props[i];
        }
    }();

    // a whole bunch of usefule functions

        function camelize(s) {
            return s.replace(/-(.)/g, function(m, m1) {
                return m1.toUpperCase();
            });
        }

        function uppercase(p, a) {
            return a.toUpperCase();
        }


        function vendor(property) {
            // return the vendor prefix for a given property. should even work with firefox fudging -webkit.
            var div = doc.createElement('div');
            var x = 'Khtml Moz Webkit O ms '.split(' '),
                i;
            for (i = x.length - 1; i >= 0; i--) {
                if (((x[i] ? x[i] + '-' : '') + property).replace(/\-(\w)/g, uppercase) in div.style) {
                    return x[i] ? '-' + x[i].toLowerCase() + '-' : ''; // empty string, if it works without prefix
                }
            }
            return null; // not found...
        }

        function unit(style, def) {
            // extracts the unit part of the string. px, em, whatever. 
            return (/(%|in|cm|mm|em|ex|pt|pc|px|deg)+/.exec(style) || [def])[0];
        }

        function num(style) {
            // extracts the number part of the style
            return parseFloat(style, 10);
        }

        // initial style is determined by the elements themselves
    var getStyle = doc.defaultView && doc.defaultView.getComputedStyle ? function(el, property) {
            property = property == 'transform' ? transform : property
            var value = null,
                computed = doc.defaultView.getComputedStyle(el, '');
            computed && (value = computed[camelize(property)]);
            return el.style[property] || value;
        } : html.currentStyle ?

        function(el, property) {
            property = camelize(property);

            if (property == 'opacity') {
                var val = 100;
                try {
                    val = el.filters['DXImageTransform.Microsoft.Alpha'].opacity;
                } catch (e1) {
                    try {
                        val = el.filters('alpha').opacity;
                    } catch (e2) {}
                }
                return val / 100;
            }
            var value = el.currentStyle ? el.currentStyle[property] : null
            return el.style[property] || value;
        } : function(el, property) {
            return el.style[camelize(property)];
        };

    function setStyle(el, prop, val) {
        // "special" setStyle
        // fyi: typeof val === 'number', or and rgb hash
        var b = el.__beam__;
        var prev = b.prev;

        if (typeof prop !== 'string') {
            each(prop, function(v, p) {
                setStyle(el, p, v);
            });
            return;
        }

        prop = camelize(prop);
        // ok, so this the weird part 
        // because we're getting a number, we need to add unit to it 
        // we get that directly from the __beam__ stored on the element
        // fuck me, right?
        // for perf, store a prev value on the __beam__. makes this infinitely more usable for multiple ui elements

        // first check if it's an rgb triplet
        if (val.r) {

            var color = rgb(val.r, val.g, val.b);
            if (color !== prev[prop]) {
                el.style[prop] = rgb(val.r, val.g, val.b);
                prev[prop] = color;

            }

            return;
        }


        if (prev[prop] !== val) {

            // the following line is easily the most expensive line in the entire lib. 
            // and that's why kids, you never make a css animation engine
            if (prop === 'zIndex') {
                val = Math.ceil(val);
            } // gah.
            el.style[prop] = val + (unitless[prop] ? '' : b.$t(prop).unit);
            prev[prop] = val;
        }

    }

    // convert rgb and short hex to long hex

    function toHex(c) {
        var m = c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        // short skirt to long jacket
        return (m ? rgb(m[1], m[2], m[3]) : c).replace(/#(\w)(\w)(\w)$/, '#$1$1$2$2$3$3');
    }

    function encodeColor(hex) {
        // get an rgb triad from a hex/rgb() val
        hex = toHex(hex);
        return {
            r: 16 * parseInt(hex.charAt(1), 16) + parseInt(hex.charAt(2), 16),
            g: 16 * parseInt(hex.charAt(3), 16) + parseInt(hex.charAt(4), 16),
            b: 16 * parseInt(hex.charAt(5), 16) + parseInt(hex.charAt(5), 16)
        };
    }

    var rgbOhex = /^rgb\(|#/;

    function rgb(r, g, b) {
        return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)
    }

    function encode(input) {
        // this will be our twain's encode function, responsible for converting strings and what not into numbers before being processed
        var o = {};
        each(input, function(val, prop) {
            // first convert the label to a vendor prefixed, camelized version
            prop = camelize(vendor(prop) || '' + prop);
            if (typeof val === 'string') {
                // if it's a color, then make the rgb triad
                if (rgbOhex.test(val)) {
                    o[prop] = encodeColor(val);
                    return;
                }
                o[prop] = num(val);
                // return;
            } else {
                o[prop] = val;
            }

        });
        return o;
    }

    // maintain of all "tractor beams".
    var instances = [];

    // set up a twain on an element, with update fns


    function track(el) {
        // lemme know when proper object hashes become mainstream. 
        // until then, carry on young man
        if (el.__beam__) {
            return el.__beam__;
        }

        var twain = Twain({
            encode: encode
        }).update(function(step) {
            setStyle(el, step);
        });

        twain.prev = {}; // keep a place to cache previous step
        // run a separate one for transforms
        var transformer = twain.transformer = Twain().update(function(step) {
            // get back units
            var o = {};
            each(step, function(val, prop) {
                o[prop] = val + (unitless[prop] ? '' : transformer.$t(prop).unit);
            });

            // todo - optimize the cond. 
            if (claw.formatTransform(o) !== transformer.prev) {
                claw(el, o);
                transformer.prev = claw.formatTransform(o);
            }

        });

        transformer.prev = ''; // keep a place to cache previous step
        instances.push(twain);

        el.__beam__ = twain;
        return twain;
    }


    function beam(el, to) {
        // let's haul it in. , scotty. 
        var tracker = track(el);
        var o = {};
        each(to, function(val, prop) {
            prop = camelize(vendor(prop) + prop);
            if (prop === claw.transform) {
                each(val, function(v, p) {
                    var tween = tracker.transformer.$t(p).to(num(v));
                    tween.unit = unit(v, '') || tween.unit || '';
                });
                return;
            }

            if (!tracker.tweens[prop]) {
                var currentStyle = getStyle(el, prop) || '';
                if (rgbOhex.test(currentStyle)) {
                    var tween = tracker.$t(prop, true).from(encodeColor(currentStyle));
                } else {
                    var numerical = num(currentStyle);
                    // this inits the specific Tween
                    var tween = tracker.$t(prop).from(isValue(numerical) ? numerical : num(val));
                    tween.unit = unit(currentStyle, '');
                }
            }
            var tween = tracker.$t(prop);
            if (typeof val === 'string' && !rgbOhex.test(val) && unit(val, '') !== tween.unit) {
                tween.unit = unit(val, '');
                tween.from(num(val));
            }
            tracker.$t(prop).to(rgbOhex.test(val) ? encodeColor(val) : num(val));
        });

        // return a curried version of self. awesome-o. 
        return function(d) {
            return beam(el, d);
        };
    }


    // start off animation loop. 
    // todo - start/stop
    // requestAnimationFrame stuff.
    var raf = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || fallback;

    var prev = new Date().getTime();

    function fallback(fn) {
        var curr = new Date().getTime();
        var ms = Math.max(0, 16 - (curr - prev));
        setTimeout(fn, ms);
        prev = curr;
    }

    function animate() {

        // use a quick for loop
        for (var i = 0, j = instances.length; i < j; i++) {
            instances[i].update().transformer.update();
        }
        raf(animate);
    }

    animate();

    // some more exports
    beam.instances = instances;
    beam.encode = encode;
    beam.Twain = Twain;
    beam.claw = claw;
    beam.getStyle = getStyle;
    beam.raf = raf;

    return beam;
});
});
require.register("manuelstofer-each/index.js", function(exports, require, module){
"use strict";

var nativeForEach = [].forEach;

// Underscore's each function
module.exports = function (obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, l = obj.length; i < l; i++) {
            if (iterator.call(context, obj[i], i, obj) === {}) return;
        }
    } else {
        for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                if (iterator.call(context, obj[key], key, obj) === {}) return;
            }
        }
    }
};

});
require.register("yields-isarray/index.js", function(exports, require, module){

/**
 * isArray
 */

var isArray = Array.isArray;

/**
 * toString
 */

var str = Object.prototype.toString;

/**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */

module.exports = isArray || function (val) {
  return !! val && '[object Array]' == str.call(val);
};

});
require.register("iso-gol/index.js", function(exports, require, module){
var extend = require('extend'),
    beam = require('beam'),
    each = require('each'),
    isArray = require('isArray');

function filter(arr, fn) {
    var result = [];
    each(arr, function(el, i) {
        if (fn(el)) {
            result.push(el);
        }
    });
    return result;
}

function without(arr, el) {
    return filter(arr, function(e) {
        return e !== el;
    });
}

module.exports = Stage;

function Stage(el, options) {
    if (!(this instanceof Stage)) return new Stage(el, options);

    this.el = el || document.body;
    this.options = options = extend({
        offset: {
            top: 100,
            left: 100
        },
        height: 30,
        width: 50
    }, options || {});

    this.gol = require('game-of-life')({
        height: this.options.height,
        width: this.options.width
    });
    this.grid = require('iso-grid')(this.el, {
        offset: this.options.offset
    });

}

extend(Stage.prototype, {
    cubify: function(x, y) {
        var grid = this.grid;

        var cube = grid.cube({
            x: x,
            y: y,
            z: -1 + Math.round(Math.random() * 2)
        });
        grid.add(cube);
        grid.move(cube, {
            z: 0
        });
        return cube;

    },
    ephemerize: function(faces) {
        var grid = this.grid;
        var gol = this.gol;

        if (!isArray(faces)) {
            faces = [faces]
        }
        each(faces, function(f) {
            grid.move(f, {
                z: -1 + Math.round(Math.random() * 2)
            });

            beam(f, {
                opacity: 0
            });

            setTimeout(function() {
                beam.instances.splice(beam.instances.indexOf(f.__beam__), 1);
                delete f.__claw__;
                delete f.__clawprev__;
                delete f.__beam__;

                if (f.parentNode) {
                    f.parentNode.removeChild(f);
                }
            }, 3000);

            grid.faces = without(grid.faces, f);

        });

    },
    step: function() {
        var t = this;
        var grid = this.grid;
        var gol = this.gol;

        if (!this.init) {
            each(gol.unchanged, function(pos) {
                t.cubify(pos.x, pos.y);
            });
            this.init = true;
        }

        var pool = [];

        each(gol.removed, function(pos) {
            var faces = filter(grid.faces, function(f) {
                return f.getAttribute('x:y:z') === [pos.x, pos.y, 0].join(':')
            });
            pool = pool.concat(faces);
        });

        each(gol.added, function(pos) {
            if (pool.length > 0) {
                var faces = grid.closest(pos.x, pos.y, pool);
                each(['front', 'left', 'top'], function(o, i) {
                    var f = faces[faces.length - 1 - i];
                    grid.move(f, {
                        x: pos.x,
                        y: pos.y,
                        dir: o
                    });
                    pool = without(pool, f);
                });
            } else {
                t.cubify(pos.x, pos.y);
            }
        });

        this.ephemerize(pool);

        gol.step();

    }
});
});
require.alias("threepointone-iso-grid/index.js", "iso-gol/deps/iso-grid/index.js");
require.alias("threepointone-beam/beam.js", "threepointone-iso-grid/deps/beam/beam.js");
require.alias("threepointone-beam/beam.js", "threepointone-iso-grid/deps/beam/index.js");
require.alias("threepointone-twain/lib/twain.js", "threepointone-beam/deps/twain/lib/twain.js");
require.alias("threepointone-twain/lib/twain.js", "threepointone-beam/deps/twain/index.js");

require.alias("threepointone-claw/index.js", "threepointone-beam/deps/claw/index.js");

require.alias("manuelstofer-each/index.js", "threepointone-iso-grid/deps/each/index.js");

require.alias("segmentio-extend/index.js", "threepointone-iso-grid/deps/extend/index.js");

require.alias("threepointone-iso/index.js", "threepointone-iso-grid/deps/iso/index.js");

require.alias("threepointone-times/index.js", "threepointone-iso-grid/deps/times/index.js");

require.alias("threepointone-flatten/index.js", "threepointone-iso-grid/deps/flatten/index.js");
require.alias("yields-isarray/index.js", "threepointone-flatten/deps/isArray/index.js");

require.alias("manuelstofer-each/index.js", "threepointone-flatten/deps/each/index.js");

require.alias("yields-isarray/index.js", "threepointone-iso-grid/deps/isArray/index.js");

require.alias("threepointone-game-of-life/index.js", "iso-gol/deps/game-of-life/index.js");

require.alias("segmentio-extend/index.js", "iso-gol/deps/extend/index.js");

require.alias("threepointone-beam/beam.js", "iso-gol/deps/beam/beam.js");
require.alias("threepointone-beam/beam.js", "iso-gol/deps/beam/index.js");
require.alias("threepointone-twain/lib/twain.js", "threepointone-beam/deps/twain/lib/twain.js");
require.alias("threepointone-twain/lib/twain.js", "threepointone-beam/deps/twain/index.js");

require.alias("threepointone-claw/index.js", "threepointone-beam/deps/claw/index.js");

require.alias("manuelstofer-each/index.js", "iso-gol/deps/each/index.js");

require.alias("yields-isarray/index.js", "iso-gol/deps/isArray/index.js");

