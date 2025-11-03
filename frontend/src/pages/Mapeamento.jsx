import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Polyline,
} from "@react-google-maps/api";
import {
  MapPin,
  X,
  Search,
  Truck,
  Heart,
  Play,
  Pause,
  Navigation,
  RefreshCcw,
  Car,
  Bike,
  Footprints,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  ArrowUp,
} from "lucide-react";
import Header from "../components/Header";
import styles from "./Mapeamento.module.css";
import usePermissions from "../hooks/usePermissions";
import fetcher from "../utils/fetcher";

const DEFAULT_CENTER = { lat: -29.6868, lng: -51.1281 };
const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
const ZOOM_DEFAULT = 12;
const LIBRARIES = ['places'];
const ROUTE_TICK_RATE = 80;
const ROUTE_SPEED_KMH = 300;
const ROUTE_SPEED_MPS = (ROUTE_SPEED_KMH * 1000) / 3600;

// Sistema de voz melhorado para navegação
class NavigationVoice {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.voice = null;
    this.volume = 0.8;
    this.enabled = true;
    this.rate = 0.9;
    this.pitch = 1;

    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    } else {
      this.loadVoices();
    }
  }

  loadVoices() {
    this.voices = this.synth.getVoices();

    if (!this.voices.length) return;

    const preferredVoiceNames = [
      "Google",
      "Microsoft Maria",
      "Luciana"
    ];

    const portugueseVoices = this.voices.filter(v => v.lang.toLowerCase() === 'pt-br');

    for (const voice of preferredVoiceNames) {
      this.voice = portugueseVoices.find(v => v.name.includes(voice));

      if (this.voice) break
    }
    
    if (!this.voice) {
      this.voice = portugueseVoices[0] || this.voices[0];
    }
  }

  speak(text, immediate = false) {
    if (!this.enabled || !this.synth) return;

    if (immediate) {
      this.synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.voice;
    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.lang = 'pt-BR';

    setTimeout(() => {
      if (this.enabled) this.synth.speak(utterance);
    }, immediate ? 50 : 0);

    return utterance;
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.synth.cancel();
    }
    return this.enabled;
  }
}

// Tradutor de instruções para português - MELHORADO
const getDirectionIcon = (instruction) => {
  const text = instruction.toLowerCase();
  
  if (text.includes('esquerda')) {
    if (text.includes('acentuadamente')) {
      return <ArrowLeft size={18} />;
    }
    return <ArrowLeft size={16} />;
  } else if (text.includes('direita')) {
    if (text.includes('acentuadamente')) {
      return <ArrowRight size={18} />;
    }
    return <ArrowRight size={16} />;
  } else if (text.includes('retorno')) {
    return <RotateCcw size={16} />;
  } else if (text.includes('rotatória')) {
    return <RefreshCcw size={16} />;
  } else if (text.includes('frente') || text.includes('siga') || text.includes('continue') || text.includes('pegue')) {
    return <ArrowUp size={16} />;
  } else {
    return <Navigation size={16} />;
  }
}

