import { NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/db";
import { isValidEmail } from "@/lib/auth-helpers";

// Kullanıcının cinsiyetini kontrol et
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: "Email gerekli" },
                { status: 400 }
            );
        }

        // Email format kontrolü
        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: "Geçersiz email formatı" },
                { status: 400 }
            );
        }

        const user = await findUserByEmail(email);

        if (!user) {
            // Kullanıcı bulunamadı - herhangi bir panelden giriş yapabilir
            return NextResponse.json({ gender: null });
        }

        return NextResponse.json({
            gender: user.gender,
            exists: true
        });
    } catch (error) {
        console.error("Check gender error:", error);
        return NextResponse.json(
            { error: "Kontrol yapılamadı" },
            { status: 500 }
        );
    }
}
