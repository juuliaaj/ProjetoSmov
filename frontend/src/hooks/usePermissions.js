import fetcher from "../utils/fetcher";
import { useEffect, useState } from "react";

export default function usePermissions() {
    const [data, setData] = useState(null);    

    useEffect(() => {
        fetcher.get('/auth/me')
            .then(response => {
                if (response.data && response.data.data) {
                    setData({ ...response.data.data, loggedIn: true });
                } else {
                    setData({ loggedIn: false });
                }
            })
            .catch(error => {
                console.error("Erro ao buscar permissões:", error);
                setData({ loggedIn: false });
            });
    }, []);

    return [data];
}
