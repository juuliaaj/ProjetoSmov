
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Importações das dependências e rotas
const supabase = require('./src/utils/supabase.js');
const userRoutes = require("./src/routes/usuarioRoutes.js");
const cidadeRoutes = require("./src/routes/cidadeRoutes.js");
const categoriaRoutes = require("./src/routes/categoriaRoutes.js");
const instituicaoRoutes = require("./src/routes/instituicaoRoutes.js");
const reservaRoutes = require("./src/routes/reservaRoutes.js");



app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true
}));



app.use("/auth", userRoutes);



app.use(async (req, res, next) => {
    try {
        const token = req.cookies?.smovSessionID;

        if (!token) {
            return res.status(401).json({ error: "Usuário não autenticado." });
        }

        const { data: userData, error: userError } = await supabase
            .from("usuarios")
            .select()
            .eq("id_interno", token);

        if (userError || !userData.length) {
            return res.status(401).json({ error: "Sessão inválida ou expirada." });
        }

        req.user = userData[0];
        next();
    } catch (error) {
        console.error("Erro no middleware de autenticação:", error);
        res.status(500).json({ error: "Erro interno de autenticação." });
    }
});


app.use("/cidades", cidadeRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/instituicoes", instituicaoRoutes);
app.use("/reservas", reservaRoutes);



app.listen(PORT, () => console.log(`✅ Server running on port: ${PORT}`));
