function irParaLogin() {
  window.location.href = "/login/login.html";
}

function irParaCadastro() {
  window.location.href = "/cadastro/cadastro.html";
}

function irParaCriarConta() {
  window.location.href = "/cadastro/cadastro.html";
}

function sairDaConta() {
  localStorage.removeItem("loginSalvo");
  window.location.href = "/login/login.html";
}

const btnVoltar = document.getElementById("btn-voltar2");
const inputLogin = document.getElementById("input-login");
const inputSenha = document.getElementById("input-senha");
const lembrarLogin = document.getElementById("lembrar-login");
const iconeOlho = document.getElementById("icone-olho");
const verSenhaTexto = document.getElementById("ver-senha-texto");
const inputTelefone = document.getElementById("input-telefone");
const inputNascimento = document.getElementById("input-nascimento");
const formularioCadastro = document.getElementById("cadastro-form");
const botaoLogin = document.getElementById("botao-login");
const inputNome = document.getElementById("input-nome");
const inputEmail = document.getElementById("input-email");
const hostnameAtual = window.location.hostname || "localhost";
const apiBaseUrl = window.location.port === "3000"
  ? window.location.origin
  : `${window.location.protocol}//${hostnameAtual}:3000`;
const loginSalvo = localStorage.getItem("loginSalvo");
const estaNaPaginaDeLogin = window.location.pathname.includes("/login/");

localStorage.removeItem("senhaSalva");

if (btnVoltar) {
  btnVoltar.addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "/";
  });
}

if (inputLogin && loginSalvo) {
  inputLogin.value = loginSalvo;
}

if (lembrarLogin && loginSalvo) {
  lembrarLogin.checked = true;
}

if (estaNaPaginaDeLogin && inputLogin && inputSenha && !loginSalvo) {
  inputLogin.value = "";
  inputSenha.value = "";
}

function alternarSenha() {
  if (!inputSenha || !iconeOlho || !verSenhaTexto) {
    return;
  }

  if (inputSenha.type === "password") {
    inputSenha.type = "text";
    iconeOlho.innerHTML = '<i class="fa-regular fa-eye"></i>';
    verSenhaTexto.textContent = "Ocultar senha";
  } else {
    inputSenha.type = "password";
    iconeOlho.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    verSenhaTexto.textContent = "Ver senha";
  }
}

if (iconeOlho) {
  iconeOlho.addEventListener("click", alternarSenha);
}

if (verSenhaTexto) {
  verSenhaTexto.addEventListener("click", alternarSenha);
}

function formatarTelefone(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);

  if (numeros.length === 0) {
    return "";
  }

  if (numeros.length <= 2) {
    return `(${numeros}`;
  }

  if (numeros.length <= 7) {
    return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
  }

  return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
}

if (inputTelefone) {
  inputTelefone.addEventListener("input", function (event) {
    event.target.value = formatarTelefone(event.target.value);
  });
}

if (inputLogin) {
  inputLogin.addEventListener("input", function (event) {
    const valor = event.target.value;
    const temCaraDeEmail = /[a-zA-Z@]/.test(valor);

    if (!temCaraDeEmail) {
      const apenasNumeros = valor.replace(/\D/g, "").slice(0, 11);
      event.target.value = formatarTelefone(apenasNumeros);
    }
  });
}

function formatarNascimento(valor) {
  const numeros = valor.replace(/\D/g, "").slice(0, 8);

  if (numeros.length <= 2) {
    return numeros;
  }

  if (numeros.length <= 4) {
    return `${numeros.slice(0, 2)}/${numeros.slice(2)}`;
  }

  return `${numeros.slice(0, 2)}/${numeros.slice(2, 4)}/${numeros.slice(4)}`;
}

if (inputNascimento) {
  inputNascimento.addEventListener("input", function (event) {
    event.target.value = formatarNascimento(event.target.value);
  });
}

if (formularioCadastro) {
  formularioCadastro.addEventListener("submit", async function (event) {
    event.preventDefault();

    const nome = document.getElementById("input-nome").value.trim();
    const email = document.getElementById("input-email").value.trim();
    const telefone = document.getElementById("input-telefone").value.trim();
    const nascimento = document.getElementById("input-nascimento").value.trim();
    const senha = document.getElementById("input-senha").value;

    try {
      const resposta = await fetch(`${apiBaseUrl}/cadastro`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ nome, email, telefone, nascimento, senha })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        alert(dados.mensagem);
        formularioCadastro.reset();
        window.location.href = "/login/login.html";
      } else {
        alert(dados.erro || "Nao foi possivel concluir o cadastro.");
      }
    } catch (erro) {
      console.error("Erro ao enviar cadastro:", erro);
      alert("Erro ao conectar com o servidor.");
    }
  });
}

if (botaoLogin && inputLogin && inputSenha) {
  botaoLogin.addEventListener("click", async function () {
    const login = inputLogin.value.trim();
    const senha = inputSenha.value;

    if (!login || !senha) {
      alert("Preencha login e senha.");
      return;
    }

    try {
      const resposta = await fetch(`${apiBaseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ login, senha })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        alert(dados.erro || "Nao foi possivel fazer login.");
        return;
      }

      if (lembrarLogin && lembrarLogin.checked) {
        localStorage.setItem("loginSalvo", login);
      } else {
        localStorage.removeItem("loginSalvo");
      }

      alert(dados.mensagem);
      window.location.href = "/page/page.html";
    } catch (erro) {
      console.error("Erro ao fazer login:", erro);
      alert("Erro ao conectar com o servidor.");
    }
  });
}

if (inputNome) {
  inputNome.addEventListener("invalid", function () {
    if (!inputNome.value) {
      inputNome.setCustomValidity("Preencha este campo.");
    }
  });

  inputNome.addEventListener("input", function () {
    inputNome.setCustomValidity("");
  });
}

document.querySelectorAll("input[required]").forEach(function (campo) {
  campo.addEventListener("invalid", function () {
    if (campo.validity.valueMissing) {
      campo.setCustomValidity("Preencha este campo.");
    } else if (campo.id === "input-telefone") {
      campo.setCustomValidity("Digite um numero de telefone valido.");
    } else {
      campo.setCustomValidity("");
    }
  });

  campo.addEventListener("input", function () {
    campo.setCustomValidity("");
  });
});

if (inputEmail) {
  inputEmail.addEventListener("invalid", function () {
    if (!inputEmail.value.trim()) {
      inputEmail.setCustomValidity("Preencha este campo.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail.value)) {
      inputEmail.setCustomValidity("Digite um email valido.");
    }
  });

  inputEmail.addEventListener("input", function () {
    inputEmail.setCustomValidity("");
  });
}

document.querySelectorAll("[data-em-breve]").forEach(function (elemento) {
  elemento.addEventListener("click", function (event) {
    event.preventDefault();
    alert("Esse recurso ainda esta em desenvolvimento.");
  });
});
