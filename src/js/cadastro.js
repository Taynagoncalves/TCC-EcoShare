
// MOSTRAR / OCULTAR SENHA

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


// BLOQUEAR NÚMEROS NO NOME

const inputNome = document.querySelector('input[name="nome"]');
if (inputNome) {
  inputNome.addEventListener("input", () => {
    inputNome.value = inputNome.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
  });
}


// TELEFONE MÁSCARA

const inputTelefone = document.querySelector('input[name="telefone"]');

function aplicarMascaraTelefone(valor) {
  let v = valor.replace(/\D/g, "").slice(0, 11);

  if (v.length <= 10)
    return v.replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{4})(\d)/, "$1-$2");
  else
    return v.replace(/^(\d{2})(\d)/, "($1) $2")
            .replace(/(\d{5})(\d)/, "$1-$2");
}

if (inputTelefone) {
  inputTelefone.addEventListener("input", () => {
    inputTelefone.value = aplicarMascaraTelefone(inputTelefone.value);
  });
}


// SENHA VALIDAÇÃO
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");

function criarAviso(input){
  let aviso = document.createElement("div");
  aviso.className = "aviso-senha";
  input.parentElement.insertAdjacentElement("afterend", aviso);
  return aviso;
}

const avisoSenha = criarAviso(senhaInput);
const avisoConfirmar = criarAviso(confirmarSenhaInput);

function validarSenha(){
  const senha = senhaInput.value;

  if(senha.length === 0){
    avisoSenha.style.display = "none";
    senhaInput.classList.remove("input-erro","input-ok");
    return;
  }

  if(senha.length < 6){
    avisoSenha.className = "aviso-senha aviso-erro";
    avisoSenha.innerHTML = "⚠ A senha deve ter no mínimo 6 caracteres";
    avisoSenha.style.display = "flex";
    senhaInput.classList.add("input-erro");
    senhaInput.classList.remove("input-ok");
    return;
  }

  avisoSenha.className = "aviso-senha aviso-ok";
  avisoSenha.innerHTML = "✔ Senha válida";
  avisoSenha.style.display = "flex";
  senhaInput.classList.add("input-ok");
  senhaInput.classList.remove("input-erro");
}

function validarConfirmacao(){
  const senha = senhaInput.value;
  const confirmar = confirmarSenhaInput.value;

  if(confirmar.length === 0){
    avisoConfirmar.style.display = "none";
    confirmarSenhaInput.classList.remove("input-erro","input-ok");
    return;
  }

  if(confirmar !== senha){
    avisoConfirmar.className = "aviso-senha aviso-erro";
    avisoConfirmar.innerHTML = "⚠ As senhas não coincidem";
    avisoConfirmar.style.display = "flex";
    confirmarSenhaInput.classList.add("input-erro");
    confirmarSenhaInput.classList.remove("input-ok");
    return;
  }

  avisoConfirmar.className = "aviso-senha aviso-ok";
  avisoConfirmar.innerHTML = "✔ Senhas coincidem";
  avisoConfirmar.style.display = "flex";
  confirmarSenhaInput.classList.add("input-ok");
  confirmarSenhaInput.classList.remove("input-erro");
}

senhaInput.addEventListener("input", ()=>{ validarSenha(); validarConfirmacao(); });
confirmarSenhaInput.addEventListener("input", validarConfirmacao);



// DATA NASCIMENTO — MÁSCARA + VALIDAÇÃO VISUAL
const inputData = document.getElementById("data_nascimento");
let avisoData = null;

if(inputData){

  avisoData = document.createElement("div");
  avisoData.className = "aviso-data";
  avisoData.style.display = "none";

  // cria um wrapper somente do campo data
  const wrapper = document.createElement("div");
  wrapper.className = "wrapper-data";

  // envolve o input
  inputData.parentNode.insertBefore(wrapper, inputData);
  wrapper.appendChild(inputData);

  // coloca aviso logo abaixo
  wrapper.appendChild(avisoData);
}



function mascaraData(valor){
  let v = valor.replace(/\D/g,"").slice(0,8);
  if(v.length >= 5) return v.replace(/(\d{2})(\d{2})(\d{1,4})/,"$1/$2/$3");
  else if(v.length >= 3) return v.replace(/(\d{2})(\d{1,2})/,"$1/$2");
  return v;
}

function dataValida(dataStr){
  if(!/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) return false;
  const [dia,mes,ano] = dataStr.split("/").map(Number);
  if(ano < 1900) return false;

  const data = new Date(ano, mes-1, dia);
  if(data.getFullYear() !== ano || data.getMonth() !== mes-1 || data.getDate() !== dia) return false;

  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  if(data > hoje) return false;

  return true;
}

