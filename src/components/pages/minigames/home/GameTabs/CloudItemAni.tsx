import { CSSProperties, useRef, FC } from "react"
import { cn } from "@nextui-org/react";
import styles from './index.module.scss'
import S3Image from '@/components/common/medias/S3Image';

export type CloudItemPosition = 'lt' | 'lb' | 'rt' | 'rb'
interface CloudItemProps {
  item: { url: string, classNames: string, style?: CSSProperties, position: CloudItemPosition },
  inAni: boolean | null,
}

const CloudItemComp: FC<CloudItemProps> = (props) => {
  const { item, inAni } = props || {}
  const { url, classNames } = item || {}

  const calcStyleVar = () => {
    const { position } = item || {}

    switch (position) {
      case 'lt':
        return { '--translate-x': '-100%', '--translate-y': '-100%' } as CSSProperties

      case 'lb':
        return { '--translate-x': '-100%', '--translate-y': '100%' } as CSSProperties

      case 'rt':
        return {}

      case 'rb':
        return { '--translate-x': '100%', '--translate-y': '100%' } as CSSProperties

      default:
        break;
    }
  }

  return (
    <S3Image
      src={url}
      style={{
        ...calcStyleVar(),
        '--duration-time': '2s'
      } as CSSProperties}
      className={
        cn([
          'absolute',
          'pointer-events-none',
          'z-10',
          inAni === null
            ? ''
            : inAni
              ? styles["ani-out"]
              : styles["ani-in"],
          classNames,
        ])} />
  )
}


export default CloudItemComp