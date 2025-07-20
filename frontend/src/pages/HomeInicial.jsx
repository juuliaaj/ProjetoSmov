import styles from "./HomeInicial.module.css";
import { Heart, MapPin, Calendar, Shield, CheckCircle, Settings, Eye } from 'lucide-react';
import Header from "../components/Header";
import Footer from "../components/Footer";

const HomeInicial = () => {
    return (
        <div className={styles.homeInicial}>
            <Header />

            <section className={styles.hero}>
                <div className={styles.hero_content}>
                    <h1>Bem-vindo ao <br />
                        <img src="/img/logoSmov.png" alt="Logo SMOV" className={styles.logo} />
                  </h1>

                    <p>
                        Seja parte dessa nossa rede de amor e cuidado!
                    </p>
                </div>
            </section>

            <section className={styles.conheca_smov}>
                <h2>Conheça o SMOV</h2>
                <p>
                    O SMOV - Sistema de Mapeamento de ONGs do Vale dos Sinos é uma iniciativa inovadora 
                    que busca transformar a forma como a população se conecta com organizações não-governamentais da 
                    região do Vale dos Sinos–RS. A proposta surgiu com o objetivo de facilitar o acesso à 
                    informação e incentivar o engajamento voluntário de forma prática, segura e eficiente.


                </p>
                <p>
                    O SMOV oferece um site interativo que permite aos usuários localizar ONGs em diferentes cidades da
                    região, visualizar no mapa onde estão situadas e obter detalhes como área de atuação, formas de contato,
                    fotos e horários de funcionamento. Além disso, o sistema permite que voluntários façam reservas para visitas
                    e que responsáveis por ONGs cadastrem suas instituições para ampliar sua visibilidade e impacto.
                </p>
            </section>

            <section className={styles.funcionalidades}>
                <div className={styles.funcionalidades_list}>
                    <div className={styles.list_item}>
                        <div className={styles.item_content}>
                            <h3>Para Voluntários</h3>
                            <p>
                                Se você tem vontade de fazer a diferença, nossa plataforma é o lugar ideal para começar. Encontre 
                                ONGs verificadas na sua cidade e contribua de forma segura e efetiva.
                            </p>
                        </div>
                    </div>

                    <div className={styles.list_item}>
                        <MapPin className={styles.map_icon} />
                        <div className={styles.item_content}>
                            <h2>Busca Inteligente por Localização</h2>
                            <p>
                                Digite sua cidade e descubra todas as ONGs verificadas da região no mapa interativo.
                            </p>
                        </div>
                    </div>

                    <div className={styles.list_item}>
                        <Calendar className={styles.calendar_icon} />
                        <div className={styles.item_content}>
                            <h2>Sistema de Reservas</h2>
                            <p>
                                Agende visitas, atividades de voluntariado ou participação em eventos diretamente 
                                pela plataforma.
                            </p>
                        </div>
                    </div>

                    <div className={styles.list_item}>
                        <Shield className={styles.shield_icon} />
                        <div className={styles.item_content}>
                            <h2>Doações Seguras</h2>
                            <p>
                                Faça contribuições financeiras com total segurança através de nosso sistema integrado.
                            </p>
                        </div>
                    </div>

                    <div className={styles.list_section}>
                        <div className={styles.section_content}>
                            <h3>Para ONGs</h3>
                            <p>
                                Se você representa uma organização não governamental, nossa plataforma oferece visibilidade 
                                nacional e ferramentas profissionais para conectar-se com voluntários e doadores.
                            </p>
                        </div>
                    </div>

                    <div className={styles.list_item}>
                        <CheckCircle className={styles.check_icon} />
                        <div className={styles.item_content}>
                            <h2>Verificação Confiável</h2>
                            <p>
                                Processo rigoroso que garante credibilidade e confiança para sua organização.
                            </p>
                        </div>
                    </div>

                    <div className={styles.list_item}>
                        <Settings className={styles.settings_icon} />
                        <div className={styles.item_content}>
                            <h2>Perfil Personalizado</h2>
                            <p>
                                Crie um perfil completo como um blog, conte sua história e mostre seu impacto.
                            </p>
                        </div>
                    </div>

                    <div className={styles.list_item}>
                        <Eye className={styles.eye_icon} />
                        <div className={styles.item_content}>
                            <h2>Visibilidade Nacional</h2>
                            <p>
                                Apareça no mapa para milhares de pessoas que querem ajudar na sua região.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default HomeInicial;