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

        res.cookie('smovSessionID', data.user.id, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
        res.status(201).json({ message: "OK", data: usuario});
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
        
        res.cookie('smovSessionID', data.user.id, { maxAge: 1000 * 60 * 60 * 24 * 7, httpOnly: true });
        res.status(200).json({ message: "OK", data: usuario});
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ error: "Erro ao fazer login" });
    }
}
