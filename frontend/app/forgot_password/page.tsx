"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const router = useRouter();

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/send-email/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Password reset request failed");
            }

            setSuccessMessage("Check your email for a temporary password. You can change your password after you log in!");
        } catch (err: any) {
            setError(err.message);
        }
    };

    const validateEmail = async (e: HTMLInputElement) => {
        const value = e.value;

        if (!value) return e.setCustomValidity("An email is required")

        let pattern = /^[^ ]+@[^ ]+\.[^ ]+$/

        if (!pattern.test(value)) return e.setCustomValidity("Your email must be properly formatted. Example: puzzlelab@gmail.com")

        e.setCustomValidity("")
    };

    return (
        <div className="flex flex-col items-center mt-32">
            <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
            {error && <p className="text-red-500">{error}</p>}
            {successMessage && <p className="text-green-500">{successMessage}</p>}
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-3 items-center">
                <Input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(evt) => setEmail(evt.target.value)}
                    onBlur={(e) => validateEmail(e.target as HTMLInputElement)}
                    className="border p-2 rounded w-80"
                    required
                    onInput={(e) => (e.target as HTMLInputElement).setCustomValidity("")}
                />
                <Button type="submit" variant="outline">
                    Request Reset
                </Button>
            </form>
        </div>
    );
}
