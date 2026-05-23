const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// --- FUNÇÃO DE CADASTRO ---
const signup = async (req, res) => {
  console.log("\n📝 [CADASTRO] Tentando criar usuário:", req.body.email);
  try {
    const nome = req.body.nome ? req.body.nome.trim() : "";
    const email = req.body.email ? req.body.email.trim().toLowerCase() : "";
    const senha = req.body.senha ? String(req.body.senha).trim() : "";

    const checarUser = await pool.query({
        text: 'SELECT * FROM usuarios WHERE email = $1',
        values: [email],
        query_timeout: 5000
    });

    let userExiste = Array.isArray(checarUser.rows) ? checarUser.rows.flat(Infinity) : checarUser.rows;

    if (userExiste && typeof userExiste === 'object' && userExiste.email) {
      return res.status(400).json({ erro: 'Este e-mail já está em uso.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUser = await pool.query({
      text: 'INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email',
      values: [nome, email, senhaHash],
      query_timeout: 5000
    });

    let usuarioCriado = Array.isArray(novoUser.rows) ? novoUser.rows.flat(Infinity) : novoUser.rows;
    
    console.log("✅ Usuário criado com sucesso:", email);
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario: usuarioCriado });
  } catch (error) {
    console.error("💥 Erro no cadastro:", error);
    res.status(500).json({ erro: 'Erro interno ao cadastrar.' });
  }
};


// --- FUNÇÃO DE LOGIN (OPERAÇÃO ARRASTÃO) ---
const login = async (req, res) => {
  console.log("\n🚀 [LOGIN] Tentando acessar com:", req.body.email);
  try {
    const emailLimpo = req.body.email ? req.body.email.trim().toLowerCase() : "";
    const senhaLimpa = req.body.senha ? String(req.body.senha).trim() : "";

    // LIGA A LUZ: Puxa TODO MUNDO do banco (ignorando o filtro WHERE)
    const resultado = await pool.query('SELECT * FROM usuarios');
    
    let listaBruta = resultado.rows;

    // Transforma em array puro e esmaga qualquer pacote maluco do NeonDB
    let listaLimpa = [];
    if (Array.isArray(listaBruta)) {
        listaLimpa = listaBruta.flat(Infinity);
    } else if (listaBruta && typeof listaBruta === 'object') {
        listaLimpa = Object.values(listaBruta).flat(Infinity);
    } else {
        listaLimpa = [listaBruta];
    }

    // ARRASTÃO: Busca o usuário no braço usando JavaScript
    let usuario = null;
    for (let u of listaLimpa) {
        if (u && u.email && u.email.trim().toLowerCase() === emailLimpo) {
            usuario = u;
            break;
        }
    }

    if (!usuario) {
      console.log("❌ ERRO: O banco está completamente vazio ou não salvou direito.");
      console.log("🕵️ O que realmente tem no banco agora:", JSON.stringify(listaLimpa));
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    console.log("✅ Usuário encontrado na marra:", usuario.email);

    // Compara a senha
    const senhaValida = await bcrypt.compare(senhaLimpa, String(usuario.senha));

    if (!senhaValida) {
      console.log("❌ ERRO: Senha incorreta.");
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    console.log("✅ SUCESSO TOTAL! Gerando Token...");
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({ mensagem: 'Login efetuado com sucesso!', token });
  } catch (error) {
    console.error("💥 Erro no login:", error.message);
    res.status(500).json({ erro: 'Erro interno.' });
  }
};

module.exports = { signup, login };