function validarDataVisual(){
  if(!inputData) return;
  const valor = inputData.value.trim();

  if(valor.length === 0){
    avisoData.style.display = "none";
    inputData.classList.remove("input-erro","input-ok");
    return;
  }

  if(!dataValida(valor)){
    avisoData.className = "aviso-data aviso-erro";
    avisoData.innerHTML = "⚠ Data inválida";
    avisoData.style.display = "flex";
    inputData.classList.add("input-erro");
    inputData.classList.remove("input-ok");
    return;
  }

  avisoData.className = "aviso-data aviso-ok";
  avisoData.innerHTML = "✔ Data válida";
  avisoData.style.display = "flex";
  inputData.classList.add("input-ok");
  inputData.classList.remove("input-erro");
}

if(inputData){
  inputData.addEventListener("input",(e)=>{
    e.target.value = mascaraData(e.target.value);
    validarDataVisual();
  });
  inputData.addEventListener("blur", validarDataVisual);
}


// CEP — MÁSCARA + BUSCA VIA CEP
const cepInput = document.getElementById("cep");
const enderecoInput = document.getElementById("endereco");
const bairroInput = document.getElementById("bairro");
const cidadeInput = document.getElementById("cidade");
const estadoInput = document.getElementById("estado");
const numeroInput = document.getElementById("numero");

function formatarCEP(v){
  v = v.replace(/\D/g,"").slice(0,8);
  if(v.length > 5) v = v.replace(/^(\d{5})(\d+)/,"$1-$2");
  return v;
}

async function consultarCEP(cep){
  try{
    enderecoInput.value = "Buscando...";
    bairroInput.value = "";
    cidadeInput.value = "";
    estadoInput.value = "";

    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const d = await r.json();

    if(d.erro){
      Swal.fire({
        icon:"warning",
        title:"CEP não encontrado",
        text:"Preencha manualmente"
      });
      enderecoInput.value="";
      return;
    }

    enderecoInput.value = d.logradouro || "";
    bairroInput.value   = d.bairro || "";
    cidadeInput.value   = d.localidade || "";
    estadoInput.value   = d.uf || "";

    numeroInput.focus();

  }catch{
    enderecoInput.value="";
    Swal.fire({
      icon:"error",
      title:"Erro ao consultar CEP"
    });
  }
}

if(cepInput){
  cepInput.addEventListener("input", e=>{
    e.target.value = formatarCEP(e.target.value);
  });

 let ultimoCepBuscado = "";

cepInput.addEventListener("input", e=>{
  const cepFormatado = formatarCEP(e.target.value);
  e.target.value = cepFormatado;

  const cepLimpo = cepFormatado.replace(/\D/g,"");

  // quando completar 8 dígitos busca automaticamente
  if(cepLimpo.length === 8 && cepLimpo !== ultimoCepBuscado){
    ultimoCepBuscado = cepLimpo;
    consultarCEP(cepLimpo);
  }
});
}

// ENVIO DO FORMULÁRIO
const form = document.getElementById("formCadastro");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dataTexto = e.target.data_nascimento.value.trim();

    if(!dataValida(dataTexto)){
      validarDataVisual();
      inputData.focus();
      return;
    }

    const tel = e.target.telefone.value.replace(/\D/g,'');
       const dados = {
       nome:e.target.nome.value.trim(),
       email:e.target.email.value.trim(),
       telefone:tel,
       data_nascimento:dataTexto,
       senha:e.target.senha.value,

       cep:e.target.cep.value.replace(/\D/g,''),

       endereco:e.target.endereco.value.trim(),
       bairro:e.target.bairro.value.trim(),
       cidade:e.target.cidade.value.trim(),
       estado:e.target.estado.value.trim(),

       numero:e.target.numero.value.trim(),
       complemento:(e.target.complemento.value||"").trim()
};

    const res = await fetch("/cadastro",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify(dados)
    });

    const json = await res.json().catch(()=>({}));

    if(!res.ok){
      Swal.fire({
        icon:"error",
        title:"Não foi possível criar sua conta",
        text:json.error || "Tente novamente mais tarde.",
        confirmButtonColor:"#c62828"
      });
      return;
    }

    Swal.fire({
      icon:"success",
      title:"Conta criada com sucesso!",
      confirmButtonColor:"#347142"
    }).then(()=> window.location.href="/login");
  });
}
