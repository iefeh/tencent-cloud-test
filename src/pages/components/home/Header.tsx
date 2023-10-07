"use client";

import React, { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import BasicButton from "../common/BasicButton";
import logo from "img/header/logo.png";
import Discord from "img/header/discord.svg";
import Youtube from "img/header/Youtube.svg";
import Medium from "img/header/medium.svg";
import Telegram from "img/header/telegram.svg";
import X from "img/header/x.svg";
import List from "svg/list.svg";
import Close from "svg/close.svg";
import LoginDialog from "../common/LoginDialog";
import Sidebar from "../common/Sidebar";
import { useRouter } from "next/router";

const routeText = [
    { name: "Home", route: "/" },
    { name: "AstrArk", route: "/AstrArk" },
    { name: "NFT", route: "/NFT" },
    { name: "Loyalty Program", route: "/comingsoon" },
    { name: "About", route: "/About" },
];
const mediaIcon = [
    { img: X, link: 'https://twitter.com/Moonveil_Studio' },
    { img: Discord, link: 'https://discord.com/invite/NyECfU5XFX' },
    { img: Telegram, link: 'https://t.me/+AeiqS8o2YmswYTgx' },
    { img: Medium, link: 'https://medium.com/@Moonveil_Studio' },
    { img: Youtube, link: 'https://www.youtube.com/channel/UCFtFhgsjtdSgXarKvSYpz3A' }];

export default function Header() {
    const [loginVisible, setLoginVisible] = useState(false);
    const [listOpen, setListOpen] = useState(false);
    const router = useRouter();

    function LoginSegments() {
        let temp = router.route;
        return temp && temp !== '/' ? temp : '/home';
    }

    return (
        <section className="header absolute left-0 top-0 w-full h-11 flex justify-between items-center z-50 mt-2 pl-4 pr-4">
            <div className="flex-[1]">
                <Link href="/">
                    <Image
                        className="w-20 h-11"
                        src={logo}
                        alt="Picture of the author"
                    />
                </Link>
            </div>
            <div className="font-semakin max-sm:hidden">
                {routeText.map((value, index) => (
                    <Link
                        className={`m-2 transition-all duration-300 hover:border-b-2 border-[#F6C799] hover:text-[#F6C799] ${LoginSegments() === value.route && 'text-[#F6C799] border-[#F6C799] border-b-2'}`}
                        key={index}
                        href={value.route}
                    >
                        {value.name}
                    </Link>
                ))}
            </div>

            <div className="flex items-center flex-[1] justify-end">
                <div className="max-sm:hidden flex items-center" >
                    {mediaIcon.map((value, index) => {
                        const Component = value.img;
                        return (
                            <div key={index} onClick={() => window.open(value.link)} >
                                <Component
                                    className="hover:fill-[#F6C799] hover:cursor-pointer fill-[rgba(255,255,255,.3)] transition-all w-6 h-6 mr-4"
                                />
                            </div>
                        );
                    })}
                </div>
                <BasicButton
                    class="text-xs px-2"
                    label="login"
                    onClick={() => setLoginVisible(true)}
                />

                {listOpen ? <Close onClick={() => setListOpen(false)} className="max-sm:block max-sm:ml-2 hidden w-[2rem] h-[1.88rem]" /> : <List onClick={() => setListOpen(true)} className="max-sm:block hidden max-sm:ml-2 w-[2rem] h-[1.88rem]" /> }
            </div>
            
            
            <LoginDialog
                visible={loginVisible}
                onClose={() => setLoginVisible(false)}
            />
            <Sidebar visible={listOpen} onClose={() => setListOpen(false)} />
        </section>
    );
}
