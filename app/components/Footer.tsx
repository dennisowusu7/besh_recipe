import { IconType } from "react-icons";
import Logo from "./Logo";
import { FaInstagram, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";

const links = [FaInstagram, FaGithub, FaLinkedin, FaTwitter];
const IconContainer = (props:{icon:IconType}) =>{
  return <props.icon size={25} className="cursor-pointer" />
};

const Footer = () => {
  return (
    <section className="bg-slate-900 w-full h-full">
      <hr className="p-3" />
      <div className="flex flex-col p-20 w-xs:gap-8 md:gap-6">
        <div className="flex md:flex-row w-xs:flex-col md:justify-between w-xs: justify-start items-center">
          <div>
            <Logo />
          </div>
          <div className="flex p-2 gap-6">
            {links.map((item) => (
              <IconContainer icon={item} key={item.toString()}/>
            ))}
          </div>
        </div>
        <div>
          <p className="md:text-xl w-xs:text-md font-semibold text-start w-xs:text-center">
            <span>&copy; </span>
            <span>{new Date().getFullYear()}</span>
            <span className="font-bold"> Beshman</span>
          </p>
        </div>
      </div>
    </section>
  )
};

export default Footer;