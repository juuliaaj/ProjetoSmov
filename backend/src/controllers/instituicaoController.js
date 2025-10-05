const supabase = require('../utils/supabase.js');

exports.get = async (req, res, next) => {
    const { id, nome } = req.query;

    try {
        const { data, error } = await supabase.from('instituicoes').select();

        if (id) {
            data = data.filter(instituicao => instituicao.id_instituicao === parseInt(id));
        }

        if (nome) {
            data = data.filter(instituicao => instituicao.nome.toLowerCase().includes(nome.toLowerCase()));
        }

        if (error) throw error;

        res.status(200).json({ message: "OK", data });
    } catch (error) {
        console.error("Erro ao buscar instituições:", error);
        res.status(500).json({ error: "Erro ao buscar instituições" });
    }
}
