// ===============================
// MOSTRAR / OCULTAR SENHA
// ===============================
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

// ===============================
// BLOQUEAR NÚMEROS NO NOME
// ===============================
const inputNome = document.querySelector('input[name="nome"]');
if (inputNome) {
  inputNome.addEventListener("input", () => {
    inputNome.value = inputNome.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
  });
}

// ===============================
// TELEFONE MÁSCARA + ANTIFRAUDE
// ===============================
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

  inputTelefone.addEventListener("keydown", e => {
    const permitidos = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab","Home","End"];
    if (permitidos.includes(e.key) || e.ctrlKey || e.metaKey) return;
    if (!/^\d$/.test(e.key)) e.preventDefault();
  });
}

//senha
const senhaInput = document.getElementById("senha");
const confirmarSenhaInput = document.getElementById("confirmarSenha");

/* cria avisos dinamicamente abaixo dos inputs */
function criarAviso(input){
  let aviso = document.createElement("div");
  aviso.className = "aviso-senha";
  input.parentElement.insertAdjacentElement("afterend", aviso);
  return aviso;
}

const avisoSenha = criarAviso(senhaInput);
const avisoConfirmar = criarAviso(confirmarSenhaInput);

/* validar senha principal */
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

/* validar confirmação */
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

senhaInput.addEventListener("input", ()=>{
  validarSenha();
  validarConfirmacao();
});

confirmarSenhaInput.addEventListener("input", validarConfirmacao);

// ===============================
// CEP CASCAVEL - PR (CORRIGIDO)
// ===============================
const cepInput = document.getElementById("cep");
const enderecoInput = document.getElementById("endereco");
const bairroInput = document.getElementById("bairro");

let cepEhDeCascavel = false;
let cepTimeout = null;

function formatarCep(valor){
  let v = valor.replace(/\D/g,'').slice(0,8);
  if(v.length > 5) v = v.replace(/(\d{5})(\d)/,'$1-$2');
  return v;
}

async function buscarCep(cepLimpo){

  if(cepLimpo.length !== 8) return;

  try{
    const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await res.json();

    if(data.erro){
      cepEhDeCascavel = false;
      enderecoInput.value = "";
      bairroInput.value = "";
      return;
    }

    if(data.localidade !== "Cascavel" || data.uf !== "PR"){
      cepEhDeCascavel = false;

      Swal.fire({
        icon:"warning",
        title:"Cadastro restrito",
        text:"Permitido apenas para moradores de Cascavel - PR.",
        confirmButtonColor:"#347142"
      });

      cepInput.value = "";
      enderecoInput.value = "";
      bairroInput.value = "";
      return;
    }

    enderecoInput.value = data.logradouro || "";
    bairroInput.value = data.bairro || "";
    cepEhDeCascavel = true;

  }catch{
    cepEhDeCascavel = false;
  }
}

if(cepInput){

  cepInput.addEventListener("input", e=>{
    const formatado = formatarCep(e.target.value);
    e.target.value = formatado;

    clearTimeout(cepTimeout);
    const cepLimpo = formatado.replace(/\D/g,'');
    cepTimeout = setTimeout(()=>buscarCep(cepLimpo), 400);
  });

  cepInput.addEventListener("paste", e=>{
    e.preventDefault();
    const texto = (e.clipboardData || window.clipboardData).getData("text");
    const formatado = formatarCep(texto);
    cepInput.value = formatado;
    buscarCep(formatado.replace(/\D/g,''));
  });

  cepInput.addEventListener("blur", ()=>{
    const cepLimpo = cepInput.value.replace(/\D/g,'');
    buscarCep(cepLimpo);
  });
}

// ===============================
// MÁSCARA DATA NASCIMENTO
// ===============================
const inputData = document.getElementById("data_nascimento");

function mascaraData(valor){
  let v = valor.replace(/\D/g,"").slice(0,8);

  if(v.length >= 5)
    return v.replace(/(\d{2})(\d{2})(\d{1,4})/,"$1/$2/$3");
  else if(v.length >= 3)
    return v.replace(/(\d{2})(\d{1,2})/,"$1/$2");

  return v;
}

if(inputData){
  inputData.addEventListener("input",()=>{
    inputData.value = mascaraData(inputData.value);
  });

  inputData.addEventListener("keydown",(e)=>{
    const permitidos = ["Backspace","Delete","ArrowLeft","ArrowRight","Tab"];
    if(permitidos.includes(e.key)) return;
    if(!/^\d$/.test(e.key)) e.preventDefault();
  });
}

