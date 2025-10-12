import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import styles from "./AdminDashboard.module.css";
import usePermissions from "../hooks/usePermissions";
import Header from "../components/Header";
import Footer from "../components/Footer";


// Configure seu Supabase
const supabase = createClient(
  "https://SEU-PROJETO.supabase.co",
  "SEU-ANON-KEY"
);

const AdminDashboard = () => {
  const [permissions] = usePermissions();
  const [ongs, setOngs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Buscar ONGs com status pendente
  useEffect(() => {
    const fetchOngs = async () => {
      const { data, error } = await supabase
        .from("ongs")
        .select("*")
        .eq("status", "pendente")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setOngs(data);

      setLoading(false);
    };

    fetchOngs();
  }, []);

  // Aprovar ONG
  const handleAprovar = async (id) => {
    await supabase.from("ongs").update({ status: "aprovada" }).eq("id", id);
    setOngs(ongs.filter((ong) => ong.id !== id));
  };

  // Reprovar ONG
  const handleReprovar = async (id) => {
    await supabase.from("ongs").update({ status: "reprovada" }).eq("id", id);
    setOngs(ongs.filter((ong) => ong.id !== id));
  };

  if (loading) return <p className={styles.loading}>Carregando...</p>;

  return (
  <div>
    <Header isLoggedIn={permissions?.loggedIn} />

    <div className={styles.container}>
      <h1 className={styles.title}>Painel do Administrador</h1>
      <p className={styles.subtitle}>
        Gerencie as solicitações de cadastro de ONGs
      </p>

      {ongs.length === 0 ? (
        <p className={styles.empty}>Nenhuma solicitação pendente.</p>
      ) : (
        <div className={styles.cards}>
          {ongs.map((ong) => (
            <div key={ong.id} className={styles.card}>
              <img src={ong.imagem_url} alt={ong.nome} className={styles.logo} />
              <h2>{ong.nome}</h2>
              <p><strong>Responsável:</strong> {ong.responsavel}</p>
              <p><strong>E-mail:</strong> {ong.email}</p>
              <p><strong>Telefone:</strong> {ong.telefone}</p>
              <p><strong>CNPJ:</strong> {ong.cnpj}</p>
              <p><strong>Endereço:</strong> {ong.endereco}</p>
              <p><strong>Descrição:</strong> {ong.descricao}</p>
              <a
                href={ong.documentos_url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkDoc}
              >
                Ver documentos
              </a>
              <div className={styles.actions}>
                <button
                  className={styles.approveBtn}
                  onClick={() => handleAprovar(ong.id)}
                >
                  Aprovar
                </button>
                <button
                  className={styles.rejectBtn}
                  onClick={() => handleReprovar(ong.id)}
                >
                  Reprovar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    <Footer />
  </div>
);
};

export default AdminDashboard;
