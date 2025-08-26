import { useState, useEffect, useMemo } from "react";
import {
  GoogleMap,
  Marker,
  InfoWindow,
  DirectionsRenderer,
  useJsApiLoader,
} from "@react-google-maps/api";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./Mapeamento.module.css";

/** --------------------------
 *  Dados de ONGs por cidade
 *  -------------------------- */
const ongsPorCidade = {
  sapiranga: [
    {
      id: 1,
      nome: "Associação de Proteção aos Animais",
      lat: -29.6415,
      lng: -51.1489,
      endereco: "Rua Flores da Cunha, 123, Sapiranga",
      telefone: "(51) 3599-1234",
      categoria: "Proteção Animal",
      descricao:
        "ONG voltada ao resgate, tratamento e adoção responsável de animais.",
    },
    {
      id: 2,
      nome: "Instituto Assistencial Comunitário",
      lat: -29.645,
      lng: -51.15,
      endereco: "Av. Presidente Vargas, 321, Sapiranga",
      telefone: "(51) 3599-5678",
      categoria: "Assistência Social",
      descricao:
        "Atuação com famílias em vulnerabilidade e programas de doação.",
    },
    {
      id: 3,
      nome: "ONG Educação Para Todos",
      lat: -29.638,
      lng: -51.152,
      endereco: "Rua São José, 456, Sapiranga",
      telefone: "(51) 3599-9876",
      categoria: "Educação",
      descricao:
        "Projetos de reforço escolar e inclusão digital para crianças e jovens.",
    },
    {
      id: 6,
      nome: "Projeto Bem Viver Sapiranga",
      lat: -29.642,
      lng: -51.146,
      endereco: "Rua dos Pinheiros, 200, Sapiranga",
      telefone: "(51) 3599-4321",
      categoria: "Saúde e Bem-Estar",
      descricao:
        "Atendimento de saúde preventiva e apoio psicológico para famílias.",
    },
  ],

  canoas: [
    {
      id: 4,
      nome: "Fundação Canoas Solidária",
      lat: -29.9129,
      lng: -51.1839,
      endereco: "Av. Guilherme Schell, 456, Canoas",
      telefone: "(51) 3472-1234",
      categoria: "Assistência Social",
      descricao: "Campanhas permanentes de alimentos, roupas e atendimentos.",
    },
    {
      id: 5,
      nome: "Casa da Criança Esperança",
      lat: -29.918,
      lng: -51.175,
      endereco: "Rua Santos Dumont, 789, Canoas",
      telefone: "(51) 3472-5678",
      categoria: "Infância e Juventude",
      descricao:
        "Acolhimento e atividades de contraturno para crianças e adolescentes.",
    },
    {
      id: 7,
      nome: "Canoas Verde e Vivo",
      lat: -29.915,
      lng: -51.18,
      endereco: "Rua das Palmeiras, 123, Canoas",
      telefone: "(51) 3472-9012",
      categoria: "Meio Ambiente",
      descricao:
        "Ações de educação ambiental, reciclagem e plantio de árvores.",
    },
  ],

  ivoti: [
    {
      id: 9,
      nome: "Amigos de Ivoti",
      lat: -29.5624,
      lng: -51.1065,
      endereco: "Rua Júlio de Castilhos, 789, Ivoti",
      telefone: "(51) 3563-4444",
      categoria: "Cultura e Lazer",
      descricao: "Promoção de eventos culturais e esportivos comunitários.",
    },
    {
      id: 10,
      nome: "Lar da Juventude Ivoti",
      lat: -29.560,
      lng: -51.110,
      endereco: "Av. 25 de Julho, 150, Ivoti",
      telefone: "(51) 3563-5555",
      categoria: "Infância e Juventude",
      descricao:
        "Oficinas recreativas, reforço escolar e apoio psicossocial para jovens.",
    },
    {
      id: 11,
      nome: "Centro Solidário Ivoti",
      lat: -29.565,
      lng: -51.108,
      endereco: "Rua Marechal Deodoro, 300, Ivoti",
      telefone: "(51) 3563-6666",
      categoria: "Assistência Social",
      descricao:
        "Distribuição de cestas básicas, cursos profissionalizantes e atendimento social.",
    },
  ],
};

/** --------------------------
 *  Configuração de Mapa
 *  -------------------------- */
