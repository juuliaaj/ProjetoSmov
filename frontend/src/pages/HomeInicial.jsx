import { useState, useEffect, useCallback } from "react";
import styles from "./HomeInicial.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import usePermissions from "../hooks/usePermissions";

const HomeInicial = () => {
  const [permissions] = usePermissions();
  const [currentSlide, setCurrentSlide] = useState(0);

  const images = [
    "/img/doacao.jpg",
    "/img/educacao.jpg",
    "/img/banner.jpg"
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
        nextSlide();
    }, 5000);

    return () => {
        clearTimeout(timeout);
    }
  }, [currentSlide, nextSlide]);

  return (
    <div className={styles.homeInicial}>
      <Header isLoggedIn={permissions?.loggedIn} />

      <section className={styles.hero}  style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${images[currentSlide]}')` }}>
        <div className={styles.hero_content}>
          <h1>
            Bem-vindo ao <br />
            <img src="/img/logoSmov.png" alt="Logo SMOV" className={styles.logo} />
          </h1>
          <p>Seja parte dessa nossa rede de amor e cuidado!</p>
          <button className={styles.prev} onClick={prevSlide}>&#10094;</button>
          <button className={styles.next} onClick={nextSlide}>&#10095;</button>
        </div>
      </section>

      {permissions?.loggedIn && (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <button className={styles.botaoCadastroOng}>Quero cadastrar minha ONG</button>
        </div>
      )}

      <section className={styles.sobre}>
        <h2>Conheça o SMOV</h2>
        <p>
          O SMOV - Sistema de Mapeamento de ONGs do Vale do Sinos é uma iniciativa inovadora
          desenvolvida para revolucionar a forma de visualização e engajamento com organizações não
          governamentais da região.
        </p>
        <p>
          O SMOV propõe a criação de um site interativo onde os usuários poderão acessar facilmente
          informações sobre as organizações, promover iniciativas sociais e divulgar seus projetos,
          trabalhos e necessidades. A tecnologia será uma aliada na conexão entre pessoas e causas importantes.
        </p>
      </section>

      <section className={styles.beneficios}>
  <div className={styles.cardBeneficio}>
    <h3>👤 Para Voluntários</h3>
    <p>Encontre ONGs verificadas, leia suas missões e contribua de forma segura e efetiva.</p>
    <ul>
      <li>🔍 Busca Inteligente por Localização</li>
      <li>📅 Sistema de Reservas</li>
      <li>💳 Doações Seguras</li>
    </ul>
  </div>

  <div className={styles.cardBeneficio}>
    <h3>📍 Para ONGs</h3>
    <p>Aumente a visibilidade e desfrute de ferramentas para conectar-se com voluntários</p>
    <ul>
      <li>✅ Verificação Confiável</li>
      <li>🧑‍💻 Gestão de Voluntário</li>
      <li>🌍 Visibilidade Nacional</li>
    </ul>
  </div>
</section>

      <section className={styles.apoie_ongs}>
        <div className={styles.grid}>
          <div>
            <img src="/img/criancas.jpg" alt="Crianças" />
            <button>Apoie ONG de Crianças</button>
          </div>
          <div>
            <img src="/img/animais.jpg" alt="Animais" />
            <button>Apoie ONG de Animais</button>
          </div>
          <div>
            <img src="/img/ambiental.jpg" alt="Ambiente" />
            <button>Apoie ONGs Ambientais</button>
          </div>
          <div>
            <img src="/img/saude.jpg" alt="Saúde" />
            <button>Apoie ONG de Saúde</button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomeInicial;
