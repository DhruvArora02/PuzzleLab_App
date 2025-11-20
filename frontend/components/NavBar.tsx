"use client";

import Link from "next/link";
import Image from "next/image";
import { Settings } from "./Settings";
import { useSettings } from "@/contexts/SettingsContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoginAndRegister } from "./LoginAndRegister"; // Adjust the path as necessary
import { Button } from "./ui/button";
import { Logout } from "./Logout";

export function NavBar() {
    const { settings, updateSetting } = useSettings();
    const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
    const [loginTab, setLoginTab] = useState<"Sign In" | "Register">("Sign In"); // Initial loginTab state
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

    return (
        <nav className="bg-[hsl(var(--nav))] px-7 py-5 flex items-center justify-between">
            {/* Left side: Clickable Logo */}
            <Link href="/">
                <Image
                    src="/favicon.ico"
                    alt="Puzzle Lab Logo"
                    width={40}
                    height={20}
                    className="cursor-pointer"
                />
            </Link>

            {
                settings.isLoggedIn ? (
                    <div className="flex gap-4">
                        <button onClick={() => { setIsLogoutDialogOpen(true); }} className="hoverbutton font-bold text-lg flex items-center justify-center">
                            Logout
                        </button>
                        <Logout isOpen={isLogoutDialogOpen} setIsOpen={setIsLogoutDialogOpen} />
                        <Settings />
                    </div>
                ) : (
                    <div className="flex gap-4">
                        <button onClick={() => { setIsLoginDialogOpen(true); setLoginTab("Sign In") }} className="hoverbutton font-bold text-lg flex items-center justify-center">
                            Sign In
                        </button>
                        <button onClick={() => { setIsLoginDialogOpen(true); setLoginTab("Register") }} className="hoverbutton font-bold text-lg flex items-center justify-center">
                            Register
                        </button>
                        <LoginAndRegister isOpen={isLoginDialogOpen} setIsOpen={setIsLoginDialogOpen} tab={loginTab} setTab={setLoginTab} />
                        <Settings />
                    </div>
                )
            }
        </nav>
    );
}