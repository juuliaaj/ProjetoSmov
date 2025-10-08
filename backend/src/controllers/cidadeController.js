const supabase = require('../utils/supabase.js');

exports.get = async (req, res, next) => {
    const { id, nome } = req.query;

    try {
        const { data, error } = await supabase.from('cidades').select();

        if (id) {
            data = data.filter(cidade => cidade.id_cidade === parseInt(id));
        }

        if (nome) {
            data = data.filter(cidade => cidade.nome.toLowerCase().includes(nome.toLowerCase()));
        }

        if (error) throw error;

        res.status(200).json({ message: "OK", data });
    } catch (error) {
        console.error("Erro ao buscar cidades:", error);
        res.status(500).json({ error: "Erro ao buscar cidades" });
    }
}
