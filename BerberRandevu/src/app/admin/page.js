"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch("/api/admin/users");
            const data = await response.json();

            if (response.ok) {
                setUsers(data.users || []);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError("Kullanıcılar yüklenemedi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (email) => {
        if (!confirm(`${email} kullanıcısını silmek istediğinize emin misiniz?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/admin/users?email=${encodeURIComponent(email)}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setUsers(users.filter(u => u.email !== email));
            } else {
                const data = await response.json();
                alert(data.error || "Silme işlemi başarısız");
            }
        } catch (err) {
            alert("Bir hata oluştu");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("tr-TR", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={styles.adminPage}>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>Admin Paneli</h1>
                        <p className={styles.subtitle}>Kayıtlı kullanıcıları yönetin</p>
                    </div>
                    <Link href="/" className={styles.backButton}>
                        ← Ana Sayfa
                    </Link>
                </div>

                {/* Stats */}
                <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Toplam Kullanıcı</div>
                        <div className={styles.statValue}>{users.length}</div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Erkek Kullanıcı</div>
                        <div className={styles.statValue}>
                            {users.filter(u => u.gender === "male").length}
                        </div>
                    </div>
                    <div className={styles.statCard}>
                        <div className={styles.statLabel}>Kadın Kullanıcı</div>
                        <div className={styles.statValue}>
                            {users.filter(u => u.gender === "female").length}
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className={styles.tableCard}>
                    <div className={styles.tableHeader}>
                        <h2 className={styles.tableTitle}>Kayıtlı Kullanıcılar</h2>
                        <button onClick={fetchUsers} className={styles.refreshButton}>
                            🔄 Yenile
                        </button>
                    </div>

                    {loading ? (
                        <div className={styles.loading}>
                            <div className={styles.spinner}></div>
                            <p>Yükleniyor...</p>
                        </div>
                    ) : error ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>⚠️</div>
                            <p className={styles.emptyText}>{error}</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>👤</div>
                            <p className={styles.emptyText}>Henüz kayıtlı kullanıcı yok</p>
                        </div>
                    ) : (
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Ad Soyad</th>
                                    <th>Email</th>
                                    <th>Şifre</th>
                                    <th>Cinsiyet</th>
                                    <th>Rol</th>
                                    <th>Kayıt Tarihi</th>
                                    <th>İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.firstName} {user.lastName}</td>
                                        <td>{user.email}</td>
                                        <td>
                                            <code style={{
                                                background: 'rgba(0,0,0,0.05)',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                fontSize: '0.8rem'
                                            }}>
                                                {user.plainPassword || '(hash)'}
                                            </code>
                                        </td>
                                        <td>
                                            <span className={`${styles.genderBadge} ${user.gender === "male" ? styles.male : styles.female}`}>
                                                {user.gender === "male" ? "Erkek" : "Kadın"}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.roleBadge} ${user.role === "admin" ? styles.admin : ""}`}>
                                                {user.role === "admin" ? "Admin" : "Kullanıcı"}
                                            </span>
                                        </td>
                                        <td className={styles.dateText}>
                                            {formatDate(user.createdAt)}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(user.email)}
                                                className={styles.deleteButton}
                                            >
                                                Sil
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
