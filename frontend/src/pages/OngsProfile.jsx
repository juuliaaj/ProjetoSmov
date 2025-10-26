import { Calendar, Users, Tag } from 'lucide-react';
import styles from './OngsProfile.module.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import usePermissions from "../hooks/usePermissions";
import LogoOng from '../components/LogoOng';     

function OngsProfile() {
  const [permissions] = usePermissions();
  const ongData = {
    name: 'ONG',
    logo: null,
    coverImage: 'https://images.pexels.com/photos/6646917/pexels-photo-6646917.jpeg?auto=compress&cs=tinysrgb&w=1920',
    foundedDate: '17/05/2018',
    members: 50,
    category: 'Humanitária',
    description: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vestibulum urna eget sem sagittis, vitae elementum nibh convallis. Nam fringilla vehicula urcu, quis volutpat leo hendrerit at. Proin eu diam laoreet, tempor leo in, rutrum dolor. Sed quis egestas diam. Vivamus lobortis felis urna, eu efficitur risus tempus vitae. Aliquam tempus tempus quam eu ultrices. Aliquam rhoncus posuere dui, quis faucibus enim iaculis in. Aliquam volutpat nisl in dolor vehicula, a tempor velit accumsan. Proin ac diam eu nisl posuere dictum nec at dui.',
    ]
  };

  return (
    <div className={styles.container}>
      <Header permissions={permissions} />

      <main className={styles.main}>
        <div className={styles.profileSection}>
          <div className={styles.leftPanel}>
            <div className={styles.logoCircle}>
              <div className={styles.logoIcon}>
                    <LogoOng />
              </div>
            </div>

            <div className={styles.infoItem}>
              <Calendar className={styles.icon} />
              <span className={styles.infoText}>{ongData.foundedDate}</span>
            </div>

            <div className={styles.infoItem}>
              <Users className={styles.icon} />
              <span className={styles.infoText}>{ongData.members} pessoas</span>
            </div>

            <div className={styles.infoItem}>
              <Tag className={styles.icon} />
              <span className={styles.infoText}>{ongData.category}</span>
            </div>

            <div className={styles.buttonGroup}>
              <button className={styles.btnDonate}>DOAR</button>
              <button className={styles.btnVisit}>VISITAR</button>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <div className={styles.coverImage}>
              <img src={ongData.coverImage} alt="Volunteers" />
            </div>

            <div className={styles.contentArea}>
              <h1 className={styles.title}>{ongData.name}</h1>

              <div className={styles.description}>
                {ongData.description.map((paragraph, index) => (
                  <p key={index} className={styles.paragraph}>
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
        <Footer />
    </div>
  );
}

export default OngsProfile;

