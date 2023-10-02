let hasRun = false;

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (ctx) {
  if (hasRun) return;

  hasRun = true;
  var w = window.innerWidth / 2,
    h = window.innerHeight / 2,
    opts = {
      starCount: 30,

      radVel: 0.01,
      lineBaseVel: 0.1,
      lineAddedVel: 0.1,
      lineBaseLife: 0.4,
      lineAddedLife: 0.01,

      starBaseLife: 10,
      starAddedLife: 90,

      ellipseTilt: -0.3,
      ellipseBaseRadius: 0.15,
      ellipseAddedRadius: 0.02,
      ellipseAxisMultiplierX: 2,
      ellipseAxisMultiplierY: 1,
      ellipseCX: w / 2,
      ellipseCY: h / 2,

      repaintAlpha: 0.015,
    },
    stars = [],
    first = true;

  window.star_init = function () {
    stars = Array(opts.starCount).fill(undefined).map(_ => new Star());

    if (first) {
      loop();
      first = false;
    }
  };

  function loop() {
    step();
    draw();
    window.requestAnimationFrame(loop);
  }

  function step() {
    stars.map(function (star) {
      star.step();
    });
  }

  function draw() {
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
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.lifeStep = Math.random() > 0.5 ? 1 : -1;
    this.life = opts.starBaseLife + Math.random() * opts.starAddedLife;
  }
  Star.prototype.step = function () {
    this.life += this.lifeStep;

    if (this.life <= 0 || this.life >= 100) {
      this.lifeStep *= -1;
    }
  };
  Star.prototype.draw = function () {
    if (this.lifeStep < 0) {
      ctx.globalCompositeOperation = "darken";
  
      ctx.fillStyle = ctx.shadowColor = `rgba(0, 0, 0, .1)`;
    } else {
      ctx.globalCompositeOperation = "lighten";
  
      ctx.fillStyle = ctx.shadowColor = `rgba(255, 255, 255, .1)`;
    }
    ctx.shadowBlur = this.life;
    ctx.fillRect(this.x, this.y, 0.5, 0.5);
  };

  window.addEventListener("resize", function () {
    w = window.innerWidth / 2;
    h = window.innerHeight / 2;

    opts.ellipseCX = w / 2;
    opts.ellipseCY = h / 2;

    window.star_init();
  });

  window.star_init();
}
