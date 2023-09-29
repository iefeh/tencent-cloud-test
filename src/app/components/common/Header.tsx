import React from 'react';
import Image from 'next/image';
import Link from "next/link";
import BasicButton from "./BasicButton";
import logo from "img/header/logo.png";
import Discord from "img/header/discord.svg";
import Youtube from "img/header/Youtube.svg";
import Github from "img/header/github.svg";
import Medium from "img/header/medium.svg";
import Telegram from "img/header/telegram.svg";
import X from "img/header/x.svg";

const routeText = ['Home', 'About', 'NFT', 'AstrArk', 'Loyalty Program', 'Maketplace'];
const mediaIcon = [X, Discord, Telegram, Medium, Youtube, Github];

export default function Header() {

    return (
        <section className="header absolute left-0 top-0 w-full h-11 flex justify-between items-center z-10 mt-2 pl-4 pr-4">
            <div className="" >
                <Image className='w-20 h-11' src={logo} alt="Picture of the author" />
            </div>
            <div className='font-semakin transition-all'>
                {routeText.map((value, index) => (
                    <Link className='m-2 hover:border-b-2 border-[#F6C799] hover:text-[#F6C799]' key={index} href={`/${value}`} >
                        {value}
                    </Link>
                ))}
            </div>

            <div className='flex items-center' >
                {mediaIcon.map((icon, index) => {
                    const Component = icon
                    return (
                        <Component key={index} className='hover:fill-[#F6C799] hover:cursor-pointer fill-[rgba(255,255,255,.3)] transition-all w-5 h-5 mr-4' />
                    )
                })}
                <BasicButton label='login' />
            </div>
        </section>
    )
}