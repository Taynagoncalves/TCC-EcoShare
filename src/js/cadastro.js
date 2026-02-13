// ==============================
// MOSTRAR E OCULTAR SENHA
// ==============================
function toggleSenha(id, icon) {
  const input = document.getElementById(id);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    icon.src = "../icons/olhoaberto.png";
  } else {
    input.type = "password";
    icon.src = "../icons/olhofechado.png";
  }
}

// ==============================
// BLOQUEAR NÚMEROS NO NOME
// ==============================
const inputNome = document.querySelector('input[name="nome"]');
if (inputNome) {
  inputNome.addEventListener("input", () => {
    inputNome.value = inputNome.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
  });
}

// ==============================
// MÁSCARA + BLOQUEAR LETRAS NO TELEFONE
// ==============================
const inputTelefone = document.querySelector('input[name="telefone"]');

function aplicarMascaraTelefone(valor) {
  let v = valor.replace(/\D/g, "");
  if (v.length > 11) v = v.slice(0, 11);

  if (v.length <= 10) {
    v = v.replace(/^(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    v = v.replace(/^(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
  }
  return v;
}

if (inputTelefone) {
  inputTelefone.addEventListener("input", () => {
    inputTelefone.value = aplicarMascaraTelefone(inputTelefone.value);
  });

  inputTelefone.addEventListener("keydown", (e) => {
    const permitidos = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End"];
    if (permitidos.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  });
}

// ==============================
// BUSCAR CEP AUTOMATICAMENTE + RESTRINGIR CASCAVEL-PR
// ==============================
const cepInput = document.getElementById("cep");
const enderecoInput = document.getElementById("endereco");
const bairroInput = document.getElementById("bairro");

let cepEhDeCascavel = false;

async function validarCepCascavel(cepLimpo) {
  const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
  const data = await res.json();

  if (data.erro) return { ok: false, msg: "CEP inválido" };
  if (data.localidade !== "Cascavel" || data.uf !== "PR") {
    return { ok: false, msg: "Permitido apenas para moradores de Cascavel - PR." };
  }
  return { ok: true, data };
}

if (cepInput) {
  cepInput.addEventListener("input", async () => {
    let valor = cepInput.value.replace(/\D/g, "");
    if (valor.length > 8) valor = valor.slice(0, 8);

    if (valor.length > 5) valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    cepInput.value = valor;

    cepEhDeCascavel = false;

    if (valor.replace(/\D/g, "").length === 8) {
      try {
        const cepLimpo = valor.replace(/\D/g, "");
        const result = await validarCepCascavel(cepLimpo);

        if (!result.ok) {
          enderecoInput.value = "";
          bairroInput.value = "";
          cepInput.value = "";
          Swal.fire({
            icon: "warning",
            title: "Cadastro restrito",
            text: result.msg,
            confirmButtonColor: "#347142"
          });
          return;
        }

        enderecoInput.value = result.data.logradouro || "";
        bairroInput.value = result.data.bairro || "";
        cepEhDeCascavel = true;

      } catch {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Erro ao buscar o CEP",
          confirmButtonColor: "#347142"
        });
      }
    }
  });
}

// ==============================
// ENVIO DO FORMULÁRIO
// ==============================
const form = document.getElementById("formCadastro");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const senha = e.target.senha.value;
    const confirmarSenha = document.getElementById("confirmarSenha")?.value || "";

    if (!senha || senha.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Senha inválida",
        text: "A senha deve ter no mínimo 6 caracteres.",
        confirmButtonColor: "#347142"
      });
      return;
    }

    if (senha !== confirmarSenha) {
      Swal.fire({
        icon: "warning",
        title: "Senhas diferentes",
        text: "A senha e a confirmação precisam ser iguais.",
        confirmButtonColor: "#347142"
      });
      return;
    }

    // ✅ se não validou ainda, valida aqui (evita travar cadastro por clique rápido)
    const cepLimpo = String(e.target.cep.value || "").replace(/\D/g, "");
    if (!cepLimpo || cepLimpo.length !== 8) {
      Swal.fire({
        icon: "warning",
        title: "CEP inválido",
        text: "Digite um CEP válido de Cascavel - PR.",
        confirmButtonColor: "#347142"
      });
      return;
    }

    if (!cepEhDeCascavel) {
      try {
        const result = await validarCepCascavel(cepLimpo);
        if (!result.ok) {
          Swal.fire({
            icon: "warning",
            title: "Cadastro restrito",
            text: result.msg,
            confirmButtonColor: "#347142"
          });
          return;
        }
        // completa campos se necessário
        enderecoInput.value = enderecoInput.value || (result.data.logradouro || "");
        bairroInput.value = bairroInput.value || (result.data.bairro || "");
        cepEhDeCascavel = true;
      } catch {
        Swal.fire({
          icon: "error",
          title: "Erro",
          text: "Erro ao validar o CEP",
          confirmButtonColor: "#347142"
        });
        return;
      }
    }

    const dados = {
      nome: e.target.nome.value.trim(),
      email: e.target.email.value.trim(),
      telefone: e.target.telefone.value.replace(/\D/g, ""),
      data_nascimento: e.target.data_nascimento.value,
      senha,
      cep: cepLimpo,
      endereco: e.target.endereco.value.trim(),
      bairro: e.target.bairro.value.trim(),
      numero: e.target.numero.value.trim(),
      complemento: (e.target.complemento.value || "").trim()
    };

    try {
      const res = await fetch("/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
      });

      const json = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Erro no cadastro",
          text: json.error || "Não foi possível criar a conta",
          confirmButtonColor: "#d33"
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Cadastro realizado!",
        text: "Sua conta foi criada com sucesso.",
        confirmButtonText: "Ir para login",
        confirmButtonColor: "#347142"
      }).then(() => window.location.href = "/login");

    } catch {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao conectar com o servidor",
        confirmButtonColor: "#347142"
      });
    }
  });
}

const senhaInput = document.getElementById("senha");
const senhaAviso = document.getElementById("senhaAviso");

if (senhaInput) {
  senhaInput.addEventListener("input", () => {
    const valor = senhaInput.value;

    if (valor.length > 0 && valor.length < 6) {
      senhaAviso.style.display = "block";
      senhaAviso.classList.add("erro");
      senhaInput.classList.add("input-erro");
    } else {
      senhaAviso.style.display = "none";
      senhaAviso.classList.remove("erro");
      senhaInput.classList.remove("input-erro");
    }
  });
}

const confirmarSenhaInput = document.getElementById("confirmarSenha");
const confirmarSenhaAviso = document.getElementById("confirmarSenhaAviso");

function validarConfirmacaoSenha() {
  const senha = senhaInput.value;
  const confirmar = confirmarSenhaInput.value;

  if (confirmar.length > 0 && confirmar !== senha) {
    confirmarSenhaAviso.style.display = "block";
    confirmarSenhaAviso.classList.add("erro");
    confirmarSenhaInput.classList.add("input-erro");
  } else {
    confirmarSenhaAviso.style.display = "none";
    confirmarSenhaAviso.classList.remove("erro");
    confirmarSenhaInput.classList.remove("input-erro");
  }
}

if (confirmarSenhaInput) {
  confirmarSenhaInput.addEventListener("input", validarConfirmacaoSenha);
  senhaInput.addEventListener("input", validarConfirmacaoSenha);
}