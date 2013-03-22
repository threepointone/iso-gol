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