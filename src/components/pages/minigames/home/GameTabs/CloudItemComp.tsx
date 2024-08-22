import BgImageComp from "@/components/common/BgImage"
import { CSSProperties, useEffect, useRef, FC } from "react"
import { cn } from "@nextui-org/react";

// 'lt' | 'lb' | 'rt' | 'rb'
interface CloudItemProps {
  item: { url: string, classNames: string, style?: CSSProperties, position: string },
  inAni: boolean | null
}

const totalAniTime = 1000
const step = totalAniTime / 16.6

const CloudItemComp: FC<CloudItemProps> = (props) => {
  const { item, inAni } = props || {}
  const { url, classNames, style = {} } = item || {}
  const itemRef = useRef<HTMLDivElement>(null)
  const countRef = useRef<number>(1)

  const getStepValue = () => {
    if (!itemRef.current) return

    const totalHeight = document.body.clientHeight + itemRef.current?.clientHeight - 200;
    const totalWidth = itemRef.current?.clientWidth;
    const translateY = totalWidth / step * countRef.current
    const translateX = totalHeight / step * countRef.current

    return {
      totalHeight,
      totalWidth,
      translateY,
      translateX
    }
  }

  const aniOut = () => {

    if (!itemRef.current) return

    const bottomDirection = item.position === 'lb' ? -1 : 1
    // const topDirection = item.position === 'rt' ? 1 : -1

    let { totalHeight, totalWidth, translateY, translateX } = getStepValue() || {}

    if (!totalHeight || !totalWidth || !translateY || !translateX) return

    const setFinalState = () => {
      translateY = totalHeight
      translateX = totalWidth
      countRef.current = Math.floor(step)
    }

    if (translateY >= totalHeight) setFinalState()

    itemRef.current.setAttribute(
      "style", `
        transform: translate(${bottomDirection * translateY}px, ${translateX}px);
        opacity: ${1 - (1 / step) * countRef.current};
      `
    );

    if (countRef.current <= step) {
      countRef.current += 1
      requestAnimationFrame(() => aniOut())
    } else {
      setFinalState()
    }
  }

  const aniIn = () => {
    if (!itemRef.current) return

    let { totalHeight, totalWidth, translateY, translateX } = getStepValue() || {}
    console.log("aniIn", totalHeight, totalWidth, translateY, translateX);

    if (!totalHeight || !totalWidth || !translateY || !translateX) return


    let opacityVal = step * countRef.current

    const setFinalState = () => {
      translateX = 0
      translateY = 0
      opacityVal = 1
      countRef.current = 1
    }

    const min = Math.min(translateX, translateY)
    const bottomDirection = item.position === 'lb' ? -1 : 1

    if (min <= 0) setFinalState()

    itemRef.current.setAttribute(
      "style", `
        transform: translate(${bottomDirection * translateX}px, ${translateY}px);
        opacity: ${opacityVal};
    `
    );

    if (countRef.current > 1) {
      countRef.current -= 1
      requestAnimationFrame(() => aniIn())
    } else {
      setFinalState()
    }
  }

  useEffect(() => {
    if (inAni === null) return
    inAni ? aniOut() : aniIn()
  }, [inAni])

  return (
    <BgImageComp
      refEl={itemRef}
      src={url}
      classNames={cn([
        'pointer-events-none',
        'z-10',
        classNames,
      ])} />
  )
}


export default CloudItemComp