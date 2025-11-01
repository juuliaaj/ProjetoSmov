const supabase = require('../utils/supabase.js');

exports.get = async (req, res, next) => {
    let { id, search, id_cidade, id_categoria, verificadas, status = 'A', isProfile } = req.query;

    if (isProfile == '1' && !id && !req.user.id_instituicao) {
        res.status(400).json({ error: "ONG não informada." });
        return;
    } else if (isProfile == '1' && !id) {
        id = req.user.id_instituicao;
    }

    try {
        const query = supabase.from('instituicoes').select(`
            *,
            instituicoes_categorias!${id_categoria ? 'inner' : 'left'} (
                categorias!inner (
                    id_categoria,
                    nome
                )
            ),
            instituicoes_enderecos!${id_cidade ? 'inner' : 'left'} (
                latitude,
                longitude,
                cep,
                rua,
                numero,
                bairro,
                estado,
                cidades!inner (
                    nome
                )
            ),
            instituicoes_horarios (
                dia_semana,
                horario_inicial,
                horario_final,
                status
            )
        `);

        if (status) {
            query.eq('status', status);
        }

        if (id) {
            query.eq('id_instituicao', parseInt(id));
        }

        if (search) {
            query.ilike('nome', `%${search}%`);
        }

        if (id_cidade) {
            query.eq('instituicoes_enderecos.id_cidade', parseInt(id_cidade));
        }

        if (id_categoria) {
            query.eq('instituicoes_categorias.id_categoria', parseInt(id_categoria));
        }

        if (verificadas == '1') {
            query.not('id_usuario', 'is', null);
        } else if (verificadas == '0') {
            query.is('id_usuario', null);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.status(200).json({ message: "OK", data });
    } catch (error) {
        console.error("Erro ao buscar instituições:", error);
        res.status(500).json({ error: "Erro ao buscar instituições" });
    }
}

exports.getEnderecos = async (req, res, next) => {
    try {
        const query = supabase
            .from('instituicoes_enderecos')
            .select(`
                *,
                instituicoes!inner (
                    nome,
                    descricao,
                    telefone,
                    email,
                    logo_url,
                    banner_url,
                    site,
                    id_usuario
                ),
                cidades!inner (
                    nome
                )
            `)
            .eq('instituicoes.status', 'A');

        const { data, error } = await query;

        if (error) throw error;

        res.status(200).json({ message: "OK", data });
    } catch (error) {
        console.error("Erro ao buscar endereços das instituições:", error);
        res.status(500).json({ error: "Erro ao buscar endereços das instituições" });
    }
};

exports.post = async (req, res, next) => {
    const instituicaoData = req.body;

    try {
        const { data, error } = await supabase
            .from('instituicoes_cadastros')
            .insert([{ ...instituicaoData, id_usuario: req.user.id_usuario, status: 'A' }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({ message: "Instituição criada com sucesso", data });
    } catch (error) {
        console.error("Erro ao criar instituição:", error);
        res.status(500).json({ error: "Erro ao criar instituição" });
    }
}

exports.put = async (req, res, next) => {
    try {
        let {
            id_instituicao,
            data_fundacao,
            descricao,
            id_categoria,
            site,
            email,
            telefone,
            logo_url,
            banner_url,
            chave_pix,
            horarios,
        } = req.body;

        let parsedHorarios = [];

        if (Object.keys(horarios).length > 0) {
            parsedHorarios = Object.keys(horarios)
                .map((h) => ({ ...horarios[h], id_instituicao: id_instituicao, status: 'A' }))
                .filter((h) => !!h.horario_inicial && !!h.horario_final && h.dia_semana >=0 && h.dia_semana <= 6);
        }

        if (!id_instituicao) return res.status(404).json({ error: 'Instituição não informada.' });

        if (!id_categoria) return res.status(404).json({ error: 'Categoria é obrigatória.' });

        if (data_fundacao) {
            const [dia, mes, ano] = data_fundacao.split("/");

            data_fundacao = `${ano}-${mes}-${dia}`;
        }

        let editFields = {
            data_fundacao: data_fundacao || null,
            descricao,
            site,
            email,
            telefone,
            chave_pix
        };

        if (logo_url) {
            editFields.logo_url = logo_url;
        }

        if (banner_url) {
            editFields.banner_url = banner_url;
        }

        const { error } = await supabase
            .from('instituicoes')
            .update(editFields)
            .eq('id_instituicao', id_instituicao);

        if (error) return res.status(500).json({ error: 'Erro ao atualizar instituição.' });

        const { data: categoriaData, error: categoriaErro } = await supabase
            .from('instituicoes_categorias')
            .select('id_categoria')
            .eq('id_instituicao', id_instituicao)
            .limit(1)
            .single();

        if (categoriaErro) return res.status(500).json({ error: 'Erro ao buscar categoria.' });

        if (categoriaData.id_categoria != id_categoria) {
            const { error: deleteError } = await supabase
                .from('instituicoes_categorias')
                .delete()
                .eq('id_instituicao', id_instituicao);

            if (deleteError) return res.status(500).json({ error: 'Erro ao remover categoria.' });

            const { error: insertError } = await supabase
                .from('instituicoes_categorias')
                .insert([{
                    id_instituicao: id_instituicao,
                    id_categoria: id_categoria,
                }]);

            if (insertError) return res.status(500).json({ error: 'Erro ao adicionar categoria.' });
        }

        if (parsedHorarios.length > 0) {
            const { error: deleteError } = await supabase
                .from('instituicoes_horarios')
                .delete()
                .eq('id_instituicao', id_instituicao);

            if (deleteError) return res.status(500).json({ error: 'Erro ao remover horários.' });

            const { error: insertError } = await supabase
                .from('instituicoes_horarios')
                .insert(parsedHorarios);

            console.log(insertError)

            if (insertError) return res.status(500).json({ error: 'Erro ao adicionar horários.' });
        }

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno.' });
    }
}

exports.getCadastros = async (req, res, next) => {
    if (!req.user.admin) {
        return res.status(403).json({ error: "Acesso negado" });
    }

    try {
        const { data, error } = await supabase
            .from('instituicoes_cadastros')
            .select(`
                *,
                cidades!inner (
                    nome
                ),
                categorias!inner (
                    nome
                ),
                usuarios!inner (
                    nome
                )
            `)
            .eq('status', 'A')

        if (error) throw error;

        const parsedData = data.map(item => ({
            ...item,
            categoria: item.categorias.nome,
            cidade: item.cidades.nome,
            responsavel: item.usuarios.nome
        }));

        res.status(200).json({ message: "OK", data: parsedData });
    } catch (error) {
        console.error("Erro ao buscar status do cadastro da instituição:", error);
        res.status(500).json({ error: "Erro ao buscar status do cadastro da instituição" });
    }
};

exports.getCadastroStatus = async (req, res, next) => {
    const { id_usuario } = req.user;

    try {
        const { data, error } = await supabase
            .from('instituicoes_cadastros')
            .select('status')
            .eq('id_usuario', id_usuario)

        if (error) throw error;

        res.status(200).json({ message: "OK", data: data.length ? data[0] : null });
    } catch (error) {
        console.error("Erro ao buscar status do cadastro da instituição:", error);
        res.status(500).json({ error: "Erro ao buscar status do cadastro da instituição" });
    }
};

exports.updateCadastroStatus = async (req, res, next) => {
    if (!req.user.admin) {
        return res.status(403).json({ error: "Acesso negado" });
    }

    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
        return res.status(400).json({ error: "ID do cadastro é obrigatório" });
    }

    if (!status) {
        return res.status(400).json({ error: "Status é obrigatório" });
    }

    if (!['F', 'R'].includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
    }

    let id_instituicao = false;
    let atualizouStatus = false;
    let inseriuEndereco = false;

    try {
        const { data, error } = await supabase
            .from('instituicoes_cadastros')
            .update({ status })
            .eq('id_cadastro', id)
            .select()
            .single();

        if (error) throw error;

        atualizouStatus = true;

        if (status === 'R') {
            return res.status(200).json({ message: "Status atualizado com sucesso", data });
        }

        const { data: instituicaoData, error: instituicaoError } = await supabase.from('instituicoes').insert([{
            id_usuario: data.id_usuario,
            nome: data.nome,
            cnpj: data.cnpj,
            telefone: data.telefone,
            email: data.email,
            descricao: data.descricao,
            site: data.site,
            logo_url: data.logo_url,
            banner_url: data.banner_url,
            chave_pix: data.chave_pix,
            id_cadastro: data.id_cadastro,
        }]).select().single();

        if (instituicaoError) throw instituicaoError;

        id_instituicao = instituicaoData.id_instituicao;

        const { data: enderecoData, error: enderecoError } = await supabase.from('instituicoes_enderecos').insert([{
            id_instituicao: instituicaoData.id_instituicao,
            id_cidade: data.id_cidade,
            rua: data.endereco,
            numero: data.endereco_numero,
            complemento: data.endereco_complemento,
            bairro: data.bairro,
            cep: data.cep,
            latitude: data.latitude,
            longitude: data.longitude,
        }]);

        if (enderecoError) throw enderecoError;

        inseriuEndereco = true;

        const { error: categoriaError } = await supabase.from('instituicoes_categorias').insert([{
            id_instituicao: instituicaoData.id_instituicao,
            id_categoria: data.id_categoria
        }]);

        if (categoriaError) throw categoriaError;

        res.status(200).json({ message: "Status atualizado e instituição criada com sucesso", data: { ...instituicaoData, endereco: enderecoData } });
    } catch (error) {
        try {
            if (atualizouStatus) {
                const { error } = await supabase
                    .from('instituicoes_cadastros')
                    .update({ status: 'A' })
                    .eq('id_cadastro', id);

                if (error) throw error;
            }

            if (id_instituicao) {
                const { error } = await supabase
                    .from('instituicoes')
                    .delete()
                    .eq('id_instituicao', id_instituicao);

                if (error) throw error;
            }

            if (inseriuEndereco) {
                const { error } = await supabase
                    .from('instituicoes_enderecos')
                    .delete()
                    .eq('id_instituicao', id_instituicao);

                if (error) throw error;
            }
        } catch (rollbackError) {
            console.error("Erro ao reverter alterações após falha:", rollbackError);
        }

        console.error("Erro ao atualizar status do cadastro da instituição:", error);
        res.status(500).json({ error: "Erro ao atualizar status do cadastro da instituição" });
    }
};
