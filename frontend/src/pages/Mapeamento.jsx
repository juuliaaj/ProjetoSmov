import { useEffect, useMemo, useRef, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import styles from "./Mapeamento.module.css";

// ====== Leaflet / React-Leaflet ======
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// Corrige ícones padrão do Leaflet
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Ícone personalizado vermelho para ONGs
const redIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
      <path fill="#ea4335" stroke="#fff" stroke-width="1" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 5.8 12.5 28.5 12.5 28.5s12.5-22.7 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="#fff" cx="12.5" cy="12.5" r="6"/>
    </svg>
  `),
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Ícone azul para localização do usuário
const blueIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="20" height="20">
      <circle fill="#4285f4" stroke="#fff" stroke-width="2" cx="10" cy="10" r="8"/>
      <circle fill="#fff" cx="10" cy="10" r="3"/>
    </svg>
  `),
  shadowUrl: iconShadow,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
  shadowSize: [0, 0]
});

const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

// ------------ DADOS DE ONGs POR CIDADE (Vale dos Sinos) ------------
const ongsPorCidade = {
  sapiranga: [
    {
      id: 1,
      nome: "Associação de Proteção aos Animais",
      lat: -29.6415,
      lng: -51.1489,
      endereco: "Rua Flores da Cunha, 123, Sapiranga",
      telefone: "(51) 3599-1234",
      categoria: "Proteção Animal"
    },
    {
      id: 2,
      nome: "Instituto Assistencial Comunitário",
      lat: -29.645,
      lng: -51.15,
      endereco: "Av. Presidente Vargas, 321, Sapiranga",
      telefone: "(51) 3599-5678",
      categoria: "Assistência Social"
    },
    {
      id: 3,
      nome: "ONG Educação Para Todos",
      lat: -29.638,
      lng: -51.152,
      endereco: "Rua São José, 456, Sapiranga",
      telefone: "(51) 3599-9876",
      categoria: "Educação"
    }
  ],
  canoas: [
    {
      id: 4,
      nome: "Fundação Canoas Solidária",
      lat: -29.9129,
      lng: -51.1839,
      endereco: "Av. Guilherme Schell, 456, Canoas",
      telefone: "(51) 3472-1234",
      categoria: "Assistência Social"
    },
    {
      id: 5,
      nome: "Casa da Criança Esperança",
      lat: -29.918,
      lng: -51.175,
      endereco: "Rua Santos Dumont, 789, Canoas",
      telefone: "(51) 3472-5678",
      categoria: "Infância e Juventude"
    }
  ],
  "novo hamburgo": [
    {
      id: 6,
      nome: "Instituto Verde Vida",
      lat: -29.6783,
      lng: -51.1306,
      endereco: "Rua General Osório, 234, Novo Hamburgo",
      telefone: "(51) 3593-1111",
      categoria: "Meio Ambiente"
    },
    {
      id: 7,
      nome: "Associação Comunitária NH",
      lat: -29.685,
      lng: -51.125,
      endereco: "Av. Maurício Cardoso, 567, Novo Hamburgo",
      telefone: "(51) 3593-2222",
      categoria: "Assistência Social"
    }
  ],
  "são leopoldo": [
    {
      id: 8,
      nome: "Centro de Apoio Leopoldense",
      lat: -29.7604,
      lng: -51.1481,
      endereco: "Rua Marquês do Herval, 890, São Leopoldo",
      telefone: "(51) 3592-3333",
      categoria: "Assistência Social"
    }
  ],
  ivoti: [
    {
      id: 9,
      nome: "Amigos de Ivoti",
      lat: -29.5624,
      lng: -51.1065,
      endereco: "Rua Júlio de Castilhos, 789, Ivoti",
      telefone: "(51) 3563-4444",
      categoria: "Cultura e Lazer"
    }
  ],
  "estancia velha": [
    {
      id: 10,
      nome: "Proteção Animal Estância",
      lat: -29.6344,
      lng: -51.1789,
      endereco: "Rua da Paz, 321, Estância Velha",
      telefone: "(51) 3561-5555",
      categoria: "Proteção Animal"
    }
  ]
};

