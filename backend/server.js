require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

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
    allowedHeaders: ["Content-Type", "Accept"],
    credentials: true
}))

app.use(async (req, res, next) => {
    const isSessionRoute = req.path === '/auth/me';

    if (req.method === 'OPTIONS' || (req.path.startsWith('/auth') && !isSessionRoute)) {
        return next();
    }

    const token = req.cookies.smovSessionID;
    
    if (!isSessionRoute && !token) {
        return res.status(401).json({ error: "Unauthorized" });
    } else if (!token) {
        return res.status(200).json({ data: null });
    }

    req.token = token;

    const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select()
            .eq('id_interno', token)
            .single();

    if (!isSessionRoute && (userError || !userData)) {
        return res.status(401).json({ error: "Unauthorized" });
    } else if (userError || !userData) {
        return res.status(200).json({ data: null });
    }

    if (isSessionRoute) {
        return res.status(200).json(
            {
                data: {
                    id_usuario: userData.id_usuario,
                    nome: userData.nome,
                    foto_perfil: userData.foto_perfil,
                    admin: userData.admin || false,
                }
            }
        );
    }

    req.user = userData;

    next();
});

app.use("/auth", userRoutes);
app.use("/cidades", cidadeRoutes);
app.use("/categorias", categoriaRoutes);
app.use("/instituicoes", instituicaoRoutes);
app.use("/reservas", reservaRoutes);

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
