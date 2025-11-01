import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './ONGsPage.module.css';
import Footer from '../components/Footer';
import Header from '../components/Header';
import usePermissions from "../hooks/usePermissions";

import { Search } from "lucide-react";
import { FaRegImage } from "react-icons/fa";

import fetcher from "../utils/fetcher";

import { useSearchParams } from 'react-router-dom';

export default function ONGsPage() {
  const [permissions] = usePermissions();
  const [instituicoes, setInstituicoes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCidade, setSelectedCidade] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedVerificadas, setSelectedVerificadas] = useState('');

  const mounted = useRef(false);

  const [searchParams] = useSearchParams();

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
      setSearched(true);

      const response = await fetcher.get(`/instituicoes`, {
        params: {
          search: searchTerm,
          id_cidade: selectedCidade,
          id_categoria: selectedCategoria,
          verificadas: selectedVerificadas
        }
      });

      setInstituicoes(response.data?.data || []);
    } catch (error) {
      console.error('Erro ao buscar ONGs:', error);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCidade, selectedCategoria, selectedVerificadas]);

  useEffect(() => {
    if (!mounted.current && !selectedVerificadas) return;
    if (selectedVerificadas) mounted.current = true;

    fetchOngs();
  }, [fetchOngs, selectedVerificadas]);

  // 🔸 Carregar categorias e cidades uma vez
  useEffect(() => {
    fetchCategorias();
    fetchCidades();
  }, [fetchCategorias, fetchCidades]);

  useEffect(() => {
    if (!searchParams) return;

    const verificadas = searchParams.get('verificadas');

    if (verificadas !== null && verificadas !== undefined) {
      setSelectedVerificadas(verificadas)
    } else {
      mounted.current = true;
    }
  }, [searchParams]);

  return (
    <div className={styles.container}>
      <Header permissions={permissions} />

      <main className={styles.main}>
        <div className={styles.searchSection}>
          <div className={styles.searchContainer}>
            <Search size={20} />
            <input
              type="text"
              placeholder="Digite o nome de uma ONG..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filters}>
            <div className={styles.selectWrapper}>
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
            </div>

            <div className={styles.selectWrapper}>
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

            <div className={styles.selectWrapper}>
              <select
                value={selectedVerificadas}
                onChange={(e) => setSelectedVerificadas(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="">Todas as ONGs</option>
                <option value="1">Apenas verificadas</option>
                <option value="0">Apenas não verificadas</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.ongsGrid}>
          {!searched ? (
            <div className={styles.loading}>Use os filtros acima para buscar por ONGs...</div>
          ) : loading ? (
            <div className={styles.loading}>Carregando...</div>
          ) : instituicoes.length > 0 ? (
            instituicoes.map((instituicao) => (
              <div
                key={instituicao.id_instituicao}
                className={styles.ongCard}
                onClick={() => {
                  if (!instituicao.id_instituicao || !document || !window) return;

                  const url = document.location.origin + '/perfil-ong/' + instituicao.id_instituicao;

                  window.location.href = url;
                }}
              >
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