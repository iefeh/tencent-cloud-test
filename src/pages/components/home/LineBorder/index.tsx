import React from 'react';

export default function LineBorder() {
    return (
        <div className='fixed z-40 w-full h-full opacity-20 pointer-events-none' >
            <div className='absolute left-5 top-20 bg-line-tlf bg-size-100 h-28 w-1' ></div>
            <div className='absolute left-5 bottom-5 ba-line-brl bg-size-100 h-32 w-32' ></div>
            <div className='absolute left-5 top-1/2 -translate-y-1/2 bg-repeat bg-line-lr h-[9.4rem] w-[0.6rem] bg-[length:100%_.5rem] bg-gradient-to-t from-white from-15% to-transparent to-0%' ></div>
            <div className='absolute right-5 top-20 rotate-y-180 bg-line-tlf bg-size-100 h-28 w-1' ></div>
            <div className='absolute right-5 bottom-5 rotate-y-180 ba-line-brl bg-size-100 h-32 w-32' ></div>
            <div className='absolute right-5 top-1/2 -translate-y-1/2 bg-repeat bg-line-lr h-[9.4rem] w-[0.6rem] bg-[length:100%_.5rem] bg-gradient-to-t from-white from-15% to-transparent to-0%' ></div>
            <div className='absolute bottom-5 bg-line-bottom left-1/2 -translate-x-1/2 bg-repeat w-1/2 h-[0.6rem] bg-[length:.5rem_100%] bg-gradient-to-l from-white from-15% to-transparent to-0%' ></div>
        </div>
    )
    // bg-[length:100%_.5vw] bg-gradient-to-t from-white from-15% to-transparent to-0%
}