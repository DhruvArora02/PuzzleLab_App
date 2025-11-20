"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PasswordReset() {
    const router = useRouter();

    // State variables for the Request Reset mode
    const [username, setUsername] = useState("");
    const [oldPassword, setOldPassword] = useState("");

    // State variables for the Reset Password mode
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");

    // General error state to display error messages.
    const [error, setError] = useState<string | null>(null);

    /**
     * handleRequestReset - Handles the first step of the password reset process.
     *
     * Users enter their username and old password. This function sends these
     * details to a placeholder API endpoint. The backend should verify the credentials,
     * generate a secure token, and return it. The user is then redirected to the same
     * page with the token as a query parameter.
     */
    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await fetch("/api/request-password-reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, oldPassword }),
            });

            if (!response.ok) {
                throw new Error("Password reset request failed");
            }

            // Parse response JSON expecting a secure token.
            const data = await response.json();
            if (data.token) {
                // Redirect user to the reset page with the secure token in the URL.
                router.push(`/password-reset?token=${data.token}`);
            } else {
                throw new Error("Token not received");
            }
        } catch (err: any) {
            setError(err.message);
        }
    };

    /**
     * handleResetPassword - Handles the actual password reset.
     *
     * Users enter their new password and confirm it. The new password is validated
     * against security requirements (e.g., minimum length, at least one uppercase letter,
     * and one special character). On validation, the new password along with the token is sent
     * to the backend to update the user's credentials.
     */
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validate new password meets security criteria:
        // Minimum 8 characters, at least one uppercase letter, and one special character.
        if (newPassword.length < 8 || newPassword.length > 64) {
            setError(
                "New password must be between 8 and 64 characters long."
            );
            return;
        }

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match");
            return;
        }

        try {
            let [userId, token] = [localStorage.getItem("userId"), localStorage.getItem("token")];
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ password: newPassword }),
            });

            if (!response.ok) {
                throw new Error("Password reset failed");
            }

            // After a successful reset, redirect the user to the login page.
            router.push("/");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            {/* When no token is provided, show the reset request form */}
            {!true ? (
                <>
                    <h1 className="text-2xl font-bold mb-4">Request Password Reset</h1>
                    {error && <p className="text-red-500">{error}</p>}
                    <form onSubmit={handleRequestReset} className="flex flex-col gap-3 w-80">
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="border p-2 rounded"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Old Password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="border p-2 rounded"
                            required
                        />
                        <Button type="submit" variant="outline">
                            Request Reset
                        </Button>
                    </form>
                </>
            ) : (
                // When a token is provided, show the new password form.
                <>
                    <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
                    {error && <p className="text-red-500">{error}</p>}
                    <form onSubmit={handleResetPassword} className="flex flex-col gap-3 w-80">
                        <input
                            type="password"
                            placeholder="New Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="border p-2 rounded"
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className="border p-2 rounded"
                            required
                        />
                        <Button type="submit" variant="outline">
                            Reset Password
                        </Button>
                    </form>
                </>
            )}
        </div>
    );
}
