let hasRun = false;

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (ctx) {
  if (hasRun) return;

  hasRun = true;
  const dat = await import('dat.gui');
  var w = window.innerWidth,
    h = window.innerHeight,
    opts = {
      starCount: 10,

      radVel: 0.01,
      lineBaseVel: 0.1,
      lineAddedVel: 0.1,
      lineBaseLife: 0.4,
      lineAddedLife: 0.01,

      starBaseLife: 10,
      starAddedLife: 10,

      ellipseTilt: -0.3,
      ellipseBaseRadius: 0.15,
      ellipseAddedRadius: 0.02,
      ellipseAxisMultiplierX: 2,
      ellipseAxisMultiplierY: 1,
      ellipseCX: w / 2,
      ellipseCY: h / 2,

      repaintAlpha: 0.015,
    },
    gui = new dat.GUI({ autoPlace: false }),
    stars = [],
    tick = 0,
    first = true;

  window.star_init = function () {
    stars.length = 0;

    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    if (first) {
      var f = gui.addFolder("logics");
      f.add(opts, "starCount", 1, 10);
      f.add(opts, "radVel", 0, 1);
      f.add(opts, "lineBaseVel", 0.01, 1);
      f.add(opts, "lineAddedVel", 0, 1);
      f.add(opts, "lineBaseLife", 0, 1);
      f.add(opts, "lineAddedLife", 0, 1);
      f.add(opts, "starBaseLife", 0, 100);
      f.add(opts, "starAddedLife", 0, 100);
      f = gui.addFolder("graphics");
      f.add(opts, "ellipseTilt", -Math.PI, Math.PI).step(0.1);
      f.add(opts, "ellipseBaseRadius", 0, 0.5);
      f.add(opts, "ellipseAddedRadius", 0, 0.5);
      f.add(opts, "ellipseAxisMultiplierX", 0, 3);
      f.add(opts, "ellipseAxisMultiplierY", 0, 3);
      f.add(opts, "ellipseCX", 0, w);
      f.add(opts, "ellipseCY", 0, h);
      f.add(opts, "repaintAlpha", 0, 1);
      gui.add(window, "star_init").name("reset animation");
      gui.add(window, "star_LuukLamers");

      loop();
      first = false;
    }
  };

  function loop() {
    window.requestAnimationFrame(loop);
    step();
    draw();
  }

  function step() {
    tick += 0.5;

    if (stars.length < opts.starCount) stars.push(new Star());

    stars.map(function (star) {
      star.step();
    });
  }

  function draw() {
    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "rgba(0,0,0,alp)".replace("alp", opts.repaintAlpha);
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = "lighter";

    ctx.translate(opts.ellipseCX, opts.ellipseCY);
    ctx.rotate(opts.ellipseTilt);
    ctx.scale(opts.ellipseAxisMultiplierX, opts.ellipseAxisMultiplierY);

    ctx.scale(1 / opts.ellipseAxisMultiplierX, 1 / opts.ellipseAxisMultiplierY);
    ctx.rotate(-opts.ellipseTilt);
    ctx.translate(-opts.ellipseCX, -opts.ellipseCY);

    stars.map(function (star) {
      star.draw();
    });
  }

  function Star() {
    this.reset();
  }
  Star.prototype.reset = function () {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.life = opts.starBaseLife + Math.random() * opts.starAddedLife;
  };
  Star.prototype.step = function () {
    --this.life;

    if (this.life <= 0) this.reset();
  };
  Star.prototype.draw = function () {
    ctx.fillStyle = ctx.shadowColor = "rgba(255, 255, 255, .2)";
    // .replace(
    //   "hue",
    //   tick + (this.x / w) * 100
    // );
    ctx.shadowBlur = this.life;
    ctx.fillRect(this.x, this.y, 1, 1);
  };

  window.addEventListener("resize", function () {
    w = c.width = window.innerWidth;
    h = c.height = window.innerHeight;

    opts.ellipseCX = w / 2;
    opts.ellipseCY = h / 2;

    window.star_init();
  });

  window.star_LuukLamers = function () {
    var i = 0,
      array = [
        300,
        74,
        0.04,
        0.1,
        0.1,
        0.55,
        10,
        100,
        10,
        -0.15,
        0.18,
        0.01,
        3,
        1,
        w / 2,
        h / 2,
        0.02,
      ];

    for (var key in opts) {
      opts[key] = array[i];
      ++i;
    }

    window.star_init();
  };

  window.star_init();
}
