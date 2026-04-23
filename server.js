const bcrypt = require("bcrypt");
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

console.log("Iniciando server.js...");

dotenv.config({ override: true });
console.log("DB_USER lido:", process.env.DB_USER);

const app = express();
const port = process.env.PORT || 3000;
let dbDisponivel = false;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});

db.connect((erro) => {
  if (erro) {
    console.error("Erro ao conectar no MySQL:", erro);
    dbDisponivel = false;
    return;
  }

  dbDisponivel = true;
  console.log("Conectado ao MySQL com sucesso!");
});

db.on("error", (erro) => {
  dbDisponivel = false;
  console.error("Erro na conexao com MySQL:", erro);
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "comeco", "index.html"));
});

app.post("/cadastro", async (req, res) => {
  if (!dbDisponivel) {
    return res.status(503).json({ erro: "Banco de dados indisponivel no momento." });
  }

  const { nome, email, telefone, nascimento, senha } = req.body;

  if (!nome || !email || !telefone || !nascimento || !senha) {
    return res.status(400).json({ erro: "Preencha todos os campos." });
  }

  try {
    const senhaHash = await bcrypt.hash(senha, 10);
    const nascimentoFormatado = nascimento.split("/").reverse().join("-");
    const sql = `
      INSERT INTO usuarios (nome, email, telefone, nascimento, senha_hash)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [nome, email, telefone, nascimentoFormatado, senhaHash], (erro) => {
      if (erro) {
        console.error("Erro ao cadastrar usuario:", erro);

        if (erro.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ erro: "Email ou telefone ja cadastrado." });
        }

        return res.status(500).json({ erro: "Erro ao cadastrar usuario." });
      }

      return res.status(201).json({ mensagem: "Usuario cadastrado com sucesso!" });
    });
  } catch (erro) {
    console.error("Erro ao criptografar senha:", erro);
    return res.status(500).json({ erro: "Erro interno do servidor." });
  }
});

app.post("/login", (req, res) => {
  if (!dbDisponivel) {
    return res.status(503).json({ erro: "Banco de dados indisponivel no momento." });
  }

  const { login, senha } = req.body;

  if (!login || !senha) {
    return res.status(400).json({ erro: "Preencha login e senha." });
  }

  const sql = `
    SELECT * FROM usuarios
    WHERE email = ? OR telefone = ?
    LIMIT 1
  `;

  db.query(sql, [login, login], async (erro, resultados) => {
    if (erro) {
      console.error("Erro ao buscar usuario:", erro);
      return res.status(500).json({ erro: "Erro no servidor." });
    }

    if (resultados.length === 0) {
      return res.status(401).json({ erro: "Usuario nao encontrado." });
    }

    const usuario = resultados[0];

    try {
      const senhaCorreta = await bcrypt.compare(senha, usuario.senha_hash);

      if (!senhaCorreta) {
        return res.status(401).json({ erro: "Senha incorreta." });
      }

      return res.status(200).json({ mensagem: "Login realizado com sucesso!" });
    } catch (erro) {
      console.error("Erro ao validar senha:", erro);
      return res.status(500).json({ erro: "Erro interno do servidor." });
    }
  });
});

console.log("Tentando subir servidor...");

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
