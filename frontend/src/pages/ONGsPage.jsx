import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import styles from './ONGsPage.module.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import usePermissions from "../hooks/usePermissions";

import { FaRegImage } from "react-icons/fa";

import fetcher from "../utils/fetcher";

export default function ONGsPage() {
  const [permissions] = usePermissions();
  const [instituicoes, setInstituicoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCidade, setSelectedCidade] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState(null);

  // 🔸 Buscar categorias
  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetcher.get('/categorias');
      setCategorias(response.data?.data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  }, []);

  // 🔸 Buscar cidades
  const fetchCidades = useCallback(async () => {
    try {
      const response = await fetcher.get('/cidades');
      setCidades(response.data?.data || []);
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
    }
  }, []);

  // 🔸 Buscar ONGs
  const fetchOngs = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCidade) params.append('id_cidade', selectedCidade);
      if (selectedCategoria) params.append('id_categoria', selectedCategoria);

      const response = await fetcher.get(`/instituicoes?${params.toString()}`);
      setInstituicoes(response.data?.data || []);
    } catch (error) {
      console.error('Erro ao buscar ONGs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCidade, selectedCategoria]);

  // 🔸 Carregar categorias e cidades uma vez
  useEffect(() => {
    fetchCategorias();
    fetchCidades();
  }, [fetchCategorias, fetchCidades]);

  // 🔸 Atualizar ONGs ao mudar filtros
  useEffect(() => {
    fetchOngs();
  }, [fetchOngs]);

  return (
    <div className={styles.container}>
      <Header isLoggedIn={permissions?.loggedIn} />

      <main className={styles.main}>
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Digite o nome de uma ONG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <button className={styles.searchButton} onClick={fetchOngs} aria-label="Buscar">
              <Search size={24} />
            </button>
          </div>

          <div className={styles.filters}>
            <select
              value={selectedCidade}
              onChange={(e) => setSelectedCidade(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas as cidades</option>
              {cidades && cidades.length && cidades.map((cidade) => (
                <option key={cidade.id_cidade} value={cidade.id_cidade}>
                  {cidade.nome}
                </option>
              ))}
            </select>

            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">Todas as categorias</option>
              {categorias && categorias.length && categorias.map((categoria) => (
                <option key={categoria.id_categoria} value={categoria.id_categoria}>
                  {categoria.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.ongsGrid}>
          {loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : instituicoes.length > 0 ? (
            instituicoes.map((instituicao) => (
              <div key={instituicao.id_instituicao} className={styles.ongCard}>
                <div className={styles.ongImageContainer}>
                  {instituicao.logo_url ? (
                    <img src={instituicao.logo_url} alt={instituicao.nome} className={styles.ongImage} />
                  ) : (
                    <div className={styles.ongPlaceholder}>
                      <div className={styles.placeholderIcon}><FaRegImage /></div>
                    </div>
                  )}
                </div>
                <div className={styles.ongInfo}>
                  <h3 className={styles.ongName}>{instituicao.nome}</h3>
                  <p className={styles.ongLocation}>{instituicao?.instituicoes_enderecos[0]?.cidades?.nome}</p>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.emptyState}>
              <p>Nenhuma ONG encontrada</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}