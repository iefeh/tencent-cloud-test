import Image from 'next/image'
import logo from "../../../public/Header/logo.png";

export default function Header() {
    return (
        <section className="header absolute left-0 top-0 w-full h-12 flex">
            <div className="" >
                <Image className='w-14' src={logo} alt="Picture of the author" />
            </div>
            <div>text</div>
            <div>right</div>
        </section>
    )
}