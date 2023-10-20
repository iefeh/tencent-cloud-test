export function generateStarAni(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const MAX_QUAN = 50; //Star quantity
  const MAX_SIZE = 1.5; //max size of stars
  const MIN_SIZE = 0.5; //min size of stars
  const MAX_BLUR = MAX_SIZE * 10; //max brightness of stars
  const MIN_BLUR = 0.1; //min brightness of stars
  const OPC_STAR = 1; //opacity of stars
  const RGB_COLR = [255, 255, 255]; //default color
  const OPC_STEP = 0.005; // delta opacity of stars changed per frame

  class Star {
    x: number;
    y: number;
    size: number;
    blur: number;
    opac: number;
    color: number[];
    ctx: CanvasRenderingContext2D;
    invert: number;

    constructor() {
      this.ctx = ctx;
      this.x = width * Math.random();
      this.y = height * Math.random();
      this.size = Math.round(Math.random() * (MAX_SIZE - MIN_SIZE) + MIN_SIZE);
      this.blur = Math.random() * (MAX_BLUR - MIN_BLUR) + MIN_BLUR;
      this.opac = Math.random() * OPC_STAR;
      this.color = RGB_COLR;
      this.invert = Math.random() > 0.5 ? 1 : -1;
    }

    calcOpac() {
      this.opac += this.invert * OPC_STEP;

      if (this.opac < 0) {
        this.opac = 0;
        this.invert *= -1;
      } else if (this.opac > OPC_STAR) {
        this.opac = OPC_STAR;
        this.invert *= -1;
      }
    }

    drawStar() {
      this.calcOpac();

      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      this.ctx.fillStyle = 'rgba(' + this.color[0] + ',' + this.color[1] + ',' + this.color[2] + ',' + this.opac + ')';
      this.ctx.shadowColor =
        'rgba(' + this.color[0] + ',' + this.color[1] + ',' + this.color[2] + ',' + this.opac + ')';
      this.ctx.shadowBlur = this.blur;
      this.ctx.fill();
    }
  }

  let arrSpace: Star[] = [];
  let isEnd = false;
  let raf = 0;

  function drawStar() {
    if (isEnd) return;

    ctx.beginPath();
    ctx.clearRect(0, 0, width, height);

    arrSpace.forEach(star => star.drawStar());

    raf = requestAnimationFrame(drawStar);
  }

  function arrFill() {
    arrSpace = Array(MAX_QUAN).fill(null).map(() => new Star());
  }

  function init() {
    arrFill();
    drawStar();
  }

  function stop() {
    isEnd = true;
    if (raf > 0) cancelAnimationFrame(raf);
  }

  return { init, stop };
}