// ===============================
// VALIDAR DATA REAL
// ===============================
function dataValida(dataStr){
  if(!/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) return false;

  const [dia,mes,ano] = dataStr.split("/").map(Number);

  // ano mínimo permitido
  if(ano < 1900) return false;

  const data = new Date(ano, mes-1, dia);

  // verifica se a data realmente existe
  if(
    data.getFullYear() !== ano ||
    data.getMonth() !== mes-1 ||
    data.getDate() !== dia
  ) return false;

  // não permitir datas futuras
  const hoje = new Date();
  if(data > hoje) return false;

  return true;
}


// ===============================
// VALIDAR +18 ANOS
// ===============================
const form = document.getElementById("formCadastro");
// valida se a data realmente existe (ex: 31/02/2000 não passa)
// ===============================
// VALIDAR DATA REAL + FUTURA
// ===============================
function dataValida(dataStr){

  if(!/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) return false;

  const [dia, mes, ano] = dataStr.split("/").map(Number);

  if(ano < 1900) return false;

  const data = new Date(ano, mes - 1, dia);

  // verifica existência real
  if(
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) return false;

  // não permitir datas futuras
  const hoje = new Date();
  hoje.setHours(0,0,0,0);
  if(data > hoje) return false;

  return true;
}


// ===============================
// VALIDAR +18 ANOS (CORRIGIDO)
// ===============================
function maiorDeIdade(dataBR){

  if(!dataValida(dataBR)) return false;

  const [dia, mes, ano] = dataBR.split("/").map(Number);

  const nasc = new Date(ano, mes - 1, dia);
  const hoje = new Date();

  let idade = hoje.getFullYear() - nasc.getFullYear();

  const mesAtual = hoje.getMonth();
  const diaAtual = hoje.getDate();

  if(
    mesAtual < (mes - 1) ||
    (mesAtual === (mes - 1) && diaAtual < dia)
  ){
    idade--;
  }

  return idade >= 18;
}


if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dataTexto = e.target.data_nascimento.value.trim();

    if(!dataValida(dataTexto)){
      Swal.fire({
        icon:"warning",
        title:"Data de nascimento inválida",
        html:"Digite uma data <b>Valida!</b>",
        confirmButtonColor:"#347142",
        confirmButtonText:"Entendi",
        background:"#fff",
        customClass:{popup:"swal-eco"}
      });
      return;
    }

    if(!maiorDeIdade(dataTexto)){
      Swal.fire({
        icon:"warning",
        title:"Idade mínima não atingida",
        html:"Você precisa ter <b>18 anos ou mais</b> para usar o EcoShare.",
        confirmButtonColor:"#c62828",
        confirmButtonText:"Ok",
        background:"#fff",
        customClass:{popup:"swal-eco"}
      });
      return;
    }

    if(!cepEhDeCascavel){
      Swal.fire({
        icon:"warning",
        title:"Cadastro restrito",
        html:"No momento o EcoShare está disponível apenas para moradores de <b>Cascavel - PR</b>.",
        confirmButtonColor:"#347142",
        confirmButtonText:"Entendi",
        background:"#fff",
        customClass:{popup:"swal-eco"}
      });
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

  let titulo = "Não foi possível criar sua conta";
  let texto = "Verifique os dados preenchidos.";

  if(json.error){

    if(json.error.toLowerCase().includes("telefone")){
      titulo = "Telefone já cadastrado";
      texto = "Este número já pertence a uma conta EcoShare.";
      document.querySelector('input[name="telefone"]').focus();
    }

    else if(json.error.toLowerCase().includes("email")){
      titulo = "Email já cadastrado";
      texto = "Já existe uma conta criada com este email.";
      document.querySelector('input[name="email"]').focus();
    }

    else{
      texto = json.error;
    }
  }

  Swal.fire({
    icon:"error",
    title:titulo,
    html:`<span style="color:#555">${texto}</span>`,
    confirmButtonColor:"#c62828",
    confirmButtonText:"Entendi",
    background:"#fff",
    customClass:{popup:"swal-eco"},
    showClass:{popup:"animate__animated animate__shakeX"},
  });

  return;
}

    if(!res.ok){
      Swal.fire({
        icon:"error",
        title:"Não foi possível criar sua conta",
        text:json.error || "Tente novamente mais tarde.",
        confirmButtonColor:"#c62828",
        confirmButtonText:"Fechar",
        background:"#fff",
        customClass:{popup:"swal-eco"}
      });
      return;
    }

    Swal.fire({
      icon:"success",
      title:"Conta criada com sucesso!",
      html:"Agora você já pode entrar no EcoShare",
      confirmButtonText:"Ir para login",
      confirmButtonColor:"#347142",
      allowOutsideClick:false,
      background:"#fff",
      customClass:{popup:"swal-eco"},
      showClass:{popup:"animate__animated animate__zoomIn"},
      hideClass:{popup:"animate__animated animate__zoomOut"}
    }).then(()=> window.location.href="/login");
  });
}
