import { Link } from 'react-router-dom';
import styles from './LogoCimol.module.css';

export default function Logo() {
    return (
        <Link to="/">
            <img src="/img/LogoCimol.png" alt="Logo CIMOL" className={styles.LogoCimol} />
        </Link>
    );
}