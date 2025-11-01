import { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./HomeInicial.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import usePermissions from "../hooks/usePermissions";
import { Link } from "react-router-dom";
import fetcher from "../utils/fetcher";

import { User, Search, Calendar, CreditCard, MapPin, CheckCircle, Laptop, Globe } from "lucide-react";

const HomeInicial = () => {
  const images = useMemo(() => [
    "/img/doacao.jpg",
    "/img/educacao.jpg",
    "/img/banner.jpg"
  ], []);

  const [permissions] = usePermissions();
  const [cadastroStatus, setCadastroStatus] = useState('N');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeSlide, setActiveSlide] = useState({
    main: images[0],
    alt: images[0]
  });

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

    setActiveSlide((prev) => ({
      ...prev,
      alt: images[currentSlide]
    }));

    document.getElementById("alt-background").style.opacity = 1;

    const fadeTimeout = setTimeout(() => {
      setActiveSlide((prev) => ({
        ...prev,
        main: prev.alt,
      }));
      document.getElementById("alt-background").style.opacity = 0;
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(fadeTimeout);
    };
  }, [currentSlide, images, nextSlide, setActiveSlide]);

  useEffect(() => {
    if (!permissions?.loggedIn) return;

    fetcher.get('/instituicoes/cadastroStatus')
      .then(response => {
        if (response.data && response.data.data) {
          setCadastroStatus(response.data.data.status);
        } else {
          setCadastroStatus(null);
        }
      })
      .catch(error => {
        console.error("Erro ao verificar status do cadastro da ONG:", error);

        setCadastroStatus(null);
      });
  }, [permissions?.loggedIn]);

  return (
    <div className={styles.homeInicial}>
      <Header permissions={permissions} />

      <section className={styles.hero}>
        <div
          id="main-background"
          className={styles.hero_bg}
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${activeSlide.main}')`,
          }}
        ></div>
        <div
          id="alt-background"
          className={styles.hero_bg}
          style={{
            opacity: 0,
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('${activeSlide.alt}')`,
          }}
        ></div>

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

      {permissions?.loggedIn && !cadastroStatus ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <Link to="/cadastro">
            <button className={styles.botaoCadastroOng}>Quero cadastrar minha ONG</button>
          </Link>
          
        </div>
      ) : cadastroStatus === 'A' ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <span className={`${styles.statusCadastroOng} ${styles.cadastroAndamento}`}>Seu cadastro de ONG está em análise. Em breve traremos novidades!</span>
        </div>
      ) : cadastroStatus === 'R' ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <span className={`${styles.statusCadastroOng} ${styles.cadastroRecusado}`}>Infelizmente, seu cadastro de ONG foi recusado. Para mais informações, entre em contato conosco.</span>
        </div>
      ) : cadastroStatus === 'F' ? (
        <div style={{ textAlign: "center", margin: "40px 0" }}>
          <span className={`${styles.statusCadastroOng}`}>Seu cadastro de ONG foi aprovado! Agora você pode gerenciar sua organização.</span>
        </div>
      ) : null}

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
          <h3><User size={22} /> Para Voluntários</h3>
          <p>Encontre ONGs verificadas, leia suas missões e contribua de forma segura e efetiva.</p>
          <ul>
            <li><Search size={18} /> Busca Inteligente por Localização</li>
            <li><Calendar size={18} /> Sistema de Reservas</li>
            <li><CreditCard size={18} /> Doações Seguras</li>
          </ul>
        </div>

        <div className={styles.cardBeneficio}>
          <h3><MapPin size={22} /> Para ONGs</h3>
          <p>Aumente a visibilidade e desfrute de ferramentas para conectar-se com voluntários</p>
          <ul>
            <li><CheckCircle size={18} /> Verificação Confiável</li>
            <li><Laptop size={18} /> Gestão de Voluntário</li>
            <li><Globe size={18} /> Visibilidade Nacional</li>
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
