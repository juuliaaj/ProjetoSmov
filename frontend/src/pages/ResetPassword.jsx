import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import styles from "./ResetPassword.module.css";
import supabase from "../utils/supabase";
import { TOAST_CONFIG } from "../utils/toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");

  useEffect(() => {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");
    const refreshToken = params.get("refresh_token")

    if (!token || !refreshToken) {
      toast.error("Token inválido ou ausente.", TOAST_CONFIG);
      navigate("/login");
    }

    setAccessToken(token);
    setRefreshToken(refreshToken);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      toast.error("As senhas não coincidem.", TOAST_CONFIG);
      return;
    }

    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.", TOAST_CONFIG);
      return;
    }

    setLoading(true);
    const notify = toast.loading("Aguarde, redefinindo senha...", TOAST_CONFIG);

    try {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      
      if (error) throw error;

      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) throw updateError;

      toast.update(notify, { render: "Senha redefinida com sucesso!", type: "success", isLoading: false });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error(error);
      toast.update(notify, { render: "Erro ao redefinir senha.", type: "error", isLoading: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.containerPrincipal}>
      <div className={styles.card}>
        <img className={styles.logo} src="/img/logoSmov.png" alt="Logo Smov" />
        <h1>Redefinir Senha</h1>
        <p>Insira sua nova senha abaixo para redefinir o acesso à sua conta.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Confirme a nova senha"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            Redefinir Senha
          </button>
        </form>
        <ToastContainer />
      </div>
    </section>
  );
}
