const supabase = require('../utils/supabase.js');

exports.get = async (req, res, next) => {
    const { id, search, id_cidade, id_categoria } = req.query;

    try {
        const query = supabase.from('instituicoes').select(`
            *,
            categorias!inner (
                nome
            ),
            instituicoes_enderecos!inner (
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
            )
        `);

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
            query.eq('categorias.id_categoria', parseInt(id_categoria));
        }

        const { data, error } = await query;

        if (error) throw error;

        res.status(200).json({ message: "OK", data });
    } catch (error) {
        console.error("Erro ao buscar instituições:", error);
        res.status(500).json({ error: "Erro ao buscar instituições" });
    }
}
