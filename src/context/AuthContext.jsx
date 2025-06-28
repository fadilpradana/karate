// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getSessionAndProfile = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();
            if (error) {
                console.error("Gagal mendapatkan sesi:", error);
            }
            setSession(session);

            if (session?.user) {
                setUser(session.user);

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) {
                    console.error("Gagal mendapatkan profil:", profileError);
                    setRole(null);
                } else {
                    setRole(profile.role);
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        };

        getSessionAndProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                setUser(session.user);

                // Fetch ulang role ketika user login/logout
                supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()
                    .then(({ data: profile, error: profileError }) => {
                        if (profileError) {
                            console.error("Gagal mendapatkan profil saat onAuthStateChange:", profileError);
                            setRole(null);
                        } else {
                            setRole(profile.role);
                        }
                    });
            } else {
                setUser(null);
                setRole(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        session,
        user,
        role,
        loading,
        signIn: (data) => supabase.auth.signInWithPassword(data),
        signOut: () => supabase.auth.signOut(),
        signUp: (data) => supabase.auth.signUp(data),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
