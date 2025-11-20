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
import { Input } from "./ui/input";

interface LoginAndRegisterProps {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    tab: "Sign In" | "Register";
    setTab: (tab: "Sign In" | "Register") => void;
}

export function LoginAndRegister({ isOpen, setIsOpen, tab, setTab }: LoginAndRegisterProps) {
    const { updateSetting } = useSettings();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordHidden, setPasswordHidden] = useState(true);
    const [email, setEmail] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmHidden, setConfirmHidden] = useState(true);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        const input = document.getElementById("signin-password") as HTMLInputElement;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!res.ok) {
                input.setCustomValidity("The username or password is incorrect.")
                input.reportValidity();
                return;
            }

            const data = await res.json();

            localStorage.setItem("token", data.token)
            localStorage.setItem('userId', data.user.id)
            setIsOpen(false);

            updateSetting("isLoggedIn", true);
            updateSetting("avatar", data.user.avatar);
        } catch (error) {
            console.log("hi");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const registerInputs = document.querySelectorAll<HTMLInputElement>('input');

        let isValid = true;
        for (let input of registerInputs) {
            input.focus();
            input.blur();
            input.reportValidity();

            if (!input.checkValidity()) {
                isValid = false;
                return input.focus();
            }
        }

        if (!isValid) return

        try {
            // Send registration data to the backend using a POST request.
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password }),
            });

            // If registration fails, throw an error.
            if (!res.ok) return console.error("Registration failed");

            const data = await res.json();

            // Store the token & id in localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('userId', data.user.id);

            updateSetting("isLoggedIn", true);
            updateSetting("avatar", data.user.avatar);
            setIsOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Special function needed for closing to prevent a customValidation message from flicking for a millisecond before the modal closes. It annoyed me :(
     */
    const handleClose = async (e: any) => {
        e.preventDefault();

        const inputs = document.querySelectorAll<HTMLInputElement>("input");
        console.log(inputs);

        for (let input of inputs) {
            input.blur();
            input.setCustomValidity(""); // Clear any custom validity messages
        };

        setPasswordHidden(true);
        setConfirmHidden(true);

        setIsOpen(false);
    };

    /**
     * Validates that the username is within the length limit, and ensures the username is not already in use.
     *
     * This function is triggered onBlur (when the user leaves the username input).
     */
    const validateUsername = async (e: HTMLInputElement) => {
        const value = e.value;

        if (!value) return e.setCustomValidity("A username is required")
        if (value.length < 3 || value.length > 20) return e.setCustomValidity("A username must be 3-20 characters")

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/username-available?username=${value}`);
            if (!res.ok) return console.error("API call failed with status:", res.status);

            const data = await res.json();

            if (!data.available) return e.setCustomValidity("This username is already taken");
        } catch (err) {
            console.error("Error checking username uniqueness", err);
        }

        e.setCustomValidity("")
    };

    const validateEmail = async (e: HTMLInputElement) => {
        const value = e.value;

        if (!value) return e.setCustomValidity("An email is required")

        let pattern = /^[^ ]+@[^ ]+\.[^ ]+$/

        if (!pattern.test(value)) return e.setCustomValidity("Your email must be properly formatted. Example: puzzlelab@gmail.com")

        e.setCustomValidity("")
    };

    /**
     * Validates that the password is within the length limit, and that the confirm password matches
     *
     * This function is triggered onBlur (when the user leaves the password/confirm input).
     */
    const validatePassword = async (e: HTMLInputElement) => {
        const value = e.value;

        if (!value) return e.setCustomValidity("A password is required")

        if (value.length < 8 || value.length > 64) return e.setCustomValidity("Password must be 8-64 characters")

        e.setCustomValidity("")
    };

    const validateConfirmPassword = async (e: HTMLInputElement) => {
        const value = e.value;

        if (!value) return e.setCustomValidity("Please re-write your password to confirm you typed it correctly")

        if (value != password) return e.setCustomValidity("This password does not match")

        e.setCustomValidity("")
    };

    const signInChange = async (e: HTMLInputElement) => {
        const input = document.getElementById("signin-password") as HTMLInputElement | null;
        if (input) input.setCustomValidity("");
    };
    

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-[400px] h-[435px] flex flex-col" onInteractOutside={(e) => handleClose(e)}>

                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">{tab}</DialogTitle>
                </DialogHeader>

                <Tabs value={tab} onValueChange={(value) => setTab(value as "Sign In" | "Register")}>
                    <TabsList className="grid grid-cols-2">
                        <TabsTrigger value="Sign In">Sign In</TabsTrigger>
                        <TabsTrigger value="Register">Register</TabsTrigger>
                    </TabsList>

                    <TabsContent className="mt-8 ml-4 mr-4" value="Sign In">
                        <form onSubmit={handleLogin} className="flex flex-col gap-6 items-center">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onInput={(e) => signInChange(e.target as HTMLInputElement)}
                                className="border p-2 rounded"
                                required
                                maxLength={20}
                            />
                            <div className="relative w-full mb-4 mt-2">
                                <Input id="signin-password"
                                    type={passwordHidden ? "password" : "text"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onInput={(e) => signInChange(e.target as HTMLInputElement)}
                                    className="border p-2 rounded pr-14"
                                    required
                                    maxLength={64}
                                />
                                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setPasswordHidden(!passwordHidden)} >
                                    {passwordHidden ? "Show" : "Hide"}
                                </button>
                            </div>
                            <DialogFooter className="mt-1 flex-row">
                                <DialogClose asChild>
                                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                                </DialogClose>
                                <Button variant="default" type="submit">Sign In</Button>
                            </DialogFooter>
                            <div className="text-center">
                                <a href="/forgot_password">Forgot password?</a>
                                <br />
                                <a onClick={() => setTab("Register")} className="cursor-pointer">Have no account yet?</a>
                            </div>
                        </form>
                    </TabsContent>

                    <TabsContent className="mt-4" value="Register">
                        <form onSubmit={handleRegister} className="flex flex-col gap-3 items-center ml-4 mr-4">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                onBlur={(e) => validateUsername(e.target as HTMLInputElement)}
                                className="border p-2 rounded"
                                required
                                maxLength={20}
                                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                            />
                            <Input
                                type="text"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={(e) => validateEmail(e.target as HTMLInputElement)}
                                className="border p-2 rounded"
                                required
                                onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                            />
                            <div className="relative w-full">
                                <Input
                                    type={passwordHidden ? "password" : "text"}
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onBlur={(e) => validatePassword(e.target as HTMLInputElement)}
                                    className="border p-2 rounded pr-14"
                                    required
                                    maxLength={64}
                                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                                />
                                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setPasswordHidden(!passwordHidden)} >
                                    {passwordHidden ? "Show" : "Hide"}
                                </button>
                            </div>
                            <div className="relative w-full">
                                <Input
                                    type={confirmHidden ? "password" : "text"}
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={(e) => validateConfirmPassword(e.target as HTMLInputElement)}
                                    className="border p-2 rounded pr-14"
                                    required
                                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                                />
                                <button type="button" className="absolute right-3 top-1/2 transform -translate-y-1/2" onClick={() => setConfirmHidden(!confirmHidden)} >
                                    {confirmHidden ? "Show" : "Hide"}
                                </button>
                            </div>
                            <DialogFooter className="mt-4">
                                <DialogClose asChild>
                                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                                </DialogClose>
                                <Button variant="default" type="submit">Register</Button>
                            </DialogFooter>
                            <a onClick={() => setTab("Sign In")} className="cursor-pointer">
                                Already have an account?
                            </a>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

