import { useState } from "react";
import Logo from "../components/Logo";

import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const [activeForm, setActiveForm] = useState("cadastro");

  const toggleFormMode = () => setActiveForm((prev) => (prev === "login" ? "cadastro" : "login"));

  const handleLogin = (e) => {
    // Implementar lógica de login aqui
    e.preventDefault();
    alert("Login enviado");
  }

  const handleCadastro = (e) => {
    // Implementar lógica de cadastro aqui
    e.preventDefault();
    alert("Cadastro enviado");
  }

  return (
    <section className={styles.containerPrincipal}>
      <div className={`${styles.card} ${activeForm === "login" ? styles.loginActive : styles.cadastroActive}`}>
        <div className={`${styles.esquerda} ${activeForm === "login" ? styles.secaoAtiva : ""}`}>
          <div className={styles.formLogin}>
            <Logo />
            <form className={styles.form} onSubmit={handleLogin}>
              <input className={styles.input} name="email" type="email" placeholder="E-mail" required />
              <input className={styles.input} name="password"  type="password" placeholder="Senha" required />
              <button className={`${styles.buttonSubmit} ${styles.button}`} type="submit">Entrar</button>
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
              <input className={styles.input} name="name" type="text" placeholder="Nome" required />
              <input className={styles.input} name="email" type="email" placeholder="E-mail" required />
              <input className={styles.input} name="password" type="password" placeholder="Senha" required />
              <input className={styles.input} name="confirmPassword" type="password" placeholder="Confirme sua Senha" required />
              <button className={`${styles.buttonSubmit} ${styles.button}`} type="submit">Cadastrar</button>
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
    </section>
  );
}
