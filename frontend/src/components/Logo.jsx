import { Link } from 'react-router-dom';
import styles from './Logo.module.css';

export default function Logo({ small = false }) {
    return (
        <Link to="/">
            <img src="/img/logoSmov.png" alt="Logo SMOV" className={`${styles.logoSmov} ${small ? styles.small : ''}`} />
        </Link>
    );
}
