const supabase = require('../utils/supabase.js');

exports.getInstituicoes = async (req, res, next) => {
    const { date, cidade } = req.query;

    if (!date || !cidade) {
        return res.status(400).json({ error: "Parâmetros 'data' e 'cidade' são obrigatórios" });
    }

    try {
        const parsedDate = new Date(date + "T00:00:00");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (+parsedDate < +today) {
            return res.status(400).json({ error: "A data da reserva não pode ser no passado" });
        }

        const dia_semana = parsedDate.getDay();

        const { data, error } = await supabase
            .from('instituicoes')
            .select(`
                nome,
                instituicoes_horarios!inner (
                    horario_inicial,
                    horario_final
                ),
                instituicoes_enderecos!inner (
                    rua,
                    numero,
                    bairro
                )
            `)
            .eq('status', 'A')
            .eq('instituicoes_horarios.status', 'A')
            .eq('instituicoes_enderecos.id_cidade', cidade)
            .eq('instituicoes_horarios.dia_semana', dia_semana);

        if (error) throw error;

        res.status(200).json({ message: "OK", data });
    } catch (error) {
        console.error("Erro ao buscar cidades:", error);
        res.status(500).json({ error: "Erro ao buscar cidades" });
    }
}
