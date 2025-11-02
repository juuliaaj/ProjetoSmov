const Usuario = require('../models/Usuario.js');
const supabase = require('../utils/supabase.js');

exports.cadastro = async (req, res, next) => {
    const { nome, email, senha } = req.body;

    try {
        if (!nome || !email || !senha) throw new Error("Nome, email e senha são obrigatórios");

        const { data, error } = await supabase.auth.signUp({
            email,
            password: senha
        });

        if (error) throw error;

        const { data: insertData, error: insertError } = await supabase
            .from('usuarios')
            .insert([{
                id_interno: data.user.id,
                nome: nome,
            }])
            .select('id_usuario');

        if (insertError) {
            await supabase.auth.admin.deleteUser(usuario.id);

            throw insertError;
        }

        const usuario = new Usuario(insertData[0].id_usuario, nome, null);

        res.cookie('smovSessionID', data.user.id, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(201).json({ message: "OK", data: usuario });
    } catch (error) {
        console.error("Erro ao criar usuário:", error);
        res.status(500).json({ error: "Erro ao criar usuário" });
    }
}

exports.login = async (req, res, next) => {
    const { email, senha } = req.body;

    try {
        if (!email || !senha) throw new Error("Email e senha são obrigatórios");

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha
        });

        if (error) throw error;

        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select()
            .eq('id_interno', data.user.id);

        if (userError) throw userError;

        if (!userData.length) throw new Error("Usuário não encontrado");

        const usuario = new Usuario(userData[0].id_usuario, userData[0].nome, userData[0].foto_perfil);

        res.cookie('smovSessionID', data.user.id, {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            secure: process.env.NODE_ENV === "production",
        });
        res.status(200).json({ message: "OK", data: usuario });
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ error: "Erro ao fazer login" });
    }
}

exports.recuperarSenha = async (req, res) => {
    const { email } = req.body;

    try {
        if (!email) {
            return res.status(400).json({ error: "Email é obrigatório." });
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: process.env.FRONTEND_URL + "/resetar"
        });

        if (error) throw error;

        res.status(200).json({ message: "Email de recuperação de senha enviado com sucesso." });
    } catch (error) {
        console.error("Erro interno:", error);
        res.status(500).json({ error: "Erro ao solicitar recuperação de senha." });
    }
};

exports.getPerfil = async (req, res) => {
    const { id: idUsuario } = req.query;

    try {
        const { data, error } = await supabase
            .from('usuarios')
            .select('id_usuario, nome, email, telefone, bio, foto_perfil, admin, created_at')
            .eq('id_usuario', idUsuario ?? req.user.id_usuario)
            .single();

        if (error) return res.status(500).json({ error: 'Erro ao buscar perfil.' });
        if (!data) return res.status(404).json({ error: 'Usuário não encontrado.' });

        res.status(200).json({ data: data });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno.' });
    }
};

exports.updatePerfil = async (req, res) => {
    try {
        const { nome, bio, telefone, email, foto_perfil, foto_perfil_path } = req.body;

        if (!nome) return res.status(404).json({ error: 'Nome é obrigatório.' })

        const { error } = await supabase
            .from('usuarios')
            .update({ nome, bio, telefone, email, foto_perfil, foto_perfil_path })
            .eq('id_usuario', req.user.id_usuario);

        if (error) return res.status(500).json({ error: 'Erro ao atualizar perfil.' });

        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: 'Erro interno.' });
    }
};
