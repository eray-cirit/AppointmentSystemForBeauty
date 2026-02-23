import { NextResponse } from "next/server";
import { getUsers, deleteUser } from "@/lib/db";
import { requireAdmin, sanitizeUser } from "@/lib/auth-helpers";

// Tüm kullanıcıları getir (sadece admin)
export async function GET() {
    // Admin kontrolü
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const users = await getUsers();

        // Şifreleri API response'dan çıkar
        const safeUsers = users.map(sanitizeUser);

        return NextResponse.json({
            users: safeUsers,
            count: safeUsers.length
        });
    } catch (error) {
        console.error("Get users error:", error);
        return NextResponse.json(
            { error: "Kullanıcılar yüklenemedi" },
            { status: 500 }
        );
    }
}

// Kullanıcı sil (sadece admin)
export async function DELETE(request) {
    // Admin kontrolü
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    try {
        const { searchParams } = new URL(request.url);
        const email = searchParams.get('email');

        if (!email) {
            return NextResponse.json(
                { error: "Email gerekli" },
                { status: 400 }
            );
        }

        const deleted = await deleteUser(email);

        if (deleted) {
            return NextResponse.json({ message: "Kullanıcı silindi" });
        } else {
            return NextResponse.json(
                { error: "Kullanıcı bulunamadı" },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { error: "Kullanıcı silinemedi" },
            { status: 500 }
        );
    }
}
