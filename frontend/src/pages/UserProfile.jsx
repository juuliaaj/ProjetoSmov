import { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./UserProfile.module.css";
import fetcher from "../utils/fetcher";
import { motion } from 'framer-motion'
import {
  FaIdBadge,
  FaCalendarAlt,
  FaCog,
  FaEnvelope,
  FaEdit,
  FaSave,
  FaImage,
  FaBell,
  FaLock,
  FaMoon,
  FaSun,
} from "react-icons/fa";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ nome: "", bio: "" });
  const [profileImage, setProfileImage] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [preferences, setPreferences] = useState({
    notifications: true,
    privacy: false,
  });

  useEffect(() => {
    fetchPerfil();
  }, []);

  async function fetchPerfil() {
    try {
      const res = await fetcher.get("/auth/perfil");
      const usuario = res.data?.data;
      if (usuario) {
        setUser(usuario);
        setFormData({ nome: usuario.nome, bio: usuario.bio || "" });
      }
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
      setMessage("Erro ao carregar perfil.");
    }
  }

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setProfileImage(preview);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handlePrefChange = (pref) => {
    setPreferences((prev) => ({ ...prev, [pref]: !prev[pref] }));
  };

  const handleSave = () => {
    setUser((prev) => ({ ...prev, ...formData }));
    setIsEditing(false);
    setMessage("Alterações salvas localmente!");
    setTimeout(() => setMessage(""), 3000);
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <Header />
        <main className={styles.main}>
          <div className={styles.loading}>Carregando perfil...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${styles[theme]}`}>
      <Header isLoggedIn={true} />

      <main className={styles.main}>
        <motion.div
          className={styles.profileCard}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Foto e informações principais */}
          <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatarGlow}></div>
              <label htmlFor="profileUpload" className={styles.avatarPlaceholder}>
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="avatar"
                    className={styles.profileImage}
                  />
                ) : (
                  <span className={styles.initial}>
                    {(user.nome || "U").charAt(0).toUpperCase()}
                  </span>
                )}
                <input
                  type="file"
                  id="profileUpload"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className={styles.fileInput}
                />
              </label>
              <FaImage className={styles.uploadIcon} />
            </div>

            {isEditing ? (
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                className={styles.inputEdit}
              />
            ) : (
              <h2 className={styles.name}>{user.nome}</h2>
            )}

            <p className={styles.email}>
              <FaEnvelope className={styles.icon} />{" "}
              {user.email || "Email não disponível"}
            </p>

            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Escreva uma breve bio..."
                className={styles.textarea}
              />
            ) : (
              <p className={styles.bio}>{user.bio || "Sem biografia adicionada."}</p>
            )}

            <button
              className={styles.editButton}
              onClick={isEditing ? handleSave : handleEditToggle}
            >
              {isEditing ? <FaSave /> : <FaEdit />}{" "}
              {isEditing ? "Salvar" : "Editar perfil"}
            </button>
          </div>

          {/* Informações da Conta */}
          <div className={styles.infoSection}>
            <h3 className={styles.iconTitle}>
              <FaIdBadge className={styles.icon} /> Informações da Conta
            </h3>
            <div className={styles.infoItem}>
              <span>
                <strong>ID interno:</strong> {user.id_interno}
              </span>
            </div>
            <div className={styles.infoItem}>
              <FaCalendarAlt className={styles.icon} />
              <span>
                <strong>Data de criação:</strong>{" "}
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {message && <div className={styles.message}>{message}</div>}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
