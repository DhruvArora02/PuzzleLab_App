"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "./ui/dialog";
import { useSettings } from "@/contexts/SettingsContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export function SetAvatar() {
    const { settings, updateSetting } = useSettings();
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Track the dialog open state

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        let target = e.target as HTMLFormElement
        let value = target.imageUrl.value;

        let possibleExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif']

        let hasCorrectExtension = possibleExtensions.some(ext => value.endsWith(ext));

        if (hasCorrectExtension) updateSetting("avatar", target.imageUrl?.value)
        else updateSetting("avatar", undefined);

        setIsDialogOpen(false);
    }

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            {settings.isLoggedIn && (
                <>
                    { /** Actual Avatar */}
                    <Avatar style={{ width: 100, height: 100, cursor: "pointer" }} className="hover:filter hover:grayscale" onClick={() => setIsDialogOpen(true)}>
                        <AvatarImage src={settings.avatar} />
                        <AvatarFallback style={{ color: "black", backgroundColor: "lightgray" }}>PL</AvatarFallback>
                    </Avatar>

                    { /** Dialog element */}
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Enter Image URL</DialogTitle>
                                <DialogDescription>URL for your new profile picture</DialogDescription>
                            </DialogHeader>

                            <form className="flex flex-col gap-3 mt-3" onSubmit={handleSubmit}>

                                <Input type="text" name="imageUrl" placeholder="Image URL" className="border p-2 rounded" required />

                                <DialogFooter className="flex justify-between">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}> Cancel </Button>
                                    <Button type="submit" variant="default"> Save </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </>
            )}
        </div>
    );
}