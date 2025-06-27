// src/pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext.jsx"; // Pastikan path ini benar
import { supabase } from "../supabaseClient";
import Toast from '../components/Toast'; // Import komponen Toast yang baru

// Komponen Pembantu untuk Form Edit Pengguna (Didaur Ulang untuk Penggunaan Umum)
const UserEditForm = ({ userProfile, onSave, onCancel, loading, isEditingSelf = false }) => {
  const [formData, setFormData] = useState({
    nama_lengkap: userProfile.nama_lengkap || "",
    npt: userProfile.npt || "",
    kelas: userProfile.kelas || "",
    phone: userProfile.phone || "",
    role: userProfile.role || "",
  });

  // Effect untuk memperbarui formData jika userProfile berubah
  useEffect(() => {
    setFormData({
      nama_lengkap: userProfile.nama_lengkap || "",
      npt: userProfile.npt || "",
      kelas: userProfile.kelas || "",
      phone: userProfile.phone || "",
      role: userProfile.role || "",
    });
  }, [userProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(userProfile.id, formData);
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.4, ease: "easeOut" },
    },
    exit: {
      opacity: 0,
      y: 50,
      scale: 0.95,
      transition: { duration: 0.3, ease: "easeIn" },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div
        className="relative p-6 bg-gray-800 rounded-lg shadow-xl border border-gray-700 w-full max-w-md mx-auto"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()} // Cegah penutupan saat mengklik di dalam modal
        style={{
          background: "rgba(30, 41, 59, 0.7)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: `
            0px 4px 20px rgba(0, 0, 0, 0.4),
            inset 1px 1px 5px rgba(255, 255, 255, 0.2),
            inset -1px -1px 5px rgba(0, 0, 0, 0.2),
            0 0 25px rgba(255, 159, 28, 0.4)
          `,
        }}
      >
        <h3 className="text-xl font-semibold mb-4 text-[#FF9F1C] text-center">
          {isEditingSelf ? "Edit Profil Anda" : `Edit Pengguna: ${userProfile.nama_lengkap || userProfile.email}`}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Nama Lengkap:
            </label>
            <input
              type="text"
              name="nama_lengkap"
              value={formData.nama_lengkap}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FF9F1C] focus:border-[#FF9F1C] sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              NPT:
            </label>
            <input
              type="text"
              name="npt"
              value={formData.npt}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FF9F1C] focus:border-[#FF9F1C] sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Kelas:
            </label>
            <input
              type="text"
              name="kelas"
              value={formData.kelas}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FF9F1C] focus:border-[#FF9F1C] sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">
              Nomor Telepon:
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#FF9F1C] focus:border-[#FF9F1C] sm:text-sm"
            />
          </div>
          {/* Input Role hanya ditampilkan jika bukan mengedit diri sendiri (artinya admin yang mengedit) */}
          {!isEditingSelf && (
            <div>
              <label className="block text-sm font-medium text-gray-300">
                Role:
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-[#FF9F1C] focus:border-[#FF9F1C] sm:text-sm"
              >
                <option value="anggota">Anggota</option>
                <option value="admin">Admin</option>
                <option value="pengurus">Pengurus</option>
              </select>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition duration-200"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#FF9F1C] text-white rounded-md hover:bg-[#E08F00] transition duration-200"
              disabled={loading}
            >
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// Fungsi pembantu untuk mengkapitalkan huruf pertama
const capitalizeFirstLetter = (string) => {
  if (!string) return "";
  return string.charAt(0).toUpperCase() + string.slice(1);
};

const Dashboard = () => {
  // Pastikan fetchUserProfile didestrukturisasi di sini
  const { user, profile, loadingAuth, errorAuth, fetchUserProfile } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editingSelf, setEditingSelf] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [toast, setToast] = useState(null); // State baru untuk toast

  // Varian animasi
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.3,
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Fungsi untuk menampilkan toast
  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  // Fungsi untuk menutup toast
  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  // Fungsi untuk mengambil semua pengguna (hanya untuk admin)
  const fetchAllUsers = useCallback(async () => {
    if (!user || profile?.role !== "admin") {
      setAllUsers([]);
      return;
    }

    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) throw error;
      setAllUsers(data);
    } catch (err) {
      console.error("Error fetching all users:", err.message);
      setErrorUsers("Gagal memuat daftar pengguna: " + err.message);
      showToast("Gagal memuat daftar pengguna.", "error"); // Tampilkan toast error
    } finally {
      setLoadingUsers(false);
    }
  }, [user, profile, showToast]);

  // Fungsi untuk memperbarui profil pengguna (admin & pengguna biasa)
  const handleUpdateUser = useCallback(
    async (userId, updatedData) => {
      setSavingUser(true);
      setErrorUsers(null);
      try {
        const dataToUpdate = { ...updatedData };
        if (editingSelf) {
          delete dataToUpdate.role; // Pengguna tidak bisa mengubah peran mereka sendiri
        }

        const { data, error } = await supabase
          .from("profiles")
          .update(dataToUpdate)
          .eq("id", userId)
          .select();

        if (error) throw error;

        if (!editingSelf && profile?.role === "admin") {
          // Jika admin mengedit pengguna lain
          setAllUsers((prevUsers) =>
            prevUsers.map((u) => (u.id === userId ? data[0] : u))
          );
          showToast("Profil pengguna berhasil diperbarui!", "success"); // Toast sukses untuk admin
        } else if (editingSelf) {
          // Jika pengguna mengedit dirinya sendiri
          await fetchUserProfile(); // Panggil fetchUserProfile tanpa ID, karena AuthContext akan menggunakan user.id dari state-nya
          showToast("Profil Anda berhasil diperbarui!", "success"); // Toast sukses untuk diri sendiri
        }

        // Tutup form edit setelah berhasil, baik admin atau pengguna biasa
        setEditingUser(null);
        setEditingSelf(false);
        console.log("User updated successfully:", data);
      } catch (err) {
        console.error("Error updating user:", err.message);
        setErrorUsers("Gagal memperbarui pengguna: " + err.message);
        showToast("Gagal memperbarui profil: " + err.message, "error"); // Toast error
      } finally {
        setSavingUser(false);
      }
    },
    [editingSelf, profile, fetchUserProfile, showToast] // fetchUserProfile adalah dependensi
  );

  useEffect(() => {
    if (profile?.role === "admin") {
      fetchAllUsers();
    } else {
      setAllUsers([]);
    }
  }, [profile, fetchAllUsers]);

  // Handler untuk membuka modal edit profil sendiri
  const handleEditSelf = () => {
    setEditingSelf(true);
    setEditingUser(profile); // Menggunakan profil yang sedang login sebagai data awal
  };

  // Handler untuk membatalkan edit
  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditingSelf(false);
  };

  // Tampilan Loading
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#0E0004] text-white p-8 flex flex-col items-center justify-center">
        <p className="text-lg animate-pulse">Memuat data pengguna dan profil...</p>
      </div>
    );
  }

  // Tampilan Error Autentikasi
  if (errorAuth) {
    return (
      <div className="min-h-screen bg-[#0E0004] text-white p-8 flex flex-col items-center justify-center">
        <p className="text-red-500 text-lg p-4 bg-red-900/20 rounded-md border border-red-500">
          Terjadi kesalahan autentikasi: {errorAuth}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0004] text-white p-8 flex flex-col items-center justify-center pt-24 md:pt-32">
      <motion.div
        className="max-w-6xl w-full text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-[#FF9F1C]">
          Selamat Datang di Dashboard
        </h1>

        {profile?.role === "admin" ? (
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {/* Tampilan Profil Pengguna Biasa (untuk admin) */}
            {profile && (
              <motion.div
                className="p-6 rounded-xl shadow-lg border border-white/30 backdrop-blur-md bg-white/10 mb-8 md:mb-0 md:w-1/2 flex flex-col"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                style={{
                  boxShadow: `
                    0px 4px 10px rgba(0, 0, 0, 0.2),
                    inset 1px 1px 3px rgba(255, 255, 255, 0.15),
                    inset -1px -1px 3px rgba(0, 0, 0, 0.1),
                    0 0 15px rgba(255, 159, 28, 0.3)
                  `,
                }}
              >
                <h2 className="text-2xl font-semibold mb-4 text-[#FF9F1C]">
                  Informasi Profil Anda
                </h2>
                <div className="space-y-3 text-left flex-grow">
                  {profile.nama_lengkap && (
                    <p className="flex flex-col md:flex-row items-start md:items-center">
                      <strong className="text-white min-w-[150px]">
                        Nama Lengkap:
                      </strong>{" "}
                      <span className="text-gray-200">{profile.nama_lengkap}</span>
                    </p>
                  )}
                  {profile.npt && (
                    <p className="flex flex-col md:flex-row items-start md:items-center">
                      <strong className="text-white min-w-[150px]">NPT:</strong>{" "}
                      <span className="text-gray-200">{profile.npt}</span>
                    </p>
                  )}
                  {profile.kelas && (
                    <p className="flex flex-col md:flex-row items-start md:items-center">
                      <strong className="text-white min-w-[150px]">Kelas:</strong>{" "}
                      <span className="text-gray-200">{profile.kelas}</span>
                    </p>
                  
                  )}
                  {profile.phone && (
                    <p className="flex flex-col md:flex-row items-start md:items-center">
                      <strong className="text-white min-w-[150px]">
                        Nomor Telepon:
                      </strong>{" "}
                      <span className="text-gray-200">
                        {profile.phone}
                      </span>
                    </p>
                  )}
                  {profile.role && (
                    <p className="flex flex-col md:flex-row items-start md:items-center">
                      <strong className="text-white min-w-[150px]">Role:</strong>{" "}
                      <span className="text-gray-200">
                        {capitalizeFirstLetter(profile.role)}
                      </span>{" "}
                    </p>
                  )}
                  {user?.email && (
                    <p className="flex flex-col md:flex-row items-start md:items-center">
                      <strong className="text-white min-w-[150px]">Email:</strong>{" "}
                      <span className="text-gray-200">{user.email}</span>
                    </p>
                  )}
                  {profile.created_at && (
                    <p className="flex flex-col md:flex-row items-start md:items-center text-sm text-gray-400 mt-4">
                      <strong className="text-white min-w-[150px]">
                        Bergabung Sejak:
                      </strong>{" "}
                      {new Date(profile.created_at).toLocaleDateString("id-ID", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
                {/* Tombol Edit Profil Anda untuk admin (sekarang di kiri) */}
                <div className="mt-6 text-left">
                  <button
                    onClick={handleEditSelf}
                    className="
                      px-5 py-2 rounded-md transition duration-200 flex-none
                      bg-white/10 text-white border border-white/20
                      hover:bg-white/20 hover:border-white/30
                      shadow-md backdrop-blur-sm
                    "
                    style={{
                      boxShadow: `
                        0 2px 5px rgba(0, 0, 0, 0.2),
                        inset 0 0 5px rgba(255, 255, 255, 0.1)
                      `,
                    }}
                  >
                    Edit Profil Anda
                  </button>
                </div>
              </motion.div>
            )}

            {/* Admin Dashboard Section */}
            <motion.div
              className="p-6 rounded-xl shadow-lg border border-white/30 backdrop-blur-md bg-white/10 md:w-1/2 flex flex-col"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              style={{
                boxShadow: `
                  0px 4px 10px rgba(0, 0, 0, 0.2),
                  inset 1px 1px 3px rgba(255, 255, 255, 0.15),
                  inset -1px -1px 3px rgba(0, 0, 0, 0.1),
                  0 0 15px rgba(255, 159, 28, 0.3)
                `,
              }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-[#FF9F1C]">
                Admin Panel - Manajemen Pengguna
              </h2>
              {loadingUsers ? (
                <p>Memuat daftar pengguna...</p>
              ) : errorUsers ? (
                <p className="text-red-500">Error: {errorUsers}</p>
              ) : (
                <div className="overflow-x-auto flex-grow">
                  <table className="min-w-full bg-transparent border border-gray-700 rounded-md">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b border-gray-700 text-left text-sm font-semibold text-gray-300">
                          Nama Lengkap
                        </th>
                        <th className="px-4 py-2 border-b border-gray-700 text-left text-sm font-semibold text-gray-300">
                          NPT
                        </th>
                        <th className="px-4 py-2 border-b border-gray-700 text-left text-sm font-semibold text-gray-300">
                          Nomor Telepon
                        </th>
                        <th className="px-4 py-2 border-b border-gray-700 text-left text-sm font-semibold text-gray-300">
                          Role
                        </th>
                        <th className="px-4 py-2 border-b border-gray-700 text-left text-sm font-semibold text-gray-300">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.length > 0 ? (
                        allUsers.map((u) => (
                          <tr
                            key={u.id}
                            className="hover:bg-white/5 transition-colors duration-200"
                          >
                            <td className="px-4 py-2 border-b border-gray-700 text-sm text-gray-200">
                              {u.nama_lengkap || "N/A"}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-700 text-sm text-gray-200">
                              {u.npt || "N/A"}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-700 text-sm text-gray-200">
                              {u.phone || "N/A"}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-700 text-sm text-gray-200">
                              {capitalizeFirstLetter(u.role || "N/A")}
                            </td>
                            <td className="px-4 py-2 border-b border-gray-700 text-sm">
                              <button
                                onClick={() => {
                                  setEditingSelf(false);
                                  setEditingUser(u);
                                }}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 text-xs"
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-4 py-2 text-center text-gray-400"
                          >
                            Tidak ada pengguna lain.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        ) : (
          /* Tampilan Profil Pengguna Biasa (non-admin) */
          profile ? (
            <motion.div
              className="p-6 rounded-xl shadow-lg border border-white/30 backdrop-blur-md bg-white/10 mb-8 flex flex-col"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              style={{
                boxShadow: `
                  0px 4px 10px rgba(0, 0, 0, 0.2),
                  inset 1px 1px 3px rgba(255, 255, 255, 0.15),
                  inset -1px -1px 3px rgba(0, 0, 0, 0.1),
                  0 0 15px rgba(255, 159, 28, 0.3)
                `,
              }}
            >
              <h2 className="text-2xl font-semibold mb-4 text-[#FF9F1C]">
                Informasi Profil Anda
              </h2>
              <div className="space-y-3 text-left flex-grow">
                {profile.nama_lengkap && (
                  <p className="flex flex-col md:flex-row items-start md:items-center">
                    <strong className="text-white min-w-[150px]">
                      Nama Lengkap:
                    </strong>{" "}
                    <span className="text-gray-200">{profile.nama_lengkap}</span>
                  </p>
                )}
                {profile.npt && (
                  <p className="flex flex-col md:flex-row items-start md:items-center">
                    <strong className="text-white min-w-[150px]">NPT:</strong>{" "}
                    <span className="text-gray-200">{profile.npt}</span>
                  </p>
                )}
                {profile.kelas && (
                  <p className="flex flex-col md:flex-row items-start md:items-center">
                    <strong className="text-white min-w-[150px]">Kelas:</strong>{" "}
                    <span className="text-gray-200">{profile.kelas}</span>
                  </p>
                )}
                {profile.phone && (
                  <p className="flex flex-col md:flex-row items-start md:items-center">
                    <strong className="text-white min-w-[150px]">
                      Nomor Telepon:
                    </strong>{" "}
                    <span className="text-gray-200">
                      {profile.phone}
                    </span>
                  </p>
                )}
                {profile.role && (
                  <p className="flex flex-col md:flex-row items-start md:items-center">
                    <strong className="text-white min-w-[150px]">Role:</strong>{" "}
                    <span className="text-gray-200">
                      {capitalizeFirstLetter(profile.role)}
                    </span>{" "}
                  </p>
                )}
                {user?.email && (
                  <p className="flex flex-col md:flex-row items-start md:items-center">
                    <strong className="text-white min-w-[150px]">Email:</strong>{" "}
                    <span className="text-gray-200">{user.email}</span>
                  </p>
                )}
                {profile.created_at && (
                  <p className="flex flex-col md:flex-row items-start md:items-center text-sm text-gray-400 mt-4">
                    <strong className="text-white min-w-[150px]">
                      Bergabung Sejak:
                    </strong>{" "}
                    {new Date(profile.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                )}
              </div>
              <div className="mt-6 text-left">
                <button
                  onClick={handleEditSelf}
                  className="
                    px-5 py-2 rounded-md transition duration-200 flex-none
                    bg-white/10 text-white border border-white/20
                    hover:bg-white/20 hover:border-white/30
                    shadow-md backdrop-blur-sm
                  "
                  style={{
                    boxShadow: `
                      0 2px 5px rgba(0, 0, 0, 0.2),
                      inset 0 0 5px rgba(255, 255, 255, 0.1)
                    `,
                  }}
                >
                  Edit Profil Anda
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="p-6 rounded-xl shadow-lg border border-white/30 backdrop-blur-md bg-white/10"
            >
              <p className="text-lg text-gray-300">
                Anda belum login atau data profil tidak ditemukan.
                <br />
                Silakan login atau daftar untuk melihat dashboard Anda.
              </p>
            </motion.div>
          )
        )}
      </motion.div>

      {/* Render UserEditForm sebagai modal jika editingUser disetel ATAU editingSelf disetel */}
      <AnimatePresence>
        {(editingUser || editingSelf) && (
          <UserEditForm
            userProfile={editingSelf ? profile : editingUser}
            onSave={handleUpdateUser}
            onCancel={handleCancelEdit}
            loading={savingUser}
            isEditingSelf={editingSelf}
          />
        )}
      </AnimatePresence>

      {/* Render Toast notifikasi */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </div>
  );
};

export default Dashboard;