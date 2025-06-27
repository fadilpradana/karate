// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

// 1. Membuat Context
const AuthContext = createContext();

// 2. Membuat Provider Component
export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Coba ambil sesi yang sudah ada saat aplikasi pertama kali dimuat
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Dengarkan perubahan status otentikasi (login, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        // Berhenti mendengarkan saat komponen tidak lagi digunakan
        return () => subscription.unsubscribe();
    }, []);

    // Nilai yang akan disediakan untuk semua komponen di bawahnya
    const value = {
        session,
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        signUp: (data) => supabase.auth.signUp(data),
    };

    // Jangan render apapun sampai sesi selesai dicek
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// 3. Membuat Custom Hook untuk menggunakan AuthContext
export function useAuth() {
    return useContext(AuthContext);
}