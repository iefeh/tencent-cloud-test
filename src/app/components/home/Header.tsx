'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from "next/link";
import BasicButton from "@/app/components/common/BasicButton";
import logo from "img/header/logo.png";
import Discord from "img/header/discord.svg";
import Youtube from "img/header/Youtube.svg";
import Medium from "img/header/medium.svg";
import Telegram from "img/header/telegram.svg";
import X from "img/header/x.svg";
import LoginDialog from '../common/LoginDialog';

const routeText = ['Home', 'About', 'NFT', 'AstrArk', 'Loyalty Program', 'Maketplace'];
const mediaIcon = [X, Discord, Telegram, Medium, Youtube];

export default function Header() {
    const [loginVisible, setLoginVisible] = useState(false);

    return (
        <section className="header absolute left-0 top-0 w-full h-11 flex justify-between items-center z-10 mt-2 pl-4 pr-4">
            <div className="flex-[1]" >
                <Link href='/' >
                    <Image className='w-20 h-11' src={logo} alt="Picture of the author" />
                </Link>
            </div>
            <div className='font-semakin'>
                {routeText.map((value, index) => (
                    <Link className='m-2 transition-all duration-300 hover:border-b-2 border-[#F6C799] hover:text-[#F6C799]' key={index} href={`/${value}`} >
                        {value}
                    </Link>
                ))}
            </div>

            <div className='flex items-center flex-[1] justify-end' >
                {mediaIcon.map((icon, index) => {
                    const Component = icon
                    return (
                        <Component key={index} className='hover:fill-[#F6C799] hover:cursor-pointer fill-[rgba(255,255,255,.3)] transition-all w-5 h-5 mr-4' />
                    )
                })}
                <BasicButton class="text-xs px-2" label='login' onClick={() => setLoginVisible(true)} />
            </div>

            <LoginDialog visible={loginVisible} onClose={() => setLoginVisible(false)} />
        </section>
    )
}