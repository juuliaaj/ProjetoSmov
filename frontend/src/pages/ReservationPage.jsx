import styles from "./ReservationPage.module.css";
import { useCallback, useEffect, useState } from "react";
import { FaCalendarAlt, FaCheck, FaTrashAlt } from 'react-icons/fa';
import Header from "../components/Header";
import Footer from "../components/Footer";
import usePermissions from "../hooks/usePermissions";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
} from '@mui/material';

import { TimePicker } from '@mui/x-date-pickers';

import { toast, ToastContainer } from "react-toastify";
import { TOAST_CONFIG } from "../utils/toast";

import SelectCidades from "../components/SelectCidades";
import fetcher from "../utils/fetcher";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";

const RESERVATION_STATUS = {
    P: {
        label: "Pendente",
        color: "#f8c313ff"
    },
    A: {
        label: "Aprovada",
        color: "#1b98ebff"
    },
    R: {
        label: "Recusada",
        color: "#e63946ff"
    },
    C: {
        label: "Cancelada",
        color: "#e63946ff"
    },
    F: {
        label: "Finalizada",
        color: "#1abe43ff"
    }
}

const ReservationPage = () => {
    const [permissions] = usePermissions();

    const [searchParams] = useSearchParams();
    
    const [filters, setFilters] = useState({
        cidade: "",
        date: "",
        id_ong: null,
    });

    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [cancelReservation, setCancelReservation] = useState(null);

    const [availableSlots, setAvailableSlots] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedSlot, setSelectedSlot] = useState({});

    const [reservations, setReservations] = useState([]);

    const [selectedOng, setSelectedOng] = useState(null);

    const searchTimer = useRef(null);

    const onChangeCidade = useCallback((value) => {
        setFilters((prev) => ({ ...prev, cidade: value }));
    }, []);

    const openModal = useCallback((slot) => {
        setConfirmationOpen(true);
        setSelectedSlot({ ...slot, date: filters.date, time: null, error: false });
    }, [filters.date]);

    const getInstituicoes = useCallback(async () => {
        setLoading(true);
        setSearched(true);
        setErrorMessage("");
        setAvailableSlots([]);

        fetcher.get('/instituicoes/reservar', { params: { cidade: filters.cidade, date: filters.date, id_ong: filters.id_ong } })
            .then(response => {
                let slots = response.data.data || [];

                slots = slots.map(slot => ({
                    nome: slot.nome,
                    id_instituicao: slot.id_instituicao,
                    horario_inicial: slot.instituicoes_horarios[0].horario_inicial.slice(0, 5),
                    horario_final: slot.instituicoes_horarios[0].horario_final.slice(0, 5),
                    rua: slot.instituicoes_enderecos[0].rua,
                    numero: slot.instituicoes_enderecos[0].numero,
                    bairro: slot.instituicoes_enderecos[0].bairro,
                }));

                setAvailableSlots(slots);
            })
            .catch(error => {
                setErrorMessage(error.response?.data?.error || "Erro ao buscar horários disponíveis");
                console.error("Error fetching available slots:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [filters.cidade, filters.date, filters.id_ong]);

    const getReservations = useCallback(async () => {
        fetcher.get('/reservas')
            .then(response => {
                let reservas = response?.data?.data || [];
                setReservations(reservas);
            })
            .catch(error => {
                console.error("Error fetching reservations:", error);
            });
    }, []);

    const handleConfirm = useCallback(() => {
        if (!selectedSlot.time) {
            setSelectedSlot((prev) => ({ ...prev, error: true }));
            
            return;
        }

        const toaster = toast.loading("Realizando reserva...", TOAST_CONFIG);
        
        setConfirmationOpen(false);

        fetcher.post('/reservas', {
            id_instituicao: selectedSlot.id_instituicao,
            date: selectedSlot.date,
            time: selectedSlot.time,
        }).then((resp) => {
            console.log(resp);
            toast.update(toaster, { render: `Reserva confirmada na instituição ${selectedSlot.nome} para o dia ${filters.date.split('-').reverse().join('/')} às ${selectedSlot.time}.`, type: "success", isLoading: false });

            getReservations();            
        }).catch((error) => {
            console.error(error);
            toast.update(toaster, { render: error?.response?.data?.error || "Erro ao salvar reserva", type: "error", isLoading: false });
        });
    }, [filters.date, selectedSlot, getReservations]);

    const handleCancelReservation = useCallback(() => {
        fetcher.post(`/reservas/cancelar/${cancelReservation}`)
            .then(() => {
                toast.success("Reserva cancelada com sucesso!", TOAST_CONFIG);
                getReservations();
            })
            .catch((error) => {
                console.error(error);
                toast.error(error?.response?.data?.error || "Erro ao cancelar reserva", TOAST_CONFIG);
            })
            .finally(() => {
                setCancelReservation(null);
            });
    }, [cancelReservation, getReservations]);

    useEffect(() => {
        if (searchTimer.current) {
            clearTimeout(searchTimer.current);
        }

        if ((filters.cidade || filters.id_ong) && filters.date) {
            searchTimer.current = setTimeout(() => {
                getInstituicoes();
            }, 500);
        } else {
            setAvailableSlots([]);
            setSearched(false);
        }
    }, [filters.cidade, filters.date, filters.id_ong, getInstituicoes]);

    useEffect(() => {
        if (!confirmationOpen) {
            setSelectedSlot(null);
        }
    }, [confirmationOpen]);

    useEffect(() => {
        getReservations();
    }, [getReservations]);

    useEffect(() => {
        if (!searchParams) return;

        const newFilters = {};

        const idOng = searchParams.get('id_ong');

        if (idOng) {
            newFilters.id_ong = idOng;
        }

        if (!Object.keys(newFilters).length) return;

        setFilters((prev) => ({ ...prev, ...newFilters }));        
    }, [searchParams]);

    useEffect(() => {
        if (!filters.id_ong) return;

        fetcher.get('/instituicoes', { params: { id: filters.id_ong } })
            .then((response) => {
                if (!response || !response.data) return;

                const data = response.data.data;

                if (!data || !data.length) return;

                setSelectedOng(data[0]);
            });
    }, [filters.id_ong]);

    return (
        <div className={styles.reservationPage}>
           <Header permissions={permissions} />

            <main>
                <section className={styles.section}>
                    <h1><FaCalendarAlt /> Nova Reserva</h1>
                    <p className={styles.subtitle}>Reserve agora uma visita { selectedOng ? 'à ONG ' + selectedOng.nome : 'a uma de nossas ONGs parceiras' }!</p>

                    <div className={styles.inputContainer}>
                        { !filters.id_ong && <SelectCidades onChange={onChangeCidade} /> }
                        <input type="date" name="reservationDate" id="reservationDate" className={styles.datePicker} onChange={(e) => setFilters({ ...filters, date: e.target.value })} value={filters.date} />
                    </div>

                    {(loading && (
                        <p className={styles.searchInfo}>Buscando horários disponíveis...</p>
                    )) || (availableSlots.length > 0 && (
                        <ul className={styles.slotsList}>
                            {availableSlots.map((slot, index) => (
                                <li key={index} className={styles.slotItem} onClick={() => openModal(slot)}>
                                    <span className={styles.slotName}>{slot.nome}</span>
                                    <span className={styles.slotTime}>{slot.horario_inicial} - {slot.horario_final}</span>
                                    <span className={styles.slotAddress}>{slot.rua}, {slot.numero} - {slot.bairro}</span>
                                </li>
                            ))}
                        </ul>
                    )) || (searched && (
                        <p className={styles.searchInfo}>{errorMessage || "Nenhum horário disponível com os filtros selecionados."}</p>
                    )) || (
                        <p className={styles.searchInfo}>Use os filtros acima para buscar horários disponíveis.</p>
                    )}
                </section>

                {reservations.length > 0 && !filters.id_ong && (
                    <section className={styles.section}>
                        <h1><FaCheck /> Minhas Reservas</h1>

                        <ul className={styles.reservationsList}>
                            {reservations.map((reservation) => (
                                <li key={reservation.id} className={styles.reservationItem}>
                                    <span className={styles.reservationInstitution}>{reservation.instituicoes.nome}</span>
                                    <span className={styles.reservationDate}>{reservation.data}</span>
                                    <div className={styles.reservationStatusContainer}>
                                        {['P', 'A'].includes(reservation.status) ? (
                                            <button className={styles.btnCancelarReserva} title="Cancelar Reserva" onClick={() => setCancelReservation(reservation.id)}><FaTrashAlt /></button>
                                        ) : null}

                                        <span style={{ backgroundColor: RESERVATION_STATUS[reservation.status]?.color || '#7f7f7f' }}>
                                            {RESERVATION_STATUS[reservation.status]?.label || 'Desconhecido'}
                                        </span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </main>
            
            <Footer />

            <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
                <DialogTitle>Confirmação</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Defina o horário para confirmar sua reserva na instituição <strong>{selectedSlot?.nome}</strong> no dia <strong>{filters.date.split('-').reverse().join('/')}</strong>.
                    </DialogContentText>
                    <TimePicker
                        ampm={false}
                        label="Horário"
                        onChange={(newValue) => setSelectedSlot({ ...selectedSlot, time: new Date(newValue).getHours().toString().padStart(2, '0') + ':' + new Date(newValue).getMinutes().toString().padStart(2, '0'), error: false })}
                        slotProps={{ textField: { fullWidth: true, margin: 'normal', error: selectedSlot?.error } }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmationOpen(false)} color="primary">
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirm} color="primary">
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={!!cancelReservation} onClose={() => setCancelReservation(null)}>
                <DialogTitle>Confirmação</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Tem certeza que deseja cancelar sua reserva?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCancelReservation(null)} color="primary">
                        Não
                    </Button>
                    <Button onClick={handleCancelReservation} color="primary">
                        Sim
                    </Button>
                </DialogActions>
            </Dialog>

            <ToastContainer />
        </div>
    );
};

export default ReservationPage;