// Centro padrão Vale dos Sinos
const DEFAULT_CENTER = { lat: -29.6868, lng: -51.1281 };

// ------- Componente para mover/centralizar o mapa -------
function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom ?? 13, { duration: 1.0 });
    }
  }, [center, zoom, map]);
  return null;
}

// ------- Componente de Rotas com OSRM -------
function RoutingMachine({ origem, destino, modo, onResumo }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (controlRef.current) {
      map.removeControl(controlRef.current);
      controlRef.current = null;
    }

    if (!origem || !destino) return;

    // Mapeia corretamente os modos para os perfis OSRM
    let osrmProfile;
    let serviceUrl;
    
    switch (modo) {
      case "driving":
        osrmProfile = "car";
        serviceUrl = "https://router.project-osrm.org/route/v1/driving";
        break;
      case "cycling":
        osrmProfile = "bike";
        serviceUrl = "https://router.project-osrm.org/route/v1/cycling";
        break;
      case "walking":
      default:
        osrmProfile = "foot";
        serviceUrl = "https://router.project-osrm.org/route/v1/foot";
        break;
    }

    const control = L.Routing.control({
      waypoints: [
        L.latLng(origem.lat, origem.lng),
        L.latLng(destino.lat, destino.lng)
      ],
      router: L.Routing.osrmv1({
        serviceUrl: serviceUrl,
        profile: osrmProfile,
        timeout: 30 * 1000, // 30 segundos de timeout
        headers: {
          'User-Agent': 'LeafletRouting'
        }
      }),
      show: false,
      addWaypoints: false,
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: "#1a73e8", weight: 5, opacity: 0.8 }]
      },
      fitSelectedRoutes: true,
      createMarker: () => null
    })
    .on("routesfound", (e) => {
      const route = e.routes?.[0];
      if (!route) return;
      
      let distanceMeters = route.summary.totalDistance;
      let durationSeconds = route.summary.totalTime;
      
      // Aplica correções baseadas no modo se necessário
      // (algumas vezes o OSRM não retorna tempos precisos para todos os perfis)
      if (modo === "walking" && durationSeconds < distanceMeters / 1.4) {
        // Velocidade média caminhada: ~5 km/h = 1.4 m/s
        durationSeconds = distanceMeters / 1.4;
      } else if (modo === "cycling" && durationSeconds < distanceMeters / 4.2) {
        // Velocidade média bicicleta: ~15 km/h = 4.2 m/s
        durationSeconds = distanceMeters / 4.2;
      }
      
      onResumo?.({ distanceMeters, durationSeconds });
    })
    .on("routingerror", (e) => {
      console.error("Erro ao calcular rota:", e);
      
      // Fallback: calcula tempo estimado baseado na distância euclidiana
      const distance = map.distance([origem.lat, origem.lng], [destino.lat, destino.lng]);
      let estimatedTime;
      
      switch (modo) {
        case "driving":
          estimatedTime = distance / 13.9; // ~50 km/h = 13.9 m/s
          break;
        case "cycling":
          estimatedTime = distance / 4.2; // ~15 km/h = 4.2 m/s
          break;
        case "walking":
        default:
          estimatedTime = distance / 1.4; // ~5 km/h = 1.4 m/s
          break;
      }
      
      onResumo?.({ 
        distanceMeters: distance * 1.3, // Fator de correção para distância real vs euclidiana
        durationSeconds: estimatedTime * 1.3 
      });
    })
    .addTo(map);

    controlRef.current = control;

    return () => {
      if (controlRef.current) {
        map.removeControl(controlRef.current);
        controlRef.current = null;
      }
    };
  }, [map, origem, destino, modo, onResumo]);

  return null;
}

