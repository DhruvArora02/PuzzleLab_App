"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
interface Settings {
    // Use one property for theme selection
    avatar: string | undefined,
    isLoggedIn: boolean,
    theme: "DEFAULT" | "DARK" | "RASPBERRY" | "MANGO" | "LAKE";
}

interface SettingsContextType {
    settings: Settings;
    updateSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void;
}

// Default settings will be applied if the user is not logged in and has no settings stored in localStorage.
const defaultSettings: Settings = {
    avatar: undefined,
    isLoggedIn: false,
    theme: "DEFAULT",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<Settings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const fetchSettings = async () => {
        try {
            let token = localStorage.getItem("token");

            // If not token, ignore this because we know we aren't logged in
            if (token) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/users/me`, {
                    method: "GET",
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                })

                // Set settings from retrieved user
                if (res.ok) {
                    const data = await res.json();
                    setSettings(prev => ({
                        ...prev,
                        avatar: data.user.avatar,
                        isLoggedIn: true,
                        theme: data.user.theme,
                    }));
                }

                // Automatic logout logic
                else {
                    localStorage.removeItem("token");
                    localStorage.removeItem("userId");
                    
                    updateSetting("avatar", undefined);
                    updateSetting("isLoggedIn", false);
                }

                return res.ok;
            }

            return false;
        } catch (error) {
            console.error('Error fetching settings:', error);
            return false;
        }
    };

    // Save user's settings to database & localStorage
    const saveSettings = async (newSettings: Settings) => {
        localStorage.setItem('settings', JSON.stringify(newSettings));

        if (!settings.isLoggedIn) return console.log("Saved settings locally.");

        let [userId, token] = [localStorage.getItem("userId"), localStorage.getItem("token")];

        // Save to server if user is logged in
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND}/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newSettings),
            });

            if (!res.ok) {
                console.log('Settings saved locally only (user not logged in)');
            }
        } catch (error) {
            console.error('Error saving settings to server:', error);
        }
    };

    // Updates the settings based on specified key
    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings((prev) => ({ ...prev, [key]: value }));
    };

    useEffect(() => {
        const initializeSettings = async () => {
            setIsLoading(true);

            const userSettingsFound = await fetchSettings();

            if (!userSettingsFound) {
                const storedSettings = localStorage.getItem("settings");

                if (storedSettings) {
                    const parsedSettings = JSON.parse(storedSettings);

                    setSettings({
                        avatar: undefined,
                        ...parsedSettings,
                        isLoggedIn: false, // Set isLoggedIn to false no matter what
                    });
                } else setSettings(defaultSettings);
            }

            setIsLoading(false);
        };

        initializeSettings();
    }, []);

    // Apply the theme by setting the corresponding CSS class
    useEffect(() => {
        if (!isLoading) {
            // Remove any previously applied theme classes
            document.documentElement.classList.forEach(className => {
                if (className.startsWith("theme-")) document.documentElement.classList.remove(className);
            })
            
            // If not default, add the theme class
            if (settings.theme !== "DEFAULT") {
                document.documentElement.classList.add(`theme-${settings.theme}`);
            }
            saveSettings(settings);
        }
    }, [settings, isLoading]);

    return (
        <SettingsContext.Provider value={{ settings, updateSetting }}>
            {!isLoading && children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);

    if (context === undefined) throw new Error("useSettings must be used within a SettingsProvider");

    return context;
}
