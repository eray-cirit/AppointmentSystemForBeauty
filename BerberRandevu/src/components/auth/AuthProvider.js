"use client";

import { SessionProvider } from "next-auth/react";
import { GenderProvider } from "@/context/GenderContext";

export default function AuthProvider({ children }) {
    return (
        <SessionProvider>
            <GenderProvider>
                {children}
            </GenderProvider>
        </SessionProvider>
    );
}
