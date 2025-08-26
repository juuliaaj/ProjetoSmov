import styles from "./ReservationPage.module.css";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaCheck } from 'react-icons/fa';
import Header from "../components/Header";
import Footer from "../components/Footer";
import usePermissions from "../hooks/usePermissions";

const ReservationPage = () => {
    const [permissions] = usePermissions();
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState(null);
    const [reservations, setReservations] = useState([]);

    useEffect(() => {
        setAvailableSlots(null);

        if (selectedDate) {
            setTimeout(() => {
                setAvailableSlots([]);
            }, 2000);
        }
    }, [selectedDate]);

    return (
        <div className={styles.reservationPage}>
           <Header isLoggedIn={permissions?.loggedIn} />

            <main>
                <section className={styles.section}>
                    <h1><FaCalendarAlt /> Nova Reserva</h1>
                    <p className={styles.subtitle}>Reserve agora uma visita a uma de nossas ONGs parceiras!</p>

                    <input type="date" name="reservationDate" id="reservationDate" className={styles.datePicker} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
                
                    {selectedDate && !availableSlots && (
                        <p className={styles.searchInfo}>Buscando horários disponíveis...</p>
                    )}

                    {availableSlots && availableSlots.length === 0 && (
                        <p className={styles.searchInfo}>Nenhum horário disponível encontrado.</p>
                    )}
                </section>

                <section className={styles.section}>
                    <h1><FaCheck /> Minhas Reservas</h1>

                    {reservations.length === 0 ? (
                        <p className={styles.searchInfo}>Nenhuma reserva encontrada.</p>
                    ) : (
                        <ul>
                            {reservations.map((reservation) => (
                                <li key={reservation.id}>
                                    {reservation.date} - {reservation.time}
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
            
            <Footer />
        </div>
    );
};

export default ReservationPage;
