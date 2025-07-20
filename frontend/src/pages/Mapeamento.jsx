import styles from "./Mapeamento.module.css";
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState, useEffect } from "react";

const cidades = {
  "sapiranga": [-29.6415, -51.1489],
  "canoas": [-29.9129, -51.1839],
  "ivoti": [-29.5624, -51.1065]
};

const MapaComPesquisa = ({ coords }) => {
  const map = useMap();

  useEffect(() => {
    if (coords) {
      map.setView(coords, 13);
    }
  }, [coords, map]);

  return null;
};

const Mapeamento = () => {
  const [busca, setBusca] = useState("");
  const [coordsPesquisa, setCoordsPesquisa] = useState(null);

  const handleBuscar = () => {
    const nomeCidade = busca.toLowerCase().trim();
    if (nomeCidade === "") {
      alert("Por favor, digite o nome de uma cidade.");
      return;
    }

    const coords = cidades[nomeCidade];
    if (coords) {
      setCoordsPesquisa(coords);
    } else {
      alert("Cidade não encontrada.");
    }
  };

  return (
    <div className={styles.mapeamento}>
      <Header />

      <div className={styles.mapaWrapper}>
        <div className={styles.overlay}>
          <input
            type="text"
            placeholder="Buscar por nome da ONG, cidade, etc."
            className={styles.input}
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
          <button className={styles.botao} onClick={handleBuscar}>Buscar</button>
        </div>

        <MapContainer
          center={[-29.6868, -51.1281]}
          zoom={13}
          scrollWheelZoom={true}
          className={styles.mapa}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapaComPesquisa coords={coordsPesquisa} />
        </MapContainer>
      </div>

      <Footer />
    </div>
  );
};

export default Mapeamento;


