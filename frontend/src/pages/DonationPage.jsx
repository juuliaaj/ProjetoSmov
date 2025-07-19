import styles from "./DonationPage.module.css";
import { FaHome, FaCheckCircle } from 'react-icons/fa';
import { FaPix } from 'react-icons/fa6';
import Header from "../components/Header";
import Footer from "../components/Footer";

const DonationPage = () => {
    return (
        <div className={styles.donationPage}>
           <Header />

            <section className={styles.hero}>
                <div className={styles.hero_image}>
                    <img src="/img/Cachorro.png" alt="Cachorro" />
                </div>
                <div className={styles.hero_text}>
                    <h1>Ajude uma ONG</h1>
                    <p>Contribua para Transformar Vidas: Doe Agora!</p>
                </div>
            </section>

            <section className={styles.como_doar}>
                <h2>Como doar?</h2>
                <div className={styles.doar_opcoes}>
                    <div className={styles.opcao}>
                        <FaHome size={30} className={styles.home_icon} />
                        <p>Escolha uma ONG</p>
                    </div>
                    <div className={styles.opcao}>
                        <FaPix size={30} className={styles.pix_icon} />
                        <p>Faça o PIX</p>
                    </div>
                    <div className={styles.opcao}>
                        <FaCheckCircle size={30} className={styles.check_icon} />
                        <p>Pronto!</p>
                    </div>
                </div>
                <button className={styles.botao_ong}>Escolha a ONG</button>
            </section>

            <section className={styles.mensagem}>
                <p>
                    Cada doação que você faz é mais do que apenas um gesto de generosidade; é uma promessa de um futuro melhor para os animais que precisam. Juntos, podemos garantir que eles recebam o cuidado, o amor e os suprimentos necessários para viverem com dignidade. Sua contribuição faz toda a diferença, transformando vidas e criando um mundo mais compassivo para todos os seres vivos.
                </p>
            </section>
            
            <Footer />
        </div>
    );
};

export default DonationPage;
