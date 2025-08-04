import { Link } from 'react-router-dom';
import React, { useState } from "react";
import Logo from './Logo';

import styles from './Header.module.css';

const Header = ({ isLoggedIn }) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <div className={styles.header}>
            <Logo small />
            <div className={styles.hamburger} onClick={toggleMenu}>
                <div className={`${styles.bar} ${menuOpen ? styles.open : ""}`}></div>
                <div className={`${styles.bar} ${menuOpen ? styles.open : ""}`}></div>
                <div className={`${styles.bar} ${menuOpen ? styles.open : ""}`}></div>
            </div>
            <nav className={`${styles.nav_menu} ${menuOpen ? styles.active : ""}`}>
                <ul>
                    <li><Link to="/">Início</Link></li>
                    <li><a href="/mapeamento">Mapeamento</a></li>

                    {isLoggedIn && (
                        <>
                            <li><a href="/reservas">Reservas</a></li>
                            <li><a href="/ongs">ONGs</a></li>
                            <li><a href="/doacoes">Doações</a></li>
                        </>
                    )}

                    {!isLoggedIn && (
                        <li><a href="/login">Entrar ou Cadastrar</a></li>
                    )}
                </ul>
            </nav>
        </div>
    );
};

export default Header;
