import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

/**
 * Oturum kontrolü — giriş yapmış kullanıcı gerektirir
 * @returns {Promise<{session: object}|NextResponse>} session veya 401 response
 */
export async function requireAuth() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return {
            error: NextResponse.json(
                { error: "Bu işlem için giriş yapmalısınız" },
                { status: 401 }
            )
        };
    }
    return { session };
}

/**
 * Admin kontrolü — admin rolü gerektirir
 * @returns {Promise<{session: object}|NextResponse>} session veya 401/403 response
 */
export async function requireAdmin() {
    const result = await requireAuth();
    if (result.error) return result;

    if (result.session.user.role !== "admin") {
        return {
            error: NextResponse.json(
                { error: "Bu işlem için yetkiniz yok" },
                { status: 403 }
            )
        };
    }
    return result;
}

/**
 * Input validation helper
 * Basit alan kontrolü — gerekli alanların varlığını doğrular
 * @param {object} body - Request body
 * @param {string[]} requiredFields - Zorunlu alan isimleri
 * @returns {{valid: boolean, missing?: string[]}}
 */
export function validateFields(body, requiredFields) {
    const missing = requiredFields.filter(field => !body[field]);
    if (missing.length > 0) {
        return { valid: false, missing };
    }
    return { valid: true };
}

/**
 * Email format doğrulama
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Kullanıcı objesinden hassas alanları çıkar (API response için)
 * @param {object} user
 * @returns {object} password'suz kullanıcı
 */
export function sanitizeUser(user) {
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
}
