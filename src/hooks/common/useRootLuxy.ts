import { LUXY_OPTIONS } from '@/constant/luxy';
import { useEffect } from 'react';

export default function useRootLuxy() {
  useEffect(() => {
    const luxy = document.getElementById('luxy');
    if (!luxy) return;

    import('luxy.js').then((res) => {
      if (!res.default) return;

      window.luxy = res.default;
      window.luxy.getWrapperTranslateY = function () {
        if (!this.wrapper) return;
        try {
          const { transform } = this.wrapper.style;
          const y = transform?.match(/^translate3d\([^,]+,\s*([\d-]+)[^,]*,\s*[^,]+\)$/)?.[1] || '';
          return -y || 0;
        } catch (error) {
          return 0;
        }
      };
      window.luxy.disable = function () {
        const { resizeId, scrollId } = this;
        cancelAnimationFrame(resizeId);
        cancelAnimationFrame(scrollId);
        this.disabled = true;
      };
      window.luxy.enable = function () {
        this.wapperOffset = this.getWrapperTranslateY();
        try {
          this.init(LUXY_OPTIONS);
        } catch (error) {
          console.log(error);
        }
        this.disabled = false;
      };
      window.luxy.disable();

      try {
        res.default.init(LUXY_OPTIONS);
      } catch (error) {
        console.log(error);
      }
    });
  });
}