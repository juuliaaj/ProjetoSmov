import { useEffect, useState } from "react";
import styles from "./AdminDashboard.module.css";
import usePermissions from "../hooks/usePermissions";
import Header from "../components/Header";
import Footer from "../components/Footer";
import fetcher from "../utils/fetcher";
import { FaUser } from "react-icons/fa";

import { toast, ToastContainer } from "react-toastify";
import { TOAST_CONFIG } from "../utils/toast";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Document, Page, pdfjs } from "react-pdf";

import 'react-pdf/dist/Page/TextLayer.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const AdminDashboard = () => {
  const [permissions] = usePermissions();
  const [ongs, setOngs] = useState([]);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess(numPages, slideSrc) {
    const slide = slides.find(s => s.src === slideSrc);

    if (slide) {
      slide.numPages = numPages;
    }
  }

  useEffect(() => {
    fetcher.get('/instituicoes/cadastros')
      .then(response => {
        setOngs(response.data.data);
      })
      .catch(error => {
        console.error("Erro ao buscar cadastros de ONGs:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  function formataCNPJ(cnpj) {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  }

  function formataTelefone(telefone) {
    return telefone.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
  }

  function formataEndereco(endereco, numero, bairro, cidade, cep) {
    return `${endereco}, ${numero} - ${bairro}, ${cidade} - CEP: ${cep.replace(/^(\d{5})(\d{3})$/, "$1-$2")}`;
  }

  function handleSlides(ong) {
    let docs = [ong.logo_url, ong.banner_url, ong.endereco_url];

    docs = docs.reduce((acc, doc, idx) => {
      let title = 'Documento';

      switch (idx) {
        case 0:
          title = 'Logo';
          break;
        case 1:
          title = 'Banner';
          break;
        case 2:
          title = 'Comprovante de Endereço';
          break;
      }

      if (doc) acc.push({ type: doc.includes('pdf') ? 'pdf' : 'image', src: doc, title });

      return acc;
    }, []);

    setSlides(docs);
  }

  const handleStatus = (id, status) => {
    toast.warning(() => (
      <div>
        <span>Tem certeza que deseja {status === 'F' ? 'aprovar' : 'reprovar'} esta instituição?</span>
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={async () => {
              await applyStatus(id, status);
              toast.dismiss();
            }}
            style={{ padding: '6px 12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >Sim</button>
          <button
            onClick={() => toast.dismiss()}
            style={{ padding: '6px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Não
          </button>
        </div>
      </div>


    ), { ...TOAST_CONFIG, autoClose: false, closeButton: false });
  };

  const applyStatus = async (id, status) => {
    try {
      await fetcher.put(`/instituicoes/cadastros/${id}/status`, { status });
      
      setOngs((prevOngs) => prevOngs.filter((ong) => ong.id_cadastro !== id));
    } catch (error) {
      console.error(`Erro ao atualizar status da ONG:`, error);
    }
  };

  if (loading) return <p className={styles.loading}>Carregando...</p>;

  return (
    <div>
      <Header permissions={permissions} />

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
              <div key={ong.id_cadastro} className={styles.card}>
                <div className={styles.banner} style={ ong.banner_url ? { backgroundImage: `url(${ong.banner_url})` } : { background: 'gray' }}>
                  {ong.logo_url ? (
                    <img src={ong.logo_url} alt={ong.nome} className={styles.logo} />
                  ) : (
                    <div className={styles.placeholderLogo}><FaUser /></div>
                  )}
                </div>
                <div className={styles.info}>
                  <h2>{ong.nome}</h2>

                  <div className={styles.details}>
                    <p className={styles.infoGrande}><strong>Responsável:</strong> {ong.responsavel}</p>
                    <p><strong>E-mail:</strong> {ong.email}</p>
                    <p><strong>Telefone:</strong> {formataTelefone(ong.telefone)}</p>
                    <p><strong>CNPJ:</strong> {formataCNPJ(ong.cnpj)}</p>
                    <p className={styles.infoMedia}><strong>Descrição:</strong> {ong.descricao}</p>
                    <p><strong>Categoria:</strong> {ong.categoria}</p>
                    <p className={styles.infoGrande}><strong>Endereço:</strong> {formataEndereco(ong.endereco, ong.endereco_numero, ong.bairro, ong.cidade, ong.cep)}</p>
                  </div>
                  <div className={styles.actions}>
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleStatus(ong.id_cadastro, 'F')}
                    >
                      Aprovar
                    </button>
                    <button
                      className={styles.rejectBtn}
                      onClick={() => handleStatus(ong.id_cadastro, 'R')}
                    >
                      Reprovar
                    </button>
                    <button
                      className={styles.docsBtn}
                      onClick={() => handleSlides(ong)}
                    >
                      Documentos
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />

      <Lightbox
        open={slides.length > 0}
        close={() => setSlides([])}
        on={{
          view: () => setPageNumber(1)
        }}
        slides={slides}
        render={{
          slideHeader: ({ slide }) => (
            <div
              style={{
                textAlign: "center",
                fontSize: "1.2rem",
                fontWeight: "600",
                color: "white",
                marginBottom: "0.5rem",
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                position: "fixed",
                top: "3rem",
                background: "#00000075",
                borderRadius: "6px",
                padding: "0 10px",
                zIndex: 1000,
              }}
            >
              {slide.title}
            </div>
          ),
          slide: ({ slide }) => {
            if (slide.type === "image") {
              return (
                <img
                  src={slide.src}
                  alt=""
                  style={{
                    maxHeight: "90vh",
                    maxWidth: "100%",
                    objectFit: "contain",
                    margin: "auto",
                  }}
                />
              );
            }

            if (slide.type === "pdf")
              return (
                <div
                  style={{
                    height: "90vh",
                    overflow: "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    color: "white",
                  }}
                >
                  <Document file={slide.src} onLoadSuccess={({ numPages }) => onDocumentLoadSuccess(numPages, slide.src)}>
                    <Page pageNumber={pageNumber} scale={0.7} />
                  </Document>

                  <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button
                      onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
                      disabled={pageNumber <= 1}
                      style={{ padding: "0.4rem 0.8rem", borderRadius: "6px" }}
                    >
                      ◀
                    </button>
                    <span>
                      Página {pageNumber} de {slide.numPages || "--"}
                    </span>
                    <button
                      onClick={() => setPageNumber((p) => Math.min(p + 1, slide.numPages))}
                      disabled={pageNumber >= slide.numPages}
                      style={{ padding: "0.4rem 0.8rem", borderRadius: "6px" }}
                    >
                      ▶
                    </button>
                  </div>
                </div>
              );

            return null;
          },
        }}
      />

      <ToastContainer />
    </div>
  );
};

export default AdminDashboard;
