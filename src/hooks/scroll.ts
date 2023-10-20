import { MutableRefObject } from "react";
import { SwiperClass } from "swiper/react";

export interface scrollRef {lastTime: number, scrollSpeed: number, cancelId: number, lastScroll: number}

export function scrollStart(event: WheelEvent, ref: MutableRefObject<scrollRef>, swiper: SwiperClass) {
    const { lastTime } = ref.current
    // 获取当前时间
    const currentTime = new Date().getTime();

    // 计算时间差
    const timeDiff = currentTime - lastTime;

    // 计算滚动速度
    if (timeDiff < 200) {
        ref.current.scrollSpeed += event.deltaY * 0.05;
    } else {
        ref.current.scrollSpeed = event.deltaY * 0.05;
    }

    // 更新最后滚动时间
    ref.current.lastTime = currentTime;

    // 开始滚动动画
    ref.current.cancelId = requestAnimationFrame(() => scroll(ref, swiper));
}

export function scroll(ref: MutableRefObject<scrollRef>, swiper: SwiperClass) {
    const { scrollSpeed, lastScroll } = ref.current;
    let newScrollTop = lastScroll - scrollSpeed;

    // 滚动页面
    if (newScrollTop >= 0) { newScrollTop = 0; }
    if (newScrollTop <= -swiper.snapGrid[swiper.snapGrid.length - 1]) { newScrollTop = -swiper.snapGrid[swiper.snapGrid.length - 1]; }
    swiper?.setTranslate(newScrollTop);

    // 减小滚动速度，模拟惯性效果
    ref.current.scrollSpeed *= 0.95;

    ref.current.lastScroll = newScrollTop;

    // 如果滚动速度足够小，就停止动画
    if (Math.abs(scrollSpeed) > 0.05) {
        ref.current.cancelId = requestAnimationFrame(() => scroll(ref, swiper));
    }
}