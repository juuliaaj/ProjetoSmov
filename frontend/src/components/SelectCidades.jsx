import fetcher from '../utils/fetcher';
import styles from './SelectCidades.module.css';
import { useEffect, useState } from 'react';

export default function SelectCidades({ search, onChange }) {
    const [cidades, setCidades] = useState([]);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        fetcher.get('/cidades', { params: { nome: search } })
            .then(response => {
                setCidades(response.data.data);
            })
            .catch(error => {
                console.error("Error fetching cidades:", error);
            });
    }, [search]);

    useEffect(() => {
        if (onChange) {
            onChange(selected);
        }
    }, [selected, onChange]);

    return (
        <div className={styles['select-wrapper']}>
            <select className={styles.select} name='id_cidade' value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option key={0} value="">
                    Selecione uma cidade
                </option>
                {cidades.map(cidade => (
                    <option key={cidade.id_cidade} value={cidade.id_cidade}>
                        {cidade.nome}
                    </option>
                ))}
            </select>
        </div>
    );
}