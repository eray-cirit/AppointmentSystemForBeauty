import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { addUser, findUserByEmail, findPendingByEmail, addPendingVerification, removePendingVerification } from "@/lib/db";
import { isValidEmail, validateFields } from "@/lib/auth-helpers";

// Email doğrulama kodu gönder
export async function PUT(request) {
    try {
        const body = await request.json();
        const { email, firstName, lastName, password, gender } = body;

        // Zorunlu alan kontrolü
        const validation = validateFields(body, ['email', 'firstName', 'lastName', 'password', 'gender']);
        if (!validation.valid) {
            return NextResponse.json(
                { error: `Eksik alanlar: ${validation.missing.join(', ')}` },
                { status: 400 }
            );
        }

        // Email formatı kontrolü
        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: "Geçerli bir e-posta adresi giriniz" },
                { status: 400 }
            );
        }

        // Şifre uzunluk kontrolü
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Şifre en az 6 karakter olmalıdır" },
                { status: 400 }
            );
        }

        // Email kullanımda mı kontrolü
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
            return NextResponse.json(
                { error: "Bu e-posta adresi zaten kullanımda" },
                { status: 400 }
            );
        }

        // 6 haneli doğrulama kodu oluştur
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Bekleyen doğrulamaya ekle
        await addPendingVerification({
            email,
            firstName,
            lastName,
            password,
            gender,
            code: verificationCode,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 dakika
        });

        // Development modunda console'a yazdır
        console.log(`\n📧 EMAIL DOĞRULAMA KODU`);
        console.log(`   Email: ${email}`);
        console.log(`   Kod: ${verificationCode}`);
        console.log(`   (Bu kod 10 dakika geçerlidir)\n`);

        return NextResponse.json({
            message: "Doğrulama kodu gönderildi",
            // Development için kodu da döndür (production'da kaldırılmalı)
            code: process.env.NODE_ENV === "development" ? verificationCode : undefined,
        });
    } catch (error) {
        console.error("Send verification error:", error);
        return NextResponse.json(
            { error: "Doğrulama kodu gönderilemedi" },
            { status: 500 }
        );
    }
}

// Kayıt tamamla (kod doğrulama ile)
export async function POST(request) {
    try {
        const body = await request.json();
        const { email, verificationCode } = body;

        // Validasyon
        if (!email || !verificationCode) {
            return NextResponse.json(
                { error: "Email ve doğrulama kodu gerekli" },
                { status: 400 }
            );
        }

        // Bekleyen doğrulamayı bul (doğrudan Firestore'dan)
        const pending = await findPendingByEmail(email);

        if (!pending) {
            return NextResponse.json(
                { error: "Doğrulama kaydı bulunamadı. Lütfen tekrar deneyin." },
                { status: 400 }
            );
        }

        // Süre kontrolü
        if (new Date() > new Date(pending.expiresAt)) {
            await removePendingVerification(email);
            return NextResponse.json(
                { error: "Doğrulama kodu süresi dolmuş. Lütfen yeni kod alın." },
                { status: 400 }
            );
        }

        // Kod kontrolü
        if (pending.code !== verificationCode) {
            return NextResponse.json(
                { error: "Doğrulama kodu hatalı" },
                { status: 400 }
            );
        }

        // Şifreyi hashle
        const hashedPassword = await bcrypt.hash(pending.password, 12);

        // Yeni kullanıcı oluştur
        const newUser = {
            id: `user_${Date.now()}`,
            firstName: pending.firstName,
            lastName: pending.lastName,
            email: pending.email,
            password: hashedPassword,
            gender: pending.gender || "male",
            role: "user",
            emailVerified: true,
            createdAt: new Date().toISOString(),
        };

        // Kullanıcıyı veritabanına kaydet
        await addUser(newUser);

        // Bekleyen doğrulamayı sil
        await removePendingVerification(email);

        // Başarılı yanıt
        return NextResponse.json(
            {
                message: "Kayıt başarılı! Email adresiniz doğrulandı.",
                user: {
                    id: newUser.id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    email: newUser.email,
                    gender: newUser.gender,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Register error:", error);
        return NextResponse.json(
            { error: "Sunucu hatası. Lütfen tekrar deneyin." },
            { status: 500 }
        );
    }
}
