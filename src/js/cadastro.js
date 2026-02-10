// ==============================
// MOSTRAR E OCULTAR SENHA
// ==============================
function toggleSenha(id, icon) {
  const input = document.getElementById(id);
  if (!input) return;

  if (input.type === "password") {
    input.type = "text";
    icon.src = "./icons/olhoaberto.png";
  } else {
    input.type = "password";
    icon.src = "./icons/olhofechado.png";
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

const inputTelefone = document.querySelector('input[name="telefone"]');

function aplicarMascaraTelefone(valor) {
  // só dígitos
  let v = valor.replace(/\D/g, "");

  // limita (DDD + 9 dígitos = 11)
  if (v.length > 11) v = v.slice(0, 11);

  // aplica máscara
  if (v.length <= 10) {
    // (99) 9999-9999
    v = v.replace(/^(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    // (99) 99999-9999
    v = v.replace(/^(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{5})(\d)/, "$1-$2");
  }

  return v;
}

if (inputTelefone) {
  inputTelefone.addEventListener("input", () => {
    inputTelefone.value = aplicarMascaraTelefone(inputTelefone.value);
  });

  // bloqueia teclas que não fazem sentido (mas ainda deixa backspace, setas, etc.)
  inputTelefone.addEventListener("keydown", (e) => {
    const permitidos = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Home", "End",
    ];
    if (permitidos.includes(e.key)) return;

    // deixa CTRL+A/C/V/X
    if (e.ctrlKey || e.metaKey) return;

    // bloqueia qualquer coisa que não seja número
    if (!/^\d$/.test(e.key)) e.preventDefault();
  });
}

// ==============================
// BUSCAR CEP AUTOMATICAMENTE
// ==============================
const cepInput = document.getElementById("cep");
const enderecoInput = document.getElementById("endereco");
const bairroInput = document.getElementById("bairro");

if (cepInput) {
  cepInput.addEventListener("input", async () => {
    let valor = cepInput.value.replace(/\D/g, "");

    // limita a 8 números
    if (valor.length > 8) valor = valor.slice(0, 8);

    // aplica máscara 00000-000
    if (valor.length > 5) {
      valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
    }

    cepInput.value = valor;

    // buscar endereço automaticamente ao completar 8 dígitos
    if (valor.replace(/\D/g, "").length === 8) {
      try {
        const cepLimpo = valor.replace(/\D/g, "");
        const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await res.json();

        if (data.erro) {
          Swal.fire({
            icon: "error",
            title: "CEP inválido",
            text: "Não foi possível encontrar esse CEP",
            confirmButtonColor: "#347142"
          });
          return;
        }

        enderecoInput.value = data.logradouro || "";
        bairroInput.value = data.bairro || "";

      } catch (err) {
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
const form = document.querySelector("form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dados = {
      nome: e.target.nome.value,
      email: e.target.email.value,
      telefone: e.target.telefone.value,
      data_nascimento: e.target.data_nascimento.value,
      senha: e.target.senha.value,
      cep: e.target.cep.value,
      endereco: e.target.endereco.value,
      bairro: e.target.bairro.value,
      numero: e.target.numero.value,
      complemento: e.target.complemento.value
    };

    // validação de senha
    if (!dados.senha || dados.senha.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "Senha inválida",
        text: "A senha deve ter no mínimo 6 caracteres.",
        confirmButtonColor: "#347142"
      });
      return;
    }

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
      }).then(() => {
        window.location.href = "/login";
      });

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: "Erro ao conectar com o servidor",
        confirmButtonColor: "#347142"
      });
    }
  });
}