export default function Mapeamento() {
  const [permissions] = usePermissions();
  const [busca, setBusca] = useState("");
  const [ongs, setOngs] = useState([]);
  const [origem, setOrigem] = useState(DEFAULT_CENTER);
  const [selected, setSelected] = useState(null);
  const [routePath, setRoutePath] = useState([]);
  const [progressPath, setProgressPath] = useState([]);
  const [travelInfo, setTravelInfo] = useState(null);
  const [modo, setModo] = useState("DRIVING");
  const [routeInstructions, setRouteInstructions] = useState([]);
  const [navActive, setNavActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  
  const animatedRef = useRef({
    timeoutId: null,
    path: [],
    voiceSystem: null,
    currentInstructionIndex: -1,
    totalDistance: 0,
    segmentDistances: [],
    travelled: 0,
  });

  const mapRef = useRef(null);

  const instructionsListRef = useRef(null);
  const instructionsItemsRefs = useRef([]);

  const addToInstructionRefs = (el) => {
    if (el) {
      instructionsItemsRefs.current.push(el);
    }
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  });

  useEffect(() => {
    animatedRef.current.voiceSystem = new NavigationVoice();
    
    const loadVoices = () => {
      if (animatedRef.current.voiceSystem) {
        animatedRef.current.voiceSystem.loadVoices();
      }
    };
    
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    
    setTimeout(loadVoices, 1000);
    
    return () => {
      if (animatedRef.current.timeoutId) {
        clearTimeout(animatedRef.current.timeoutId)
      }

      if (animatedRef.current.voiceSystem) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        animatedRef.current.voiceSystem.synth.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setOrigem({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          setOrigem(DEFAULT_CENTER);
        },
        { maximumAge: 1000 * 60 * 5, timeout: 10000, enableHighAccuracy: true }
      );
    } else {
      setOrigem(DEFAULT_CENTER);
    }
  }, []);

  const getOngs = useCallback(async () => {
    try {
      const response = await fetcher.get(`/instituicoes/enderecos`);

      const data = response.data?.data || [];

      const normalized = data
            .filter((r) => r.latitude != null && r.longitude != null)
            .map((r) => ({
              id_endereco: r.id_endereco,
              id_instituicao: r.id_instituicao,
              lat: Number(r.latitude),
              lng: Number(r.longitude),
              rua: r.rua,
              numero: r.numero,
              bairro: r.bairro,
              complemento: r.complemento,
              cidade: r.cidades?.nome || "",
              nome: r.instituicoes?.nome || "Instituição",
              descricao: r.instituicoes?.descricao,
              telefone: r.instituicoes?.telefone,
              email: r.instituicoes?.email,
              logo_url: r.instituicoes?.logo_url || null,
              banner_url: r.instituicoes?.banner_url || null,
              site: r.instituicoes?.site || null,
              verificada: !!r.instituicoes?.id_usuario,
              enderecoCompleto: `${r.rua || ''} ${r.numero || ''}${r.complemento ? `, ${r.complemento}` : ''}, ${r.bairro || ''}`.trim()
            }));

      setOngs(normalized);
    } catch (error) {
      console.error('Erro ao buscar ONGs:', error);
    }
  }, []);

  useEffect(() => { 
    getOngs();
  }, [getOngs]);

  const filteredOngs = useMemo(() => {
    if (!busca) return ongs;

    const q = busca.toLowerCase().trim();

    return ongs.filter(
      (o) =>
        o.nome.toLowerCase().includes(q) ||
        (o.cidade || "").toLowerCase().includes(q) ||
        (o.descricao || "").toLowerCase().includes(q) ||
        (o.bairro || "").toLowerCase().includes(q)
    );
  }, [busca, ongs]);

  const handleMapLoad = (map) => {
    mapRef.current = map;
  };

  // Função para calcular rota com instruções detalhadas
  const calcularRota = (ong, travelMode = modo) => {
    return new Promise((resolve) => {
      if (!window.google || !mapRef.current) {
        resolve();
        return;
      }
      
      const directionsService = new window.google.maps.DirectionsService();
      
      // Configurar opções mais detalhadas para obter instruções variadas
      directionsService.route(
        {
          origin: origem,
          destination: { lat: ong.lat, lng: ong.lng },
          travelMode: window.google.maps.TravelMode[travelMode],
          provideRouteAlternatives: false,
          optimizeWaypoints: false,
          avoidHighways: false,
          avoidTolls: false,
          language: 'pt-BR'
        },
        (result, status) => {
          if (status === "OK" && result && result.routes?.[0]) {
            const route = result.routes[0];
            const overview = route.overview_path || [];
            const path = overview.map((p) =>
              p instanceof window.google.maps.LatLng
                ? { lat: p.lat(), lng: p.lng() }
                : p
            );
            
            // Extrair instruções detalhadas de cada etapa
            const instructions = [];
            if (route.legs && route.legs[0]) {
              const leg = route.legs[0];

              // Processar cada etapa da rota
              leg.steps.forEach((step) => {                
                const cleanInstruction = step.instructions.replace(/<[^>]*>/g, '');

                // Verificar se a instrução é diferente da anterior para evitar duplicatas
                instructions.push({
                  instruction: cleanInstruction,
                  originalInstruction: step.instructions,
                  distance: step.distance?.text || "",
                  duration: step.duration?.text || "",
                  startLocation: {
                    lat: step.start_location.lat(),
                    lng: step.start_location.lng()
                  },
                  endLocation: {
                    lat: step.end_location.lat(),
                    lng: step.end_location.lng()
                  },
                  path: step.path.map(p => ({
                    lat: p.lat(), lng: p.lng()
                  }))
                });
              });

              // Adicionar instrução de chegada
              instructions.push({
                instruction: `Você chegou ao destino: ${ong.nome}`,
                originalInstruction: `Você chegou ao destino: <b>${ong.nome}</b>`,
                distance: "",
                duration: "",
                startLocation: {
                  lat: leg.end_location.lat(),
                  lng: leg.end_location.lng()
                },
                endLocation: {
                  lat: leg.end_location.lat(),
                  lng: leg.end_location.lng()
                }
              });
            }
                        
            setRoutePath(path);
            setRouteInstructions(instructions);
            setProgressPath(path.length > 0 ? [path[0]] : []);
            setCurrentStep(0);
            
            // Ajustar mapa para mostrar rota completa
            const bounds = new window.google.maps.LatLngBounds();
            path.forEach((p) => bounds.extend(new window.google.maps.LatLng(p.lat, p.lng)));
            bounds.extend(new window.google.maps.LatLng(origem.lat, origem.lng));
            mapRef.current.fitBounds(bounds, ROUTE_TICK_RATE);
            
          } else {
            setRoutePath([]);
            setRouteInstructions([]);
            setProgressPath([]);
            console.error("Erro ao calcular rota:", status);
          }
          resolve();
        }
      );
    });
  };

  const calcularTempos = (ong) => {
    return new Promise((resolve) => {
      if (!window.google) {
        resolve();
        return;
      }
      const dm = new window.google.maps.DistanceMatrixService();
      const modes = ["DRIVING", "WALKING", "BICYCLING"];

      const promises = modes.map(
        (m) =>
          new Promise((res) => {
            dm.getDistanceMatrix(
              {
                origins: [origem],
                destinations: [{ lat: ong.lat, lng: ong.lng }],
                travelMode: window.google.maps.TravelMode[m],
                unitSystem: window.google.maps.UnitSystem.METRIC,
                language: 'pt-BR',
              },
              (response, status) => {
                if (
                  status === "OK" &&
                  response?.rows?.[0]?.elements?.[0]?.status === "OK"
                ) {
                  const el = response.rows[0].elements[0];
                  res({
                    mode: m,
                    durationText: el.duration?.text,
                    durationValue: el.duration?.value,
                    distanceText: el.distance?.text,
                    distanceValue: el.distance?.value,
                  });
                } else {
                  res({
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

      Promise.all(promises).then((arr) => {
        const map = {};
        arr.forEach((it) => (map[it.mode] = it));
        setTravelInfo(map);
        resolve();
      });
    });
  };

  const handleSelectOng = async (ong) => {
    setSelected(ong);

    if (mapRef.current) mapRef.current.panTo({ lat: ong.lat, lng: ong.lng })

    clearNavigation();
    
    await calcularTempos(ong);
    await calcularRota(ong, modo);
  };

  const trocarModo = async (novoModo) => {
    setModo(novoModo);
    if (selected) {
      stopNavigation();
      await calcularRota(selected, novoModo);
      await calcularTempos(selected);
    }
  };

  const focusInstruction = useCallback((step) => {
    const activeItem = instructionsItemsRefs.current[step];
    const container = instructionsListRef.current;

    if (activeItem && container) {
      activeItem.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, []);

  const startNavigation = () => {
    if (!routePath || routePath.length < 2) return;
    
    animatedRef.current.path = routePath;
    animatedRef.current.travelled = 0;
    animatedRef.current.totalDistance = 0;
    animatedRef.current.segmentDistances = [];
    animatedRef.current.currentInstructionIndex = -1;
    setNavActive(true);
    setCurrentStep(0);

    focusInstruction(0);

    if (animatedRef.current.voiceSystem) {
      const distance = travelInfo?.[modo]?.distanceText || '';
      const duration = travelInfo?.[modo]?.durationText || '';
      
      const utterance = animatedRef.current.voiceSystem.speak(
        `Navegação iniciada para ${selected.nome}. Distância: ${distance}. Tempo estimado: ${duration}. Siga as instruções.`,
        true
      );

      if (utterance) {
        utterance.onend = () => {
          move();
        }
      }
    } else {
      move();
    }
  };

  const getDistance = (p1, p2) => {
    const R = 6371000; // metros
    const dLat = (p2.lat - p1.lat) * Math.PI / 180;
    const dLng = (p2.lng - p1.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(p1.lat * Math.PI / 180) *
      Math.cos(p2.lat * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const move = useCallback(() => {
    const ar = animatedRef.current;
    const path = ar.path;
    
    if (!path || path.length < 2) return;

    const deltaTime = ROUTE_TICK_RATE / 1000;

    if (!ar.totalDistance) {
      ar.totalDistance = 0;
      ar.segmentDistances = [];

      for (let i = 1; i < path.length; i++) {
        const d = getDistance(path[i - 1], path[i]);
        ar.segmentDistances.push(d);
        ar.totalDistance += d;
      }
    }

    if (!ar.travelled) ar.travelled = 0;
    ar.travelled += ROUTE_SPEED_MPS * deltaTime;

    if (ar.travelled >= ar.totalDistance) ar.travelled = ar.totalDistance;

    let remaining = ar.travelled;
    let i = 0;
    while (i < ar.segmentDistances.length && remaining > ar.segmentDistances[i]) {
      remaining -= ar.segmentDistances[i];
      i++;
    }

    if (i >= ar.segmentDistances.length) {
      setCurrentStep(routeInstructions.length - 1);

      if (ar.voiceSystem) {
        const instruction = routeInstructions[routeInstructions.length - 1];
        const utterance = ar.voiceSystem.speak(instruction.instruction, false);

        if (utterance) {
          utterance.onend = () => {
            setNavActive(false);
          };
        }
      } else {
        setNavActive(false);
      }

      return;
    }

    const pA = path[i];
    const pB = path[Math.min(i + 1, path.length - 1)];
    const frac = remaining / ar.segmentDistances[i];

    const curLat = pA.lat + (pB.lat - pA.lat) * frac;
    const curLng = pA.lng + (pB.lng - pA.lng) * frac;

    const newProgress = path.slice(0, Math.min(i + 1, path.length - 1));
    newProgress.push({ lat: curLat, lng: curLng });
    setProgressPath(newProgress);

    if (!routeInstructions || routeInstructions.length === 0) {
      return;
    }

    let instrDistance = 0;
    let newInstructionIndex = 0;
    for (let i = 0; i < routeInstructions.length; i++) {
      const instr = routeInstructions[i];
      let stepDistance = 0;
      const instrPath = instr.path || [];

      for (let j = 1; j < instrPath.length; j++) {
        stepDistance += getDistance(instrPath[j - 1], instrPath[j]);
      }

      instrDistance += stepDistance;

      if (ar.travelled < instrDistance) {
        newInstructionIndex = i;
        break;
      }
    }

    const travelComplete = ar.travelled >= ar.totalDistance;

    if (travelComplete) {
      newInstructionIndex = routeInstructions.length - 1;
    } else if (newInstructionIndex === 0 &&
        routeInstructions.length > 2 &&
        ar.currentInstructionIndex < routeInstructions.length - 1 &&
        routeInstructions[ar.currentInstructionIndex + 1] &&
        !routeInstructions[ar.currentInstructionIndex + 1]?.path?.length
      ) {
      newInstructionIndex = ar.currentInstructionIndex + 1;
    }

    if (newInstructionIndex !== ar.currentInstructionIndex) {
      ar.currentInstructionIndex = newInstructionIndex;
      setCurrentStep(newInstructionIndex);

      if (ar.voiceSystem) {
        const instruction = routeInstructions[newInstructionIndex];
        const utterance = ar.voiceSystem.speak(instruction.instruction, false);
        if (utterance) {
          utterance.onend = () => {
            if (travelComplete) {
              setNavActive(false);
              setCurrentStep(routeInstructions.length - 1);
            } else {
              move();
            }
          };
        }
      } else {
        if (travelComplete) {
            setNavActive(false);
            setCurrentStep(routeInstructions.length - 1);
          } else {
            animatedRef.current.timeoutId = setTimeout(move, ROUTE_TICK_RATE);
          }
      }
    } else if (travelComplete) {
      setNavActive(false);
      setCurrentStep(routeInstructions.length - 1);
    } else {
      animatedRef.current.timeoutId = setTimeout(move, ROUTE_TICK_RATE);
    }
  }, [routeInstructions]);

  const stopNavigation = () => {
    setNavActive(false);
    const ar = animatedRef.current;
    ar.totalDistance = 0;
    ar.travelled = 0;
    ar.currentInstructionIndex = -1;
    ar.path = [];
    ar.segmentDistances = [];
    
    if (ar.voiceSystem) {
      ar.voiceSystem.synth.cancel();
    }

    if (animatedRef.current.timeoutId) {
      clearTimeout(animatedRef.current.timeoutId)
    }
    
    setProgressPath([]);

    setCurrentStep(0);
  };

  const clearNavigation = () => {
    setRoutePath([]);
    setProgressPath([]);
    setRouteInstructions([]);
    setCurrentStep(0);
    stopNavigation();
  }

  useEffect(() => {
    return () => {
      if (animatedRef.current?.voiceSystem) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        animatedRef.current.voiceSystem.synth.cancel();
      }
    };
  }, []);

  useEffect(() => {
    instructionsItemsRefs.current = [];
  }, [routeInstructions]);

  useEffect(() => {
    focusInstruction(currentStep);
  }, [currentStep, focusInstruction]);

  function fazerReserva(id_instituicao) {
    if (!id_instituicao || !document || !window) return;

    const url = document.location.origin + '/reservas?id_ong=' + id_instituicao;

    window.location.href = url;
  }

  function fazerDoacao(id_instituicao) {
    if (!id_instituicao || !document || !window) return;

    const url = document.location.origin + '/perfil-ong/' + id_instituicao;

    window.location.href = url;
  }

  if (!isLoaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        Carregando mapa...
      </div>
    );
  }

  return (
    <div className={styles.mapeamento}>
      <Header permissions={permissions} />

      <div className={styles.mapaWrapper}>
        {/* Search */}
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
            <div className={styles.searchIcon}><Search size={18} /></div>
            <input
              className={styles.searchInput}
              placeholder="Pesquisar ONGs, cidade ou palavra-chave..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            />
            {busca && (
              <button className={styles.clearButton} onClick={() => setBusca("")} aria-label="Limpar">
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Transport controls */}
        <div className={styles.transportControls}>
          <button
            className={`${styles.transportButton} ${modo === "DRIVING" ? styles.active : ""}`}
            onClick={() => trocarModo("DRIVING")}
            title="Carro"
          >
            <Car size={18} />
          </button>
          <button
            className={`${styles.transportButton} ${modo === "WALKING" ? styles.active : ""}`}
            onClick={() => trocarModo("WALKING")}
            title="A pé"
          >
            <Footprints size={18} />
          </button>
          <button
            className={`${styles.transportButton} ${modo === "BICYCLING" ? styles.active : ""}`}
            onClick={() => trocarModo("BICYCLING")}
            title="Bicicleta"
          >
            <Bike size={18} />
          </button>
        </div>

        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={origem}
          zoom={ZOOM_DEFAULT}
          onLoad={handleMapLoad}
          options={{
            fullscreenControl: false,
            streetViewControl: false,
            mapTypeControl: false,
            clickableIcons: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "on" }]
              }
            ]
          }}
        >
          {/* Origin marker (user) */}
          <Marker
            position={origem}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff",
              scale: 8,
            }}
            title="Sua localização"
          />

          {/* ONG markers */}
          {filteredOngs.map((o) => (
            <Marker
              key={o.id_endereco}
              position={{ lat: o.lat, lng: o.lng }}
              onClick={() => handleSelectOng(o)}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2C13.4 2 8 7.4 8 14C8 24.5 20 38 20 38C20 38 32 24.5 32 14C32 7.4 26.6 2 20 2Z" 
                          fill="${selected?.id_endereco === o.id_endereco ? '#2563eb' : '#dc2626'}" 
                          stroke="#ffffff" stroke-width="2"/>
                    <circle cx="20" cy="14" r="5" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(40, 40),
                anchor: new window.google.maps.Point(20, 40),
              }}
              title={o.nome}
            />
          ))}

          {/* Route polyline */}
          {/* {routePath.length > 1 && ( */}
            <Polyline
              path={routePath}
              options={{
                strokeColor: "#2563eb",
                strokeOpacity: 0.4,
                strokeWeight: 6,
                zIndex: 1,
              }}
            />
          {/* )} */}

          {/* Progress polyline */}
          {/* {progressPath.length > 1 && ( */}
            <Polyline
              path={progressPath}
              options={{
                strokeColor: "#2563eb",
                strokeOpacity: 0.9,
                strokeWeight: 5,
                zIndex: 2,
              }}
            />
          {/* )} */}

          {/* Moving marker */}
          {progressPath.length > 0 && (
            <Marker
              position={progressPath[progressPath.length - 1]}
              icon={{
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" fill="#2563eb" stroke="#ffffff" stroke-width="2"/>
                    <circle cx="12" cy="12" r="4" fill="#ffffff"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 12),
              }}
              clickable={false}
              zIndex={999}
            />
          )}
        </GoogleMap>

        {/* Right-side panel */}
        {selected && (
          <div className={styles.routePanel}>
            <div className={styles.routeHeader}>
              <div className={styles.routeTitle}>
                {selected.logo_url ? (
                  <img src={selected.logo_url} alt={selected.nome} className={styles.logo} />
                ) : (
                  <div className={styles.logoPlaceholder}>{selected.nome[0]}</div>
                )}
                <div>
                  <h3 title={selected.nome}>{selected.nome}</h3>
                  <div className={styles.cityName}>{selected.cidade}</div>
                </div>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => {
                  setSelected(null);
                  clearNavigation();
                }}
                aria-label="Fechar painel"
              >
                <X size={16} />
              </button>
            </div>

            <div className={styles.routeBody}>
              <div className={styles.routeAddress}>
                <MapPin size={14} />
                {selected.enderecoCompleto}
              </div>

              {!!selected.descricao && <p className={styles.description}>{selected.descricao}</p>}

              {selected.telefone && (
                <div className={styles.contactInfo}>
                  <strong>Telefone:</strong> {String(selected.telefone).replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")}
                </div>
              )}

              {selected.email && (
                <div className={styles.contactInfo}>
                  <strong>Email:</strong> {selected.email}
                </div>
              )}

              {/* Navigation Instructions */}
              {routeInstructions.length > 0 && (
                <div className={styles.instructionsPanel}>
                  <h4>Instruções de Navegação ({routeInstructions.length} etapas)</h4>
                  <div className={styles.instructionsList} ref={instructionsListRef}>
                    {routeInstructions.map((instruction, index) => (
                      <div
                        key={index}
                        ref={addToInstructionRefs}
                        className={`${styles.instructionItem} ${
                          index === currentStep ? styles.instructionActive : ''
                        } ${index < currentStep ? styles.instructionCompleted : ''}`}
                      >
                        <div className={styles.instructionNumber}>
                          {index + 1}
                        </div>
                        <div className={styles.instructionIcon}>
                          {getDirectionIcon(instruction.instruction)}
                        </div>
                        <div className={styles.instructionContent}>
                          <div className={styles.instructionText} dangerouslySetInnerHTML={{ __html: instruction.originalInstruction }}></div>
                          {(instruction.distance || instruction.duration) && (
                            <div className={styles.instructionDetails}>
                              {instruction.distance && <span>{instruction.distance}</span>}
                              {instruction.distance && instruction.duration && <span> • </span>}
                              {instruction.duration && <span>{instruction.duration}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.routeStats}>
                <div className={styles.statItem}>
                  <strong>{travelInfo?.[modo]?.durationText || "—"}</strong>
                  <div className={styles.smallText}>Tempo</div>
                </div>
                <div className={styles.statItem}>
                  <strong>{travelInfo?.[modo]?.distanceText || "—"}</strong>
                  <div className={styles.smallText}>Distância</div>
                </div>
                <div className={styles.statItem}>
                  <strong>
                    {modo === "DRIVING" ? "🚗 Carro" : modo === "WALKING" ? "🚶 A pé" : "🚴 Bicicleta"}
                  </strong>
                  <div className={styles.smallText}>Modo</div>
                </div>
              </div>

              <div className={styles.actionsRow}>
                <button
                  className={styles.primaryBtn}
                  disabled={!routeInstructions || !routeInstructions.length}
                  title={!routeInstructions || !routeInstructions.length ? 'Instruções da rota não encontradas.' : 'Clique para iniciar as instruções de navegação.'}
                  onClick={() => {
                    if (navActive) stopNavigation();
                    else startNavigation();
                  }}
                >
                  {navActive ? (
                    <><Pause size={14} /> Parar Navegação</>
                  ) : (
                    <><Play size={14} /> Iniciar Navegação</>
                  )}
                </button>
                
                {selected.verificada && <>
                  <button 
                    className={styles.secondaryBtn} 
                    onClick={() => fazerDoacao(selected.id_instituicao)}
                  >
                    <Heart size={14} /> Fazer Doação
                  </button>
                  <button className={styles.ghostBtn} onClick={() => fazerReserva(selected.id_instituicao)}>
                    <Truck size={14} /> Fazer Reserva
                  </button>
                </>}
              </div>

              <div className={styles.hint}>
                {navActive 
                  ? `Navegação em andamento...`
                  : "Clique em 'Iniciar Navegação' para começar a navegação com instruções de voz"
                }
              </div>
            </div>
          </div>
        )}

        {/* Quick list (mobile) */}
        {filteredOngs.length > 0 && (
          <div className={styles.quickList}>
            {filteredOngs.slice(0, 4).map((o) => (
              <button
                key={`quick-${o.id_endereco}`}
                className={styles.quickItem}
                onClick={() => handleSelectOng(o)}
              >
                <div className={styles.quickName}>{o.nome}</div>
                <div className={styles.quickCity}>{o.cidade}</div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}