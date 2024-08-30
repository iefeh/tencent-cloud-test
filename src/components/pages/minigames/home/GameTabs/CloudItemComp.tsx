/**
 * 云 随滚动条移动的组件 ----（暂时留存一份，防止回档）
*/
import S3Image from '@/components/common/medias/S3Image';
import { CSSProperties, useEffect, useRef, FC, useMemo } from "react"
import { cn } from "@nextui-org/react";
import { aniSpeed } from "@/pages/minigames"

export type CloudItemPosition = 'lt' | 'lb' | 'rt' | 'rb'
interface CloudItemProps {
  item: { url: string, classNames: string, style?: CSSProperties, position: CloudItemPosition },
  inAni: boolean | null,
}


const CloudItemComp: FC<CloudItemProps> = (props) => {
  const { item, inAni } = props || {}
  const { url, classNames, style = {} } = item || {}
  const itemRef = useRef<HTMLImageElement>(null)
  const countRef = useRef<number>(1)

  const step = aniSpeed / 16.6

  const getStepValue = (top: number = 1) => {
    if (!itemRef.current) return

    const totalHeight = document.body.clientHeight + top * itemRef.current?.clientHeight;
    const totalWidth = itemRef.current?.clientWidth;
    const translateY = totalHeight / step * countRef.current
    const translateX = totalWidth / step * countRef.current

    return {
      totalHeight,
      totalWidth,
      translateY,
      translateX
    }
  }

  const aniOut = () => {
    if (!itemRef.current) return

    let bottomDirection = 1;
    let topDirection = 1;
    ['lb', 'lt'].includes(item.position) && (bottomDirection = -1);
    ['lt', 'rt'].includes(item.position) && (topDirection = -1);

    let { totalHeight, totalWidth, translateY, translateX } = getStepValue(topDirection) || {}
    if (!totalHeight || !totalWidth || !translateY || !translateX) return

    const setFinalState = () => {
      translateY = totalHeight
      translateX = totalWidth
      countRef.current = Math.ceil(step)
    }

    if (translateY >= totalHeight) setFinalState()

    itemRef.current.setAttribute(
      "style", `
        transform: translate(${bottomDirection * translateX}px, ${translateY}px);
        opacity: ${1 - (1 / step) * countRef.current};
      `
    );

    if (countRef.current <= step) {
      countRef.current += 1
      requestAnimationFrame(aniOut)
    } else {
      setFinalState()
    }
  }

  const aniIn = () => {
    if (!itemRef.current) return

    let bottomDirection = 1;
    let topDirection = 1;
    ['lb', 'lt'].includes(item.position) && (bottomDirection = -1);
    ['lt', 'rt'].includes(item.position) && (topDirection = -2);

    let { totalHeight, totalWidth, translateY, translateX } = getStepValue(topDirection) || {}
    if (!totalHeight || !totalWidth || !translateY || !translateX) return

    let opacityVal = 1 - countRef.current / step

    const setFinalState = () => {
      translateX = 0
      translateY = 0
      opacityVal = 1
      countRef.current = 1
    }

    if (translateY < 0) setFinalState()

    itemRef.current.setAttribute(
      "style", `
        transform: translate(${bottomDirection * translateX}px, ${translateY}px);
        opacity: ${opacityVal};
      `
    );

    if (countRef.current > 1) {
      countRef.current -= 1

      requestAnimationFrame(aniIn)
    } else {
      setFinalState()
    }
  }

  useEffect(() => {
    if (inAni === null) return
    inAni ? aniOut() : aniIn()
  }, [inAni])

  return (
    <S3Image
      refEl={itemRef}
      src={url}
      className={cn([
        'absolute object-contain',
        'pointer-events-none',
        'z-10',
        classNames,
      ])} />
  )
}


export default CloudItemComp