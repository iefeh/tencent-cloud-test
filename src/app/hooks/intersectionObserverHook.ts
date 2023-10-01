import { MutableRefObject, useEffect, useState } from "react";

interface Props {
    currentRef: MutableRefObject<null>;
    options?: IntersectionObserverInit;
}

export function IntersectionObserverHook({ currentRef, options = {} }: Props) {
    const [isVisiable, setIsVisiable] = useState(false);
    options = {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
        ...options
    }

    const callbackFunction = (entries: any) => {
        const [entry] = entries;

        setIsVisiable(entry.isIntersecting)
    }

    useEffect(() => {
        const observer = new IntersectionObserver(callbackFunction, options);
        if (currentRef.current) observer.observe(currentRef.current)

        return () => {
            if (currentRef.current) observer.unobserve(currentRef.current)
        }
    }, [currentRef, options])

    return isVisiable;
}
