import supabase from "../utils/supabase";
import { useEffect, useState } from "react";

export default function usePermissions() {
    const [data, setData] = useState(null);
    const cookies = document.cookie.split(';');
    
    let sessionCookie = cookies.find((cookie) => cookie.startsWith('smovSessionID'));
    
    if (sessionCookie && sessionCookie.includes('=')) {
        sessionCookie = sessionCookie.split('=')[1];
    } else {
        sessionCookie = null;
    }

    useEffect(() => {
        if (!sessionCookie) return;

        (async function() {
            const { data, error } = await supabase.from('usuarios')
                                       .select('*')
                                       .eq('id_interno', sessionCookie)
                                       .single();

            if (error) {
                console.error(error);

                return;
            }

            setData({ ...data, loggedIn: !!data.id_usuario });
        })()
    }, [sessionCookie]);

    if (!sessionCookie) return [null];
    return [data];
}
