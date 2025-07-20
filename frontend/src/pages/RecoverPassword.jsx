import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import fetcher from "../utils/fetcher";
import { TOAST_CONFIG } from "../utils/toast";
import styles from "./RecoverPassword.module.css";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Digite um e-mail válido.", TOAST_CONFIG);
      return;
    }

    const notify = toast.loading("Aguarde um momento...", TOAST_CONFIG);
    setLoading(true);

    try {
      const response = await fetcher.post('/auth/recuperar-senha', { email });

      if (response.status === 200) {
        toast.update(notify, {
          render: "Instruções enviadas ao seu e-mail.",
          type: "success",
          isLoading: false,
        });
        setSuccess(true);
        setEmail("");
        setTimeout(() => window.location.href = "/login", 3000);
      } else {
        toast.update(notify, {
          render: "Erro ao solicitar recuperação de senha.",
          type: "error",
          isLoading: false,
        });
      }
    } catch (error) {
      console.error(error);
      toast.update(notify, {
        render: error.response?.data?.message || "Erro ao solicitar recuperação de senha.",
        type: "error",
        isLoading: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.containerPrincipal}>
      <div className={styles.card}>
        <div className={styles.formRecover}>
          <img className={styles.logo} src="/img/logoSmov.png" alt="Logo Smov" />
          <h1 className={styles.title}>Recuperar Senha</h1>
          <p className={styles.text}>
            Digite seu e-mail para receber as instruções de recuperação de senha.
          </p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="email"
              placeholder="Seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              aria-label="E-mail para recuperação"
              className={styles.input}
            />
            <button type="submit" disabled={loading || success} className={styles.button}>
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </form>
          {success && (
            <p className={styles.successMessage}>
              Verifique sua caixa de entrada para prosseguir.
            </p>
          )}
        </div>
      </div>
      <ToastContainer />
    </section>
  );
}