// -------------------- COMPONENTE PRINCIPAL --------------------
export default function Mapeamento() {
  const [busca, setBusca] = useState("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState(null);
  const [ongSelecionada, setOngSelecionada] = useState(null);
  const [modo, setModo] = useState("driving");
  const [origem, setOrigem] = useState(null);
  const [resumo, setResumo] = useState(null);

  // Obter geolocalização do usuário
  useEffect(() => {
    if (!navigator.geolocation) {
      setOrigem(DEFAULT_CENTER);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setOrigem({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
      },
      () => {
        setOrigem(DEFAULT_CENTER);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, []);

  // Lista de ONGs da cidade selecionada
  const listaOngs = useMemo(() => {
    if (!cidadeSelecionada) return [];
    return ongsPorCidade[cidadeSelecionada] ?? [];
  }, [cidadeSelecionada]);

  // Centro do mapa baseado na cidade selecionada
  const centroMapa = useMemo(() => {
    if (!cidadeSelecionada || listaOngs.length === 0) {
      return DEFAULT_CENTER;
    }
    
    return {
      lat: listaOngs[0].lat,
      lng: listaOngs[0].lng
    };
  }, [cidadeSelecionada, listaOngs]);

  // Função para buscar cidade
  function handleBuscar() {
    const nomeCidade = busca.toLowerCase().trim();
    
    if (!nomeCidade) {
      return;
    }

    const cidadeEncontrada = Object.keys(ongsPorCidade).find(cidade => 
      cidade.toLowerCase().includes(nomeCidade) || nomeCidade.includes(cidade.toLowerCase())
    );

    if (cidadeEncontrada && ongsPorCidade[cidadeEncontrada].length > 0) {
      setCidadeSelecionada(cidadeEncontrada);
      setOngSelecionada(null);
      setResumo(null);
    }
  }

  // Função para lidar com Enter na busca
  function handleKeyPress(e) {
    if (e.key === "Enter") {
      handleBuscar();
    }
  }

  // Função para selecionar ONG
  function handleSelecionarOng(ong) {
    setOngSelecionada(ong);
    setResumo(null);
  }

  // Helpers para formatação
  function formatDistance(metros) {
    if (metros < 1000) {
      return `${Math.round(metros)} m`;
    }
    return `${(metros / 1000).toFixed(1)} km`;
  }

  function formatDuration(segundos) {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.round((segundos % 3600) / 60);
    
    if (horas > 0) {
      return `${horas} h ${minutos} min`;
    }
    return `${minutos} min`;
  }

  return (
    <div className={styles.mapeamento}>
      <Header />

      <div className={styles.mapaWrapper}>
        {/* Barra de Busca - Estilo Google Maps */}
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <svg className={styles.searchIcon} width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <input
              type="text"
              placeholder="Pesquisar ONGs no Vale dos Sinos"
              className={styles.searchInput}
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {busca && (
              <button 
                className={styles.clearButton}
                onClick={() => {setBusca(""); setCidadeSelecionada(null); setOngSelecionada(null); setResumo(null);}}
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Controles de Transporte */}
        <div className={styles.transportControls}>
          <button
            className={`${styles.transportButton} ${modo === "driving" ? styles.active : ""}`}
            onClick={() => setModo("driving")}
            title="De carro"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 11L6.5 6.5H17.5L19 11H5ZM17.5 16C16.675 16 16 15.325 16 14.5C16 13.675 16.675 13 17.5 13C18.325 13 19 13.675 19 14.5C19 15.325 18.325 16 17.5 16ZM6.5 16C5.675 16 5 15.325 5 14.5C5 13.675 5.675 13 6.5 13C7.325 13 8 13.675 8 14.5C8 15.325 7.325 16 6.5 16ZM20 8H21V10H23V12H21V20C21 20.55 20.55 21 20 21H19C18.45 21 18 20.55 18 20V19H6V20C6 20.55 5.55 21 5 21H4C3.45 21 3 20.55 3 20V12H1V10H3V8H4L6 3H18L20 8Z"/>
            </svg>
          </button>
          <button
            className={`${styles.transportButton} ${modo === "walking" ? styles.active : ""}`}
            onClick={() => setModo("walking")}
            title="A pé"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.12,10H19V8.2H15.38L13.38,4.87C13.08,4.37 12.54,4.03 11.92,4.03C11.74,4.03 11.58,4.06 11.42,4.11L6,5.8V11H7.8V7.33L9.91,6.67L6,22H7.8L10.67,13.89L13,17V22H14.8V15.59L12.31,11.05L13.04,8.18M14,3.8C15,3.8 15.8,3 15.8,2S15,0.2 14,0.2S12.2,1 12.2,2S13,3.8 14,3.8Z"/>
            </svg>
          </button>
          <button
            className={`${styles.transportButton} ${modo === "cycling" ? styles.active : ""}`}
            onClick={() => setModo("cycling")}
            title="De bicicleta"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 20.5C2.24 20.5 0 18.26 0 15.5S2.24 10.5 5 10.5 10 12.74 10 15.5 7.76 20.5 5 20.5M5 12.5C3.35 12.5 2 13.85 2 15.5S3.35 18.5 5 18.5 8 17.15 8 15.5 6.65 12.5 5 12.5M19 20.5C16.24 20.5 14 18.26 14 15.5S16.24 10.5 19 10.5 24 12.74 24 15.5 21.76 20.5 19 20.5M19 12.5C17.35 12.5 16 13.85 16 15.5S17.35 18.5 19 18.5 22 17.15 22 15.5 20.65 12.5 19 12.5M8.8 13.5L10.8 10.5H13V8.5H9.5L7.1 12.2L8.8 13.5M11 16L14.5 12.5L11 16M12 10.5C13.1 10.5 14 9.6 14 8.5S13.1 6.5 12 6.5 10 7.4 10 8.5 10.9 10.5 12 10.5Z"/>
            </svg>
          </button>
        </div>

        {/* Painel de Informações da Rota - Estilo Google Maps */}
        {resumo && ongSelecionada && (
          <div className={styles.routePanel}>
            <div className={styles.routeHeader}>
              <h3>{ongSelecionada.nome}</h3>
              <button 
                className={styles.closeButton}
                onClick={() => {setOngSelecionada(null); setResumo(null);}}
              >
                ×
              </button>
            </div>
            <div className={styles.routeAddress}>
              {ongSelecionada.endereco}
            </div>
            <div className={styles.routeInfo}>
              <div className={styles.routeTime}>
                <strong>{formatDuration(resumo.durationSeconds)}</strong>
                <span>({formatDistance(resumo.distanceMeters)})</span>
              </div>
              <div className={styles.routeMode}>
                {modo === "driving" ? "de carro" : modo === "walking" ? "a pé" : "de bicicleta"}
              </div>
            </div>
            {ongSelecionada.telefone && (
              <div className={styles.routeContact}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                </svg>
                <span>{ongSelecionada.telefone}</span>
              </div>
            )}
          </div>
        )}

        {/* MAPA PRINCIPAL */}
        <MapContainer
          center={[centroMapa.lat, centroMapa.lng]}
          zoom={cidadeSelecionada ? 13 : 10}
          className={styles.mapa}
          scrollWheelZoom={true}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={18}
          />

          <FlyTo center={centroMapa} zoom={cidadeSelecionada ? 13 : 10} />

          {/* Marcador da localização do usuário */}
          {origem && (
            <Marker 
              position={[origem.lat, origem.lng]} 
              icon={blueIcon}
            >
              <Popup>
                <div className={styles.popupContent}>
                  <strong>Sua localização</strong>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Marcadores das ONGs */}
          {listaOngs.map((ong) => (
            <Marker
              key={ong.id}
              position={[ong.lat, ong.lng]}
              icon={redIcon}
              eventHandlers={{
                click: () => handleSelecionarOng(ong)
              }}
            >
              <Popup maxWidth={300} className={styles.customPopup}>
                <div className={styles.popupContent}>
                  <h4>{ong.nome}</h4>
                  <div className={styles.popupAddress}>{ong.endereco}</div>
                  {ong.telefone && (
                    <div className={styles.popupPhone}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/>
                      </svg>
                      {ong.telefone}
                    </div>
                  )}
                  <div className={styles.popupCategory}>{ong.categoria}</div>
                  <button
                    className={styles.routeButton}
                    onClick={() => handleSelecionarOng(ong)}
                  >
                    Como chegar
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Componente de Rota */}
          {origem && ongSelecionada && (
            <RoutingMachine
              origem={origem}
              destino={{ lat: ongSelecionada.lat, lng: ongSelecionada.lng }}
              modo={modo}
              onResumo={setResumo}
            />
          )}
        </MapContainer>
      </div>

      <Footer />
    </div>
  );
}