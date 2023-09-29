import Image from 'next/image';
import Link from "next/link";
import logo from "img/header/logo.png";
import { Router } from "next/router";

const routeText = ['Home', 'About', 'NFT', 'AstrArk', 'Loyalty Program', 'Maketplace'];

export default function Header() {

    return (
        <section className="header absolute left-0 top-0 w-full h-11 flex justify-between items-center z-10 mt-2 pl-4 pr-4">
            <div className="" >
                <Image className='w-20 h-11' src={logo} alt="Picture of the author" />
            </div>
            <div className='font-Semakin'>
                {routeText.map((value, index) => (
                    <Link className='m-2' key={index} href={`/${value}`} >
                        {value}
                    </Link>
                ))}
            </div>
            <div>right</div>
        </section>
    )
}