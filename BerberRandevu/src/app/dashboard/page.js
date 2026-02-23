"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/giris/erkek");
        }
    }, [status, router]);

    if (status === "loading") {
        return (
            <div className={styles.loadingPage}>
                <div className={styles.spinner}></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className={styles.dashboardPage}>
            <div className={styles.container}>
                <div className={styles.successCard}>
                    <div className={styles.successIcon}>✓</div>
                    <h1 className={styles.successTitle}>Giriş Başarılı!</h1>
                    <p className={styles.successMessage}>
                        Hoş geldiniz, <strong>{session.user.name || session.user.email}</strong>
                    </p>

                    <div className={styles.userInfo}>
                        <div className={styles.infoRow}>
                            <span className={styles.label}>Email:</span>
                            <span className={styles.value}>{session.user.email}</span>
                        </div>
                        {session.user.gender && (
                            <div className={styles.infoRow}>
                                <span className={styles.label}>Cinsiyet:</span>
                                <span className={styles.value}>
                                    {session.user.gender === "male" ? "Erkek" : "Kadın"}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className={styles.actions}>
                        <Link href="/" className={styles.homeButton}>
                            Ana Sayfaya Dön
                        </Link>
                        <Link href="/admin" className={styles.adminButton}>
                            Admin Paneli
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
