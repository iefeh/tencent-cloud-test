import React from 'react';
import borderToplr from "img/border_toplr.png";
import borderBottomrl from "img/border_bottomrl.png";
import borderLeft from "img/border_left.png";
import borderBottom from "img/border_bottom.png";
import './index.scss'

export default function LineBorder() {
    return (
        <div className='absolute w-full h-full opacity-20' >
            <div className='absolute left-5 top-20 bg-line-tlf bg-size-100 h-28 w-1' ></div>
            <div className='absolute left-5 bottom-5 ba-line-brl bg-size-100 h-32 w-32' ></div>
            <div className='absolute left-5 top-1/2 -translate-y-1/2 bg-repeat bg-line-lr h-36 w-1' ></div>
            <div className='absolute right-5 top-20 rotate-y-180 bg-line-tlf bg-size-100 h-28 w-1' ></div>
            <div className='absolute right-5 bottom-5 rotate-y-180 ba-line-brl bg-size-100 h-32 w-32' ></div>
            <div className='absolute right-5 top-1/2 -translate-y-1/2 bg-repeat bg-line-lr h-36 w-1' ></div>
            <div className='absolute bottom-5 bg-line-bottom left-1/2 -translate-x-1/2 bg-repeat w-1/2 h-1' ></div>
        </div>
    )
}