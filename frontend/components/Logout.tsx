"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSettings } from "@/contexts/SettingsContext";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import { DialogDescription } from "@radix-ui/react-dialog";

interface LogoutProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}

export function Logout({ isOpen, setIsOpen }: LogoutProps) {

    const router = useRouter();
    const { updateSetting } = useSettings();

    const handleLogout = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            localStorage.removeItem("token")
            localStorage.removeItem("userId");

            updateSetting("avatar", undefined);
            updateSetting("isLoggedIn", false);

            setIsOpen(false);
            router.push('/');
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Special function needed for closing to prevent a customValidation message from flicking for a millisecond before the modal closes. It annoyed me :(
     */
    const handleCancel = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-[400px] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl mb-4">Logout</DialogTitle>
                    <DialogDescription className="text-center text-gray-500">Are you sure you want to log out?</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleLogout} className="flex flex-col gap-3 items-center ">
                    <DialogFooter className="mt-4 flex-none">
                        <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                        <Button type="submit">Logout</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

