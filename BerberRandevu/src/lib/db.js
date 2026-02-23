import { db } from '@/lib/firebase/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where
} from 'firebase/firestore';

// ============================================
// KULLANICI İŞLEMLERİ
// Firestore koleksiyonu: "users"
// Doküman ID: email adresi
// ============================================

// Tüm kullanıcıları getir
export async function getUsers() {
    const snapshot = await getDocs(collection(db, 'users'));
    const users = [];
    snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
    });
    return users;
}

// Kullanıcı ekle
export async function addUser(user) {
    const docRef = doc(db, 'users', user.email);
    await setDoc(docRef, user);
    return user;
}

// Email ile kullanıcı bul
export async function findUserByEmail(email) {
    const docRef = doc(db, 'users', email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}

// Kullanıcı güncelle
export async function updateUser(email, updates) {
    const docRef = doc(db, 'users', email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        await updateDoc(docRef, updates);
        const updated = await getDoc(docRef);
        return { id: updated.id, ...updated.data() };
    }
    return null;
}

// Kullanıcı sil
export async function deleteUser(email) {
    const docRef = doc(db, 'users', email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        await deleteDoc(docRef);
        return true;
    }
    return false;
}

// ============================================
// BEKLEYEN DOĞRULAMALAR
// Firestore koleksiyonu: "pending_verifications"
// Doküman ID: email adresi
// ============================================

// Tüm bekleyen doğrulamaları getir
export async function getPendingVerifications() {
    const snapshot = await getDocs(collection(db, 'pending_verifications'));
    const pending = [];
    snapshot.forEach((doc) => {
        pending.push({ id: doc.id, ...doc.data() });
    });
    return pending;
}

// Bekleyen doğrulama ekle (aynı email varsa günceller)
export async function addPendingVerification(verification) {
    const docRef = doc(db, 'pending_verifications', verification.email);
    await setDoc(docRef, verification);
    return verification;
}

// Bekleyen doğrulamayı sil
export async function removePendingVerification(email) {
    const docRef = doc(db, 'pending_verifications', email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        await deleteDoc(docRef);
        return true;
    }
    return false;
}

// Email ile bekleyen doğrulama bul
export async function findPendingByEmail(email) {
    const docRef = doc(db, 'pending_verifications', email);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
}
