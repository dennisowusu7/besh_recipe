"use client";
import Logo from "./Logo";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { FiLogOut, FiMenu, FiX } from "react-icons/fi";
// import { Drawer } from './Drawer';

const userLinks = [
    { id: "u-1", name: "Home", url: "/" },
    { id: "u-2", name: "Profile", url: "/profile" },
    { id: "u-3", name: "Recipes", url: "/recipes" },
    { id: "u-4", name: "Categories", url: "/categories" },
    { id: "u-5", name: "Ingredients", url: "/ingredients" },
];

const adminLinks = [
    { id: "a-1", name: "Home", url: "/" },
    { id: "a-2", name: "Profile", url: "/profile" },
    { id: "a-3", name: "Recipes", url: "/recipes" },
    { id: "a-4", name: "Categories", url: "/categories" },
    { id: "a-5", name: "Ingredients", url: "/ingredients" },
    { id: "a-6", name: "Admin", url: "/admin" },
];

const nonAuthLinks = [
    { id: "n-1", name: "Home", url: "/" },
    { id: "n-2", name: "Recipes", url: "/recipes" },
    { id: "n-3", name: "Categories", url: "/categories" },
    { id: "n-5", name: "Login", url: "/login" },
    { id: "n-6", name: "Register", url: "/register" },
];

export const NavBar = () => {
    const { data: session, status } = useSession();
    const role = (session?.user as { role?: "USER" | "ADMIN" } | undefined)?.role ?? "USER";
    const links =
        status !== "authenticated" ? nonAuthLinks : role === "ADMIN" ? adminLinks : userLinks;

    const [isScrolling, setIsScrolling] = useState(false);
    const [showHorizontalScroll, setShowHorizontalScroll] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const lastScrollY = useRef(0);
    const horizontalScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            
            // Detect scroll direction
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                // Scrolling down - hide nav links and show horizontal scroll
                setIsScrolling(true);
                setShowHorizontalScroll(true);
            } else if (currentScrollY < lastScrollY.current || currentScrollY <= 50) {
                // Scrolling up or near top - show nav links and hide horizontal scroll
                setIsScrolling(false);
                setShowHorizontalScroll(false);
            }
            
            lastScrollY.current = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <section className='sticky top-0 z-50 w-full bg-slate-900'>
            {/* Main NavBar */}
            <nav className='hidden md:flex items-center justify-between gap-6 px-8 py-4 bg-transparent'>
                <div><Logo /></div>
                <div
                    className={`flex items-center gap-4 p-2 transition-all duration-300 overflow-hidden ${
                        isScrolling ? 'max-w-0 opacity-0' : 'max-w-full opacity-100'
                    }`}
                >
                    {links.map((item) => (
                        <Link
                            key={item.id}
                            href={item.url}
                            className='dark:text-white text-gray-400 text-lg font-semibold hover:text-pink-500 transition-colors duration-300 whitespace-nowrap'
                        >
                            {item.name}
                        </Link>
                    ))}
                    {status === "authenticated" && (
                        <button
                            onClick={() => signOut()}
                            className='flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition'
                        >
                            <FiLogOut size={20} />
                            Logout
                        </button>
                    )}
                </div>
            </nav>

            {/* Horizontal Scrolling Section - Smooth appearance when scrolling down */}
            <div
                className={`hidden md:block bg-slate-800 border-t border-slate-700 transition-all duration-300 ease-out overflow-hidden ${
                    showHorizontalScroll ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div
                    ref={horizontalScrollRef}
                    className='flex gap-3 px-8 py-3 overflow-x-auto scrollbar-thin scrollbar-thumb-violet-600 scrollbar-track-slate-800'
                >
                    {links.map((item) => (
                        <Link
                            key={item.id}
                            href={item.url}
                            className='flex-shrink-0 text-sm text-gray-300 hover:text-pink-400 transition-colors duration-300 font-medium whitespace-nowrap px-3 py-1 rounded hover:bg-slate-700'
                        >
                            {item.name}
                        </Link>
                    ))}
                    {status === "authenticated" && (
                        <button
                            onClick={() => signOut()}
                            className='flex cursor-pointer items-center gap-2 px-4 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition'
                        >
                            <FiLogOut size={20} />
                            Logout
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile NavBar with Hamburger Menu */}
            <nav className='visible md:hidden flex items-center justify-between px-4 py-4 bg-transparent'>
                <Logo />
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className='text-white hover:text-pink-400 transition-colors duration-300'
                    aria-label='Toggle menu'
                >
                    {mobileMenuOpen ? <FiX size={28} /> : <FiMenu size={28} />}
                </button>
            </nav>

            {/* Mobile Menu Dropdown */}
            <div
                className={`visible md:hidden bg-slate-800 border-t border-slate-700 transition-all duration-300 ease-out overflow-hidden ${
                    mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
                <div className='px-4 py-4 space-y-3'>
                    {links.map((item) => (
                        <Link
                            key={item.id}
                            href={item.url}
                            onClick={() => setMobileMenuOpen(false)}
                            className='block text-gray-300 text-sm font-semibold hover:text-pink-400 transition-colors duration-300 px-3 py-2 rounded hover:bg-slate-700'
                        >
                            {item.name}
                        </Link>
                    ))}
                    {status === "authenticated" && (
                        <button
                            onClick={() => {
                                signOut();
                                setMobileMenuOpen(false);
                            }}
                            className='w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition font-semibold text-sm'
                        >
                            <FiLogOut size={20} />
                            Logout
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
