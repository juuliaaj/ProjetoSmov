import { useState } from "react";
import "./LoginPage.css";
import { toast, ToastContainer } from "react-toastify";
import fetcher from "../utils/fetcher";
import { TOAST_CONFIG } from "../utils/toast";

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
    <section className="containerPrincipal">
      <div className={`card ${activeForm === "login" ? "loginActive" : "cadastroActive"}`}>
        <div className={`esquerda ${activeForm === "login" ? "secaoAtiva" : ""}`}>
          <div className="formLogin">
            <img className="logo" src="/img/logoSmov.png" alt="Logo Smov" />
            <form onSubmit={handleLogin}>
              <input type="email" onChange={handleChangeValues} value={values.email} name="email" placeholder="E-mail" required />
              <input type="password" onChange={handleChangeValues} value={values.password} name="password" placeholder="Senha" required />
              <button type="submit" disabled={loading}>Entrar</button>
            </form>
          </div>
          <div className="facaLogin">
            <h1>Já tem uma conta?</h1>
            <p>Bem-vindo de volta! Continue explorando oportunidades de fazer a diferença.</p>
            <button onClick={toggleFormMode}>Fazer Login</button>
          </div>
        </div>

        <div className={`direita ${activeForm === "cadastro" ? "secaoAtiva" : ""}`}>
          <div className="formCadastro">
            <img className="logo" src="/img/logoSmov.png" alt="Logo Smov" />
            <form onSubmit={handleCadastro}>
              <input type="text" onChange={handleChangeValues} value={values.name} name="name" placeholder="Nome" required />
              <input type="email" onChange={handleChangeValues} value={values.email} name="email" placeholder="E-mail" required />
              <input type="password" onChange={handleChangeValues} value={values.password} name="password" placeholder="Senha" required />
              <input type="password" onChange={handleChangeValues} value={values.passwordConfirm} name="passwordConfirm" placeholder="Confira sua Senha" required />
              <button type="submit" disabled={loading}>Cadastrar</button>
            </form>
          </div>
          <div className="facaCadastro">
            <h1>Não tem uma conta?</h1>
            <p>
              Faça parte da mudança. Encontre e apoie ONGs que transformam vidas todos os dias!</p>
            <button onClick={toggleFormMode}>Cadastre-se</button>
          </div>
        </div>
      </div>

      <ToastContainer />
    </section>
  );
}
