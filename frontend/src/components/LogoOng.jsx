import { Link } from 'react-router-dom';
import styles from './LogoOng.module.css';

export default function Logo() {
    return (
        <Link to="/">
            <img src="/img/LogoOng.png" alt="Logo ONG" className={styles.LogoOng} />
        </Link>
    );
}