"use client";

import Image from "next/image";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
// Import shadcn Select components
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Settings as SettingsIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { SetAvatar } from "./SetAvatar";


export function Settings() {
    const { settings, updateSetting } = useSettings();

    return (
        <Sheet>
            {/* Settings logo */}
            <SheetTrigger asChild>
                <button className="z-10">
                    {
                        settings.isLoggedIn ? (
                            <Avatar>
                                <AvatarImage src={settings.avatar} />
                                <AvatarFallback style={{ color: 'black', backgroundColor: "lightgray" }}>PL</AvatarFallback>
                            </Avatar>
                        ) : (
                            <SettingsIcon className="hoverbutton" width={27} height={27} />
                        )
                    }
                </button>
            </SheetTrigger>

            { /** Settings hamburger popout */}
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Settings</SheetTitle>
                </SheetHeader>
                <div className="grid gap-4 py-4">

                    { /** Avatar */}
                    < SetAvatar/>

                    { /** Theme */}
                    <h2 className="text-lg font-semibold">Theme</h2>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium leading-none">
                            Select Theme
                        </label>
                        {/* Using shadcn Select component for cleaner UI */}
                        <Select
                            value={settings.theme}
                            onValueChange={(val) =>
                                updateSetting(
                                    "theme",
                                    val as "DEFAULT" | "DARK" | "RASPBERRY" | "MANGO" | "LAKE"
                                )
                            }
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Theme" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="DEFAULT">
                                    Default (Light)
                                </SelectItem>
                                <SelectItem value="DARK">
                                    Dark
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    { /** Account Settings */}
                    {settings.isLoggedIn && (
                        <>
                            <h2 className="text-lg font-semibold">Account Settings</h2>
                            <div className="flex flex-col gap-3">
                                <Button variant="outline">Change Username</Button>
                                <Button variant="outline">Change Password</Button>
                                <Button variant="outline">Change Email</Button>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
