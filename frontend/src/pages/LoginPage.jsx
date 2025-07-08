import { useState } from "react";
import "./LoginPage.css";

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
    <section className="containerPrincipal">
      <div className={`card ${activeForm === "login" ? "loginActive" : "cadastroActive"}`}>
        <div className="esquerda">
          <div className="formLogin">
            <img className="logo" src="/img/logoSmov.png" alt="Logo Smov" />
            <form onSubmit={handleLogin}>
              <input type="email" placeholder="E-mail" required />
              <input type="password" placeholder="Senha" required />
              <button type="submit">Entrar</button>
            </form>
          </div>
          <div className="facaLogin">
            <h1>Já tem uma conta?</h1>
            <p>Bem-vindo de volta! Continue explorando oportunidades de fazer a diferença.</p>
            <button onClick={toggleFormMode}>Fazer Login</button>
          </div>
        </div>

        <div className="direita">
          <div className="formCadastro">
            <img className="logo" src="/img/logoSmov.png" alt="Logo Smov" />
            <form onSubmit={handleCadastro}>
              <input type="text" placeholder="Nome" required />
              <input type="email" placeholder="E-mail" required />
              <input type="password" placeholder="Senha" required />
              <input type="password" placeholder="Confira sua Senha" required />
              <button type="submit">Cadastrar</button>
            </form>
          </div>
          <div className="facaCadastro">
            <h1>Não tem uma conta?</h1>
            <p>
              Faça parte da mudança. Encontre e apoie ONGs que transformam vidas todos os dias</p>
            <button onClick={toggleFormMode}>Cadastre-se</button>
          </div>
        </div>
      </div>
    </section>
  );
}
