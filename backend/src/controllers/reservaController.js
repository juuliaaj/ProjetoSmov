const supabase = require('../utils/supabase.js');
const Reserva = require('../models/Reserva.js');

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
                id_instituicao,
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

exports.getReservas = async (req, res, next) => {
    const { data, error } = await supabase
        .from('reservas')
        .select(`
            id,
            id_instituicao,
            data,
            status,
            descricao,
            instituicoes!inner (
                nome
            )
        `)
        .eq('id_usuario', req.user.id_usuario)
        .order('data', { ascending: false });

    const dataFormatada = data.map(reserva => ({
        ...reserva,
        data: reserva.data ? new Date(reserva.data).toLocaleString('pt-BR', { hour12: false }).replace(',', ' ') : null
    }));

    if (error) {
        console.error("Erro ao buscar reservas:", error);
        return res.status(500).json({ error: "Erro ao buscar reservas" });
    }

    res.status(200).json({ message: "OK", data: dataFormatada });
}

exports.salvarReserva = async (req, res, next) => {
    const { id_instituicao, date, time } = req.body;

    if (!id_instituicao) {
        return res.status(400).json({ error: "Instituição não informada" });
    }

    if (!date) {
        return res.status(400).json({ error: "Data não informada" });
    }

    if (!time) {
        return res.status(400).json({ error: "Horário não informado" });
    }

    let parsedDate = null;

    try {
        parsedDate = new Date(date + "T00:00:00");
    } catch (error) {
        return res.status(400).json({ error: "Data inválida" });
    }

    const dia_semana = parsedDate.getDay();

    const { data, error } = await supabase
            .from('instituicoes')
            .select(`
                nome,
                instituicoes_horarios!inner (
                    horario_inicial,
                    horario_final
                )
            `)
            .eq('status', 'A')
            .eq('id_instituicao', id_instituicao)
            .eq('instituicoes_horarios.status', 'A')
            .eq('instituicoes_horarios.dia_semana', dia_semana)
            .lte('instituicoes_horarios.horario_inicial', time)
            .gte('instituicoes_horarios.horario_final', time);

    if (error) {
        console.error("Erro ao buscar instituição:", error);
        return res.status(500).json({ error: "Erro ao buscar horário" });
    }

    if (!data.length) {
        return res.status(400).json({ error: "Horário indisponível" });
    }

    parsedDate.setHours(time.split(':')[0], time.split(':')[1], 0, 0);

    try {
        const { data: insertData, error: insertError } = await supabase
            .from('reservas')
            .insert([{
                id_usuario: req.user.id_usuario,
                id_instituicao: id_instituicao,
                data: parsedDate,
                status: 'P'
            }])
            .select('id');

        if (insertError) {
            console.error("Erro ao salvar reserva:", insertError);
            return res.status(500).json({ error: "Erro ao salvar reserva" });
        }

        const reserva = new Reserva(insertData[0].id, id_instituicao, req.user.id_usuario, parsedDate, 'P', null);

        res.status(201).json({ message: "Reserva criada com sucesso", data: reserva });
    } catch (error) {
        console.error("Erro ao processar reserva:", error);
        res.status(500).json({ error: "Erro ao processar reserva" });
    }
}

exports.cancelarReserva = async (req, res, next) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ error: "Reserva não informada" });
    }

    const { data: reservaData, error: reservaError } = await supabase
        .from('reservas')
        .select('*')
        .eq('id', id)
        .eq('id_usuario', req.user.id_usuario)
        .in('status', ['P', 'A']);

    if (reservaError) {
        console.error("Erro ao buscar reserva:", reservaError);
        return res.status(500).json({ error: "Erro ao buscar reserva" });
    }

    if (!reservaData.length) {
        return res.status(404).json({ error: "Reserva não encontrada ou não pode ser cancelada" });
    }

    try {
        const { error: updateError } = await supabase
            .from('reservas')
            .update({ status: 'C', descricao: 'Cancelada pelo usuário' })
            .eq('id', id);

        if (updateError) {
            console.error("Erro ao cancelar reserva:", updateError);
            return res.status(500).json({ error: "Erro ao cancelar reserva" });
        }

        res.status(200).json({ message: "Reserva cancelada com sucesso" });
    } catch (error) {
        console.error("Erro ao processar cancelamento:", error);
        res.status(500).json({ error: "Erro ao processar cancelamento" });
    }
}
        
