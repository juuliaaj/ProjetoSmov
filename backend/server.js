require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

const userRoutes = require("./src/routes/usuarioRoutes.js");
const cidadeRoutes = require("./src/routes/cidadeRoutes.js");
const instituicaoRoutes = require("./src/routes/instituicaoRoutes.js");

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true
}))

app.use("/auth", userRoutes);
app.use("/cidades", cidadeRoutes);
app.use("/instituicoes", instituicaoRoutes);

app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
