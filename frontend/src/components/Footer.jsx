import LogoCimol from './LogoCimol';

import styles from './Footer.module.css';

const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className={styles.footer_email}>
                <p>smov.map@gmail.com</p>
            </div>

            <div className={styles.footer_copy}>
                <p>© Júlia e Nicoli 2025</p>
            </div>

            <div className={styles.footer_cimol}>
                <LogoCimol />
            </div>
        </footer>
    );
};

export default Footer;