const DEFAULT_CENTER = { lat: -29.6868, lng: -51.1281 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const ZOOM_DEFAULT = 12;

export default function Mapeamento() {
  const [busca, setBusca] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [ongSelecionada, setOngSelecionada] = useState(null);

  const [origem, setOrigem] = useState(DEFAULT_CENTER);

  const [modo, setModo] = useState("DRIVING"); // modo ativo para renderizar rota
  const [directions, setDirections] = useState(null);
  const [tempos, setTempos] = useState(null); // {DRIVING: {durationText, distanceText}, WALKING: {...}, BICYCLING: {...}}

  const [infoAbertaId, setInfoAbertaId] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBxO8LSKnOPx3bw5TvKvnj7TqkeOaWPB1g",
    libraries: ["places"],
  });

  /** Geolocalização do usuário */
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setOrigem({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        () => setOrigem(DEFAULT_CENTER)
      );
    }
  }, []);

  /** Lista de ONGs para a cidade buscada */
  const listaOngs = useMemo(() => {
    if (!cidadeSelecionada) return [];
    return ongsPorCidade[cidadeSelecionada] ?? [];
  }, [cidadeSelecionada]);

  /** Centro do mapa (primeira ONG da cidade) */
  const centroMapa = useMemo(() => {
    if (!cidadeSelecionada || listaOngs.length === 0) return DEFAULT_CENTER;
    return { lat: listaOngs[0].lat, lng: listaOngs[0].lng };
  }, [cidadeSelecionada, listaOngs]);

  /** Buscar cidade digitada */
  const handleBuscar = () => {
    const nomeCidade = busca.toLowerCase().trim();
    if (!nomeCidade) return;

    const cidadeEncontrada = Object.keys(ongsPorCidade).find(
      (cidade) =>
        cidade.toLowerCase().includes(nomeCidade) ||
        nomeCidade.includes(cidade.toLowerCase())
    );

    if (cidadeEncontrada) {
      setCidadeSelecionada(cidadeEncontrada);
      setOngSelecionada(null);
      setInfoAbertaId(null);
      setDirections(null);
      setTempos(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleBuscar();
  };

  /** Abre painel da ONG e calcula tempos + rota do modo atual */
  const handleSelecionarOng = async (ong, abrirInfoWindow = false) => {
    setOngSelecionada(ong);
    setInfoAbertaId(abrirInfoWindow ? ong.id : null);
    setDirections(null);
    await calcularTempos(ong);
    await calcularRota(ong, modo);
  };

  /** Calcula rota com Directions API */
  const calcularRota = (ong, travelMode) => {
    return new Promise((resolve) => {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origem,
          destination: { lat: ong.lat, lng: ong.lng },
          travelMode: window.google.maps.TravelMode[travelMode],
          provideRouteAlternatives: false,
        },
        (result, status) => {
          if (status === "OK") {
            setDirections(result);
          } else {
            console.error("Erro ao calcular rota:", status);
          }
          resolve();
        }
      );
    });
  };

  /** Calcula tempos/distaŝncias de DRIVING, WALKING e BICYCLING com Distance Matrix API */
  const calcularTempos = (ong) => {
    const dm = new window.google.maps.DistanceMatrixService();
    const modes = ["DRIVING", "WALKING", "BICYCLING"];

    // Faz uma chamada por modo
    const promises = modes.map(
      (m) =>
        new Promise((resolve) => {
          dm.getDistanceMatrix(
            {
              origins: [origem],
              destinations: [{ lat: ong.lat, lng: ong.lng }],
              travelMode: window.google.maps.TravelMode[m],
              unitSystem: window.google.maps.UnitSystem.METRIC,
            },
            (res, status) => {
              if (
                status === "OK" &&
                res.rows?.[0]?.elements?.[0]?.status === "OK"
              ) {
                const el = res.rows[0].elements[0];
                resolve({
                  mode: m,
                  durationText: el.duration?.text,
                  durationValue: el.duration?.value,
                  distanceText: el.distance?.text,
                  distanceValue: el.distance?.value,
                });
              } else {
                resolve({
                  mode: m,
                  durationText: "-",
                  durationValue: null,
                  distanceText: "-",
                  distanceValue: null,
                });
              }
            }
          );
        })
    );

    return Promise.all(promises).then((arr) => {
      const map = {};
      arr.forEach((it) => (map[it.mode] = it));
      setTempos(map);
    });
  };

  /** Alterar modo (e redesenhar rota) */
  const trocarModo = async (novoModo) => {
    if (!ongSelecionada) return;
    setModo(novoModo);
    setDirections(null);
    await calcularRota(ongSelecionada, novoModo);
  };

  if (!isLoaded) return <div>Carregando mapa...</div>;

  return (
    <div className={styles.mapeamento}>
      <Header />

      <div className={styles.mapaWrapper}>
        {/* Barra de Busca */}
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <span className={styles.searchIcon} aria-hidden>
              🔎
            </span>
            <input
              type="text"
              placeholder="Digite a cidade (ex.: Sapiranga, Canoas, Ivoti...)"
              className={styles.searchInput}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            {busca && (
              <button
                className={styles.clearButton}
                onClick={() => {
                  setBusca("");
                  setCidadeSelecionada(null);
                  setOngSelecionada(null);
                  setTempos(null);
                  setDirections(null);
                  setInfoAbertaId(null);
                }}
                aria-label="Limpar"
              >
                ×
              </button>
            )}
            <button className={styles.searchBtn} onClick={handleBuscar}>
              Buscar
            </button>
          </div>
        </div>

        {/* Painel lateral (informações da ONG + tempos) */}
        {ongSelecionada && (
          <aside className={styles.routePanel}>
            <div className={styles.routeHeader}>
              <h3 title={ongSelecionada.nome}>{ongSelecionada.nome}</h3>
              <button
                className={styles.closeButton}
                onClick={() => {
                  setOngSelecionada(null);
                  setDirections(null);
                  setTempos(null);
                  setInfoAbertaId(null);
                }}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>

            {ongSelecionada.categoria && (
              <div className={styles.badge}>{ongSelecionada.categoria}</div>
            )}

            <div className={styles.routeAddress}>{ongSelecionada.endereco}</div>

            {ongSelecionada.telefone && (
              <div className={styles.routeContact}>
                <span>📞</span>
                <a href={`tel:${ongSelecionada.telefone}`}>
                  {ongSelecionada.telefone}
                </a>
              </div>
            )}

            {ongSelecionada.descricao && (
              <div className={styles.routeDescription}>
                {ongSelecionada.descricao}
              </div>
            )}

            {/* Blocos de tempo por modo */}
            <div className={styles.modesGrid}>
              {["DRIVING", "WALKING", "BICYCLING"].map((m) => (
                <button
                  key={m}
                  className={`${styles.modeCard} ${
                    modo === m ? styles.modeCardActive : ""
                  }`}
                  onClick={() => trocarModo(m)}
                  title={
                    m === "DRIVING"
                      ? "Carro"
                      : m === "WALKING"
                      ? "A pé"
                      : "Bicicleta"
                  }
                >
                  <div className={styles.modeIcon}>
                    {m === "DRIVING" ? "🚗" : m === "WALKING" ? "🚶" : "🚲"}
                  </div>
                  <div className={styles.modeTexts}>
                    <strong className={styles.modeTime}>
                      {tempos?.[m]?.durationText || "—"}
                    </strong>
                    <span className={styles.modeDistance}>
                      {tempos?.[m]?.distanceText || "—"}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Resumo do modo ativo */}
            <div className={styles.routeInfo}>
              <div className={styles.routeTime}>
                <strong>{tempos?.[modo]?.durationText || "—"}</strong>
                <span>
                  • {tempos?.[modo]?.distanceText || "—"} •{" "}
                  {modo === "DRIVING"
                    ? "Carro"
                    : modo === "WALKING"
                    ? "A pé"
                    : "Bicicleta"}
                </span>
              </div>
              <div className={styles.routeHint}>
                Clique nos cartões acima para alternar o modo de viagem.
              </div>
            </div>
          </aside>
        )}

        {/* Controles flutuantes de modo (estilo Google) */}
        <div className={styles.transportControls}>
          {["DRIVING", "WALKING", "BICYCLING"].map((m) => (
            <button
              key={m}
              className={`${styles.transportButton} ${
                modo === m ? styles.active : ""
              }`}
              onClick={() => trocarModo(m)}
              title={
                m === "DRIVING" ? "Carro" : m === "WALKING" ? "A pé" : "Bicicleta"
              }
            >
              {m === "DRIVING" ? "🚗" : m === "WALKING" ? "🚶" : "🚲"}
            </button>
          ))}
        </div>

        {/* Google Map */}
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={centroMapa}
          zoom={ZOOM_DEFAULT}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          {/* Marcador do usuário */}
          <Marker position={origem} icon={undefined} />

          {/* Marcadores das ONGs */}
          {listaOngs.map((ong) => (
            <Marker
              key={ong.id}
              position={{ lat: ong.lat, lng: ong.lng }}
              onClick={() => handleSelecionarOng(ong, true)}
            />
          ))}

          {/* InfoWindow bonito (abre no clique do marcador) */}
          {infoAbertaId &&
            listaOngs
              .filter((o) => o.id === infoAbertaId)
              .map((o) => (
                <InfoWindow
                  key={`info-${o.id}`}
                  position={{ lat: o.lat, lng: o.lng }}
                  onCloseClick={() => setInfoAbertaId(null)}
                >
                  <div className={styles.popupContent}>
                    <h4>{o.nome}</h4>
                    {o.categoria && (
                      <div className={styles.popupCategory}>{o.categoria}</div>
                    )}
                    <div className={styles.popupAddress}>{o.endereco}</div>
                    {o.telefone && (
                      <div className={styles.popupPhone}>
                        <span>📞</span>
                        <a href={`tel:${o.telefone}`}>{o.telefone}</a>
                      </div>
                    )}
                    <button
                      className={styles.routeButton}
                      onClick={() => {
                        setInfoAbertaId(null);
                        handleSelecionarOng(o);
                      }}
                    >
                      Ver detalhes e rotas
                    </button>
                  </div>
                </InfoWindow>
              ))}

          {/* Rota desenhada */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeOpacity: 0.9,
                  strokeWeight: 5,
                },
              }}
            />
          )}
        </GoogleMap>
      </div>

      <Footer />
    </div>
  );
}
