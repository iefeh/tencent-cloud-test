import React from 'react';
import borderToplr from "img/border_toplr.png";
import borderBottomrl from "img/border_bottomrl.png";
import borderLeft from "img/border_left.png";
import borderBottom from "img/border_bottom.png";
import './index.scss'

export default function LineBorder() {

    return (
        <div className='absolute w-full h-full' >
            <div className='absolute left-5 top-20 bg-line-tlf bg-size-100 h-28 w-1' ></div>
        </div>
    )
}