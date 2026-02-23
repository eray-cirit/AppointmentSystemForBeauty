"use client";

import { createContext, useContext, useState, useCallback } from "react";

const GenderContext = createContext(undefined);

export function GenderProvider({ children }) {
    const [gender, setGender] = useState("male"); // "male" | "female"

    const handleGenderChange = useCallback((newGender) => {
        if (newGender === gender) return;
        setGender(newGender);
    }, [gender]);

    return (
        <GenderContext.Provider value={{
            gender,
            handleGenderChange,
            isMale: gender === "male"
        }}>
            {children}
        </GenderContext.Provider>
    );
}

export function useGender() {
    const context = useContext(GenderContext);
    if (context === undefined) {
        // Context dışında kullanılırsa varsayılan değer döndür
        return {
            gender: "male",
            handleGenderChange: () => { },
            isMale: true
        };
    }
    return context;
}
