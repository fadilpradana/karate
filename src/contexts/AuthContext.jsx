// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [errorAuth, setErrorAuth] = useState(null);

    // ✅ Perbaikan: fetchUserProfile sekarang secara eksplisit memeriksa user?.id
    // Ini memastikan bahwa fetchUserProfile hanya mencoba mengambil profil jika ada user ID yang valid.
    const fetchUserProfile = useCallback(async (userIdToFetch = null) => {
        setErrorAuth(null); // Reset error status for profile fetching
        const id = userIdToFetch || user?.id; // Prefer explicit ID, fallback to current user's ID

        if (!id) {
            console.warn("AuthContext: fetchUserProfile called without a user ID and no user in context state. Skipping profile fetch.");
            setProfile(null); // Ensure profile is null if no valid ID
            return;
        }
        console.log(`AuthContext: Attempting to fetch profile for ID: ${id}`); // Log untuk debugging

        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", id)
                .single();

            // Handle 'no rows found' gracefully (PGRST116)
            if (error && error.code === 'PGRST116') {
                console.warn(`AuthContext: No profile found for user ID: ${id}. Data:`, data);
                setProfile(null); // Set profile to null if not found
                return;
            }
            if (error) {
                throw error;
            }
            setProfile(data); // data will be null if no profile found (PGRST116)
            console.log("AuthContext: Profile fetched successfully:", data); // Log sukses
        } catch (err) {
            console.error("AuthContext: Error fetching user profile:", err.message);
            setErrorAuth("Failed to load profile: " + err.message);
            setProfile(null);
        }
    }, [user]); // Dependency: user state, because it's used to determine ID

    const login = async (email, password) => {
        setLoadingAuth(true);
        setErrorAuth(null);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            setSession(data.session);
            setUser(data.user);
            console.log("AuthContext: Login successful, user:", data.user);
            if (data.user) {
                await fetchUserProfile(data.user.id); // Fetch profile immediately after login
            }
            return { success: true };
        } catch (err) {
            setErrorAuth(err.message);
            console.error("AuthContext: Login error:", err.message); // Log error
            return { success: false, error: err.message };
        } finally {
            setLoadingAuth(false);
        }
    };

    const register = async (email, password, nama_lengkap, npt, role) => {
        setLoadingAuth(true);
        setErrorAuth(null);
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        nama_lengkap: nama_lengkap,
                        npt: npt,
                        role: role,
                    },
                },
            });
            if (error) throw error;
            setSession(data.session);
            setUser(data.user);
            console.log("AuthContext: Register successful, user:", data.user);
            if (data.user) {
                // ✅ Penting: Setelah registrasi, profil baru mungkin belum langsung tersedia jika tidak ada trigger Supabase.
                // Jika Anda mengandalkan trigger Supabase untuk membuat profil saat user baru,
                // mungkin ada sedikit delay. fetchUserProfile ini akan mencoba mengambilnya.
                await fetchUserProfile(data.user.id);
            }
            return { success: true };
        } catch (err) {
            setErrorAuth(err.message);
            console.error("AuthContext: Register error:", err.message); // Log error
            return { success: false, error: err.message };
        } finally {
            setLoadingAuth(false);
        }
    };

    const logout = useCallback(async () => {
        setErrorAuth(null);
        try {
            const LOGOUT_TIMEOUT_MS = 15000; // ✅ Coba tingkatkan lagi ke 15 detik
            console.log("AuthContext: Initiating logout..."); // Log mulai logout

            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error("Permintaan logout terlalu lama. Silakan coba lagi."));
                }, LOGOUT_TIMEOUT_MS);
            });

            const { error } = await Promise.race([
                supabase.auth.signOut(),
                timeoutPromise
            ]);

            if (error) {
                if (error.message === "Auth session missing") {
                    console.warn("AuthContext: Supabase reported 'Auth session missing' during signOut. Session was likely already terminated on server. Treating as success.");
                    // Treat as success if session is already missing
                    setSession(null);
                    setUser(null);
                    setProfile(null);
                    return { success: true }; // Pastikan ini mengembalikan sukses jika sesi sudah hilang
                }
                throw error;
            }

            setSession(null);
            setUser(null);
            setProfile(null);
            console.log("AuthContext: Logout successful."); // Log sukses logout
            return { success: true };
        } catch (err) {
            setErrorAuth(err.message);
            console.error("AuthContext: Error during logout:", err.message);
            return { success: false, error: err.message };
        }
    }, []);

    useEffect(() => {
        const getInitialSession = async () => {
            setLoadingAuth(true);
            try {
                const { data: { session: currentSession }, error } = await supabase.auth.getSession();
                if (error) throw error;
                setSession(currentSession);
                setUser(currentSession?.user || null);
                console.log("AuthContext: Initial session check completed. Session:", currentSession);
                if (currentSession?.user) {
                    await fetchUserProfile(currentSession.user.id); // Call with specific ID
                } else {
                    setProfile(null);
                    console.log("AuthContext: No initial session found. Profile set to null.");
                }
            } catch (err) {
                setErrorAuth(err.message);
                console.error("AuthContext: Error getting initial session:", err.message);
            } finally {
                setLoadingAuth(false);
            }
        };

        getInitialSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, newSession) => {
                console.log("Auth State Changed Event:", _event, "New Session:", newSession);
                setSession(newSession); // Perbarui sesi
                setUser(newSession?.user || null); // Perbarui user

                if (newSession?.user) {
                    await fetchUserProfile(newSession.user.id);
                } else {
                    setProfile(null);
                    console.log("AuthContext: User signed out or session expired. Profile set to null.");
                }
            }
        );

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [fetchUserProfile]);

    const value = {
        session,
        user,
        profile,
        loadingAuth,
        errorAuth,
        login,
        register,
        logout,
        fetchUserProfile, // Pastikan ini diekspor
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};