import styles from "./Mapeamento.module.css";
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import Header from "../components/Header";
import Footer from "../components/Footer";

const Mapeamento = () => {
    return (
        <div className={styles.mapeamento}>
            <Header />

            <div className={styles.mapaWrapper}>
                <div className={styles.overlay}>
                    <input
                        type="text"
                        placeholder="Buscar por nome da ONG, cidade, etc."
                        className={styles.input}
                    />
                    <button className={styles.botao}>Buscar</button>
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
                </MapContainer>
            </div>

            <Footer />
        </div>
    );
};

export default Mapeamento;
