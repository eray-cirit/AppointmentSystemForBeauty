"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import styles from "../../giris/auth.module.css";

export default function KadinKayitPage() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [verificationCode, setVerificationCode] = useState("");
    const [step, setStep] = useState(1); // 1: Form, 2: Doğrulama
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState("");

    const checkPasswordStrength = (password) => {
        if (password.length < 6) return "weak";
        if (password.length < 10) return "medium";
        if (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
            return "strong";
        }
        return "medium";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === "password") {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            setError("Şifreler eşleşmiyor");
            return false;
        }
        if (formData.password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır");
            return false;
        }
        if (!formData.email.includes("@")) {
            setError("Geçerli bir e-posta adresi giriniz");
            return false;
        }
        return true;
    };

    // Adım 1: Doğrulama kodu gönder
    const handleSendCode = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    gender: "female",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Doğrulama kodu gönderilemedi");
            }

            setSuccess("Doğrulama kodu e-posta adresinize gönderildi!");
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Adım 2: Kodu doğrula ve kayıt tamamla
    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!verificationCode || verificationCode.length !== 6) {
            setError("6 haneli doğrulama kodunu giriniz");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    verificationCode,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Kayıt başarısız");
            }

            setSuccess("Kayıt başarılı! Yönlendiriliyorsunuz...");

            // Otomatik giriş yap
            setTimeout(async () => {
                await signIn("credentials", {
                    email: formData.email,
                    password: formData.password,
                    callbackUrl: "/konum-sec",
                });
            }, 1500);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Yeni kod gönder
    const handleResendCode = async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/auth/register", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    gender: "female",
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error);
            }

            setSuccess("Yeni doğrulama kodu gönderildi!");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signIn("google", { callbackUrl: "/konum-sec" });
        } catch (err) {
            setError("Google ile kayıt olurken bir hata oluştu.");
            setLoading(false);
        }
    };

    const getStrengthText = () => {
        switch (passwordStrength) {
            case "weak": return "Zayıf şifre";
            case "medium": return "Orta güçte şifre";
            case "strong": return "Güçlü şifre";
            default: return "";
        }
    };

    return (
        <div className={`${styles.authPage} ${styles.femaleTheme}`}>
            {/* Arka Plan */}
            <div className={styles.backgroundGlow}></div>
            <div className={styles.backgroundImage}></div>

            {/* Geri Butonu */}
            <Link href="/" className={styles.backButton}>
                <span className={styles.backIcon}>←</span>
                Ana Sayfa
            </Link>

            {/* Form Container */}
            <div className={styles.formContainer}>
                <div className={styles.glassCard}>
                    {/* Header */}
                    <div className={styles.formHeader}>
                        <div className={styles.logo}>CIRYT</div>
                        <h1 className={styles.formTitle}>
                            {step === 1 ? "Hesap Oluştur" : "E-posta Doğrulama"}
                        </h1>
                        <p className={styles.formSubtitle}>
                            {step === 1
                                ? "Hemen ücretsiz kayıt olun"
                                : `${formData.email} adresine kod gönderildi`}
                        </p>
                    </div>

                    {/* Messages */}
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    {success && <div className={styles.successMessage}>{success}</div>}

                    {step === 1 ? (
                        /* ADIM 1: Kayıt Formu */
                        <>
                            <form onSubmit={handleSendCode}>
                                {/* İsim alanları yan yana */}
                                <div className={styles.nameRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.inputLabel}>Ad</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            className={styles.inputField}
                                            placeholder="Adınız"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.inputLabel}>Soyad</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            className={styles.inputField}
                                            placeholder="Soyadınız"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.inputLabel}>E-posta</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className={styles.inputField}
                                        placeholder="ornek@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.inputLabel}>Şifre</label>
                                    <input
                                        type="password"
                                        name="password"
                                        className={styles.inputField}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                    {formData.password && (
                                        <div className={styles.passwordStrength}>
                                            <div className={styles.strengthBar}>
                                                <div className={`${styles.strengthFill} ${styles[passwordStrength]}`}></div>
                                            </div>
                                            <span className={styles.strengthText}>{getStrengthText()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className={styles.formGroup}>
                                    <label className={styles.inputLabel}>Şifre Tekrar</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        className={styles.inputField}
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className={styles.submitButton}
                                    disabled={loading}
                                >
                                    {loading && <span className={styles.spinner}></span>}
                                    {loading ? "Kod gönderiliyor..." : "Doğrulama Kodu Gönder"}
                                </button>
                            </form>

                            {/* Divider */}
                            <div className={styles.divider}>
                                <div className={styles.dividerLine}></div>
                                <span className={styles.dividerText}>veya</span>
                                <div className={styles.dividerLine}></div>
                            </div>

                            {/* Google Button */}
                            <button
                                type="button"
                                className={styles.googleButton}
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                            >
                                <svg className={styles.googleIcon} viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Google ile Kayıt Ol
                            </button>
                        </>
                    ) : (
                        /* ADIM 2: Doğrulama Kodu */
                        <form onSubmit={handleVerifyAndRegister}>
                            <div className={styles.formGroup}>
                                <label className={styles.inputLabel}>Doğrulama Kodu</label>
                                <input
                                    type="text"
                                    className={styles.inputField}
                                    placeholder="6 haneli kod"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    maxLength={6}
                                    required
                                    disabled={loading}
                                    style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2rem' }}
                                />
                            </div>

                            <button
                                type="submit"
                                className={styles.submitButton}
                                disabled={loading || verificationCode.length !== 6}
                            >
                                {loading && <span className={styles.spinner}></span>}
                                {loading ? "Doğrulanıyor..." : "Kayıt Ol"}
                            </button>

                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={handleResendCode}
                                    disabled={loading}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#72223f',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                        textDecoration: 'underline',
                                    }}
                                >
                                    Kodu tekrar gönder
                                </button>
                            </div>

                            <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#666',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem',
                                    }}
                                >
                                    ← Geri dön
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Footer */}
                    <div className={styles.formFooter}>
                        Zaten hesabınız var mı?{" "}
                        <Link href="/giris/kadin" className={styles.formLink}>
                            Giriş Yap
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
