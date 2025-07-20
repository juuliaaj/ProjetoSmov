import { useState } from "react";

import styles from "./LoginPage.module.css";

import Logo from "../components/Logo";
import { toast, ToastContainer } from "react-toastify";
import fetcher from "../utils/fetcher";
import { TOAST_CONFIG } from "../utils/toast";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [activeForm, setActiveForm] = useState("cadastro");
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirm: "",
  });

  const handleChangeValues = (event) => {
    setValues((prevValues) => ({
      ...prevValues,
      [event.target.name]: event.target.value,
    }));
  };

  const toggleFormMode = () => {

    setActiveForm((prev) => (prev === "login" ? "cadastro" : "login"));

    setValues({
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const notify = toast.loading("Aguarde um momento...", TOAST_CONFIG);

    try {
      const response = await fetcher.post('/auth/login', {
        email: values.email,
        senha: values.password
      });

      if (response.status === 200) {
        toast.update(notify, { render: "Pronto!", type: "success", isLoading: false });
        window.localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/';
      } else {
        toast.update(notify, { render: "Erro ao fazer login. Verifique suas credenciais e tente novamente.", type: "error", isLoading: false });
      }
    } catch (error) {
      console.error(error);

      toast.update(notify, { render: "Erro ao fazer login. Verifique suas credenciais e tente novamente.", type: "error", isLoading: false });
    } finally {
      setLoading(false);
    }
  }

  const handleCadastro = async (e) => {
    e.preventDefault();

    if (values.password !== values.passwordConfirm) {
      toast.error("As senhas não se coincidem.", TOAST_CONFIG);

      return;
    }

    if (values.password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.", TOAST_CONFIG);

      return;
    }

    const notify = toast.loading("Aguarde um momento...", TOAST_CONFIG);

    setLoading(true);

    try {
      const response = await fetcher.post('/auth/cadastro', {
        email: values.email,
        senha: values.password,
        nome: values.name
      });

      if (response.status === 201) {
        toast.update(notify, { render: "Pronto!", type: "success", isLoading: false });
        window.localStorage.setItem('user', JSON.stringify(response.data.user));
        window.location.href = '/';
      } else {
        toast.update(notify, { render: "Erro ao fazer cadastro. Tente novamente mais tarde.", type: "error", isLoading: false });
      }
    } catch (error) {
      console.error(error);

      toast.update(notify, { render: "Erro ao fazer cadastro. Tente novamente mais tarde.", type: "error", isLoading: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.containerPrincipal}>
      <div className={`${styles.card} ${activeForm === "login" ? styles.loginActive : styles.cadastroActive}`}>
        <div className={`${styles.esquerda} ${activeForm === "login" ? styles.secaoAtiva : ""}`}>
          <div className={styles.formLogin}>
            <Logo />
            <form className={styles.form} onSubmit={handleLogin}>
              <input className={styles.input} onChange={handleChangeValues} value={values.email} name="email" type="email" placeholder="E-mail" required />
              <input className={styles.input} onChange={handleChangeValues} value={values.password} name="password"  type="password" placeholder="Senha" required />
              <button className={`${styles.buttonSubmit} ${styles.button}`} type="submit" disabled={loading}>Entrar</button>
              <Link to="/recuperar" className={styles.esqueceuSenha}>Esqueceu a senha?</Link> 
            </form>
          </div>
          <div className={styles.facaLogin}>
            <h1>Já tem uma conta?</h1>
            <p>Bem-vindo de volta! Continue explorando oportunidades de fazer a diferença.</p>
            <button className={styles.button} onClick={toggleFormMode}>Fazer Login</button>
          </div>
        </div>

        <div className={`${styles.direita} ${activeForm === "cadastro" ? styles.secaoAtiva : ""}`}>
          <div className={styles.formCadastro}>
            <Logo />
            <form className={styles.form} onSubmit={handleCadastro}>
              <input className={styles.input} onChange={handleChangeValues} value={values.name} name="name" type="text" placeholder="Nome" required />
              <input className={styles.input} onChange={handleChangeValues} value={values.email} name="email" type="email" placeholder="E-mail" required />
              <input className={styles.input} onChange={handleChangeValues} value={values.password} name="password" type="password" placeholder="Senha" required />
              <input className={styles.input} onChange={handleChangeValues} value={values.passwordConfirm} name="confirmPassword" type="password" placeholder="Confirme sua Senha" required />
              <button className={`${styles.buttonSubmit} ${styles.button}`} type="submit" disabled={loading}>Cadastrar</button>
            </form>
          </div>
          <div className={styles.facaCadastro}>
            <h1>Não tem uma conta?</h1>
            <p>
              Faça parte da mudança. Encontre e apoie ONGs que transformam vidas todos os dias!</p>
            <button className={styles.button} onClick={toggleFormMode}>Cadastre-se</button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </section>
  );
}
