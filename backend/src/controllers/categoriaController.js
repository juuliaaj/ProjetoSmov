const supabase = require('../utils/supabase.js');

exports.get = async (req, res, next) => {
    const { id, nome } = req.query;

    try {
        const query = supabase.from('categorias').select();

        if (id) {
            query.eq('id_categoria', parseInt(id));
        }

        if (nome) {
            query.ilike('nome', `%${nome}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        res.status(200).json({ message: "OK", data });
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        res.status(500).json({ error: "Erro ao buscar categorias" });
    }
}
