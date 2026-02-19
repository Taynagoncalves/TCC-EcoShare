document.addEventListener('DOMContentLoaded', () => {
  carregarPerfil();
  setupEdicao();
});

function formatarDataBR(dataISO){
  if(!dataISO) return "";

  const data = new Date(dataISO);
  if(isNaN(data)) return "";

  const dia = String(data.getDate()).padStart(2,'0');
  const mes = String(data.getMonth()+1).padStart(2,'0');
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

let perfilOriginal = null;
let modoEdicao = false;

/* =====================================================
   SETUP BOTÕES
===================================================== */
function setupEdicao() {

  const btnEditar = document.getElementById('btnEditar');
  const btnSalvar = document.getElementById('btnSalvar');
  const btnCancelar = document.getElementById('btnCancelar');
  const btnTrocarFoto = document.getElementById('btnTrocarFoto');
  const inputFoto = document.getElementById('inputFoto');

  btnEditar.addEventListener('click', entrarEdicao);
  btnCancelar.addEventListener('click', cancelarEdicao);
  btnSalvar.addEventListener('click', salvarEdicao);

  btnTrocarFoto.addEventListener('click', () => {
    if (!modoEdicao) {
      Swal.fire({
        icon: 'info',
        title: 'Ative a edição',
        text: 'Clique em "Editar perfil" para trocar a foto.',
        confirmButtonColor: '#347142'
      });
      return;
    }
    inputFoto.click();
  });

  inputFoto.addEventListener('change', async () => {
    if (inputFoto.files?.[0]) await enviarFoto(inputFoto.files[0]);
  });
}

async function carregarPerfil() {
  try {

    // ===== DADOS DO USUÁRIO =====
    const userRes = await fetch('/usuarios/me', { credentials: 'include' });
    if (!userRes.ok) throw new Error();

    const usuario = await userRes.json();

    // ===== PONTOS DO USUÁRIO =====
    const pontosRes = await fetch('/usuarios/pontos', { credentials: 'include' });
    if (!pontosRes.ok) throw new Error();

    const pontosData = await pontosRes.json();

    // mostra pontos na tela
    const pontosEl = document.getElementById('pontosUsuario');
    if (pontosEl) {
      pontosEl.innerText = `${pontosData.pontos} pts`;
    }

    // guarda original
    perfilOriginal = {
      nome: usuario.nome || '',
      email: usuario.email || '',
      telefone: usuario.telefone || '',
      data_nascimento: formatarDataBR(usuario.data_nascimento),

      foto: usuario.foto || ''
    };

    setCampos(perfilOriginal);

  } catch (err) {
    console.error(err);
    Swal.fire({
      icon: 'error',
      title: 'Erro',
      text: 'Erro ao carregar perfil',
      confirmButtonColor: '#347142'
    });
  }
}


/* =====================================================
   PREENCHER CAMPOS
===================================================== */
function setCampos(dados) {
  document.getElementById('nome').value = dados.nome;
  document.getElementById('email').value = dados.email;
  document.getElementById('telefone').value = dados.telefone;
  document.getElementById('dataNascimento').value = dados.data_nascimento || '';

  const avatar = document.getElementById('avatarImg');

  // garante sempre uma imagem válida
  if (avatar) {
    avatar.src = dados.foto && dados.foto.trim() !== ''
      ? dados.foto + "?t=" + new Date().getTime() // evita cache
      : '/icons/user.png';
  }
}


function setInputsHabilitados(habilitar) {
  document.getElementById('nome').disabled = !habilitar;
  document.getElementById('email').disabled = !habilitar;
  document.getElementById('telefone').disabled = !habilitar;
  document.getElementById('dataNascimento').disabled = !habilitar;
}

/* =====================================================
   NOME — bloquear números
===================================================== */
document.getElementById("nome").addEventListener("input", e => {
  e.target.value = e.target.value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
});

/* =====================================================
   TELEFONE — máscara + antifraude
===================================================== */
const telInput = document.getElementById("telefone");

function mascaraTelefone(v){
  v = String(v || "").replace(/\D/g,"").slice(0,11);

  if(v.length <= 10)
    return v.replace(/^(\d{2})(\d)/,"($1) $2")
            .replace(/(\d{4})(\d)/,"$1-$2");
  else
    return v.replace(/^(\d{2})(\d)/,"($1) $2")
            .replace(/(\d{5})(\d)/,"$1-$2");
}

telInput.addEventListener("input",()=>{
  telInput.value = mascaraTelefone(telInput.value);
});

function telefoneSuspeito(t){
  t = t.replace(/\D/g,"");

  if(t.length < 10) return true;
  if(/^(\d)\1+$/.test(t)) return true;
  if("01234567890123456789".includes(t)) return true;
  if("98765432109876543210".includes(t)) return true;
  if(new Set(t.split("")).size < 4) return true;

  return false;
}

/* =====================================================
   DATA NASCIMENTO — máscara + validação
===================================================== */
const dataInput = document.getElementById("dataNascimento");

function mascaraData(v){
  v=v.replace(/\D/g,"").slice(0,8);
  if(v.length>=5) return v.replace(/(\d{2})(\d{2})(\d+)/,"$1/$2/$3");
  if(v.length>=3) return v.replace(/(\d{2})(\d+)/,"$1/$2");
  return v;
}

dataInput.addEventListener("input",()=>{
  dataInput.value = mascaraData(dataInput.value);
});

function dataValida(str){
  if(!/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return false;

  const[d,m,a]=str.split("/").map(Number);
  const hoje=new Date();

  if(a<1900||a>hoje.getFullYear()) return false;

  const dias=new Date(a,m,0).getDate();
  if(d<1||d>dias||m<1||m>12) return false;

  const data=new Date(a,m-1,d);
  if(data>hoje) return false;

  return true;
}

/* =====================================================
   BOTÕES
===================================================== */
function entrarEdicao(){
  modoEdicao=true;
  setInputsHabilitados(true);
  btnEditar.hidden=true;
  btnSalvar.hidden=false;
  btnCancelar.hidden=false;
}

function cancelarEdicao(){
  modoEdicao=false;
  setInputsHabilitados(false);
  setCampos(perfilOriginal);
  btnEditar.hidden=false;
  btnSalvar.hidden=true;
  btnCancelar.hidden=true;
}

/* =====================================================
   SALVAR PERFIL
===================================================== */
async function salvarEdicao(){
  try{

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const dataTexto = document.getElementById('dataNascimento').value.trim();

    if(dataTexto && !dataValida(dataTexto))
      return Swal.fire({icon:"warning",title:"Data inválida",confirmButtonColor:"#347142"});

    if(telefoneSuspeito(telefone))
      return Swal.fire({icon:"warning",title:"Telefone inválido",confirmButtonColor:"#347142"});

    let dataSQL = null;
    if(dataTexto){
      const[d,m,a]=dataTexto.split("/");
      dataSQL=`${a}-${m}-${d}`;
    }

    const res=await fetch('/usuarios/me',{
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      credentials:'include',
      body:JSON.stringify({nome,email,telefone,data_nascimento:dataSQL})
    });

    if(!res.ok) throw new Error();

    Swal.fire({
      icon:'success',
      title:'Perfil atualizado!',
      confirmButtonColor:'#347142'
    });

    modoEdicao=false;
    setInputsHabilitados(false);

  }catch{
    Swal.fire({
      icon:'error',
      title:'Erro ao salvar perfil',
      confirmButtonColor:'#347142'
    });
  }
}

/* =====================================================
   FOTO
===================================================== */
async function enviarFoto(file){
  try{

    const avatar = document.getElementById('avatarImg');

    // 1️⃣ preview imediato (sem esperar servidor)
    const previewURL = URL.createObjectURL(file);
    avatar.src = previewURL;

    const form = new FormData();
    form.append('foto', file);

    const res = await fetch('/usuarios/me/foto',{
      method:'PUT',
      credentials:'include',
      body:form
    });

    const data = await res.json().catch(()=>({}));

    if(!res.ok) throw new Error(data.erro || "Erro ao atualizar");

    // 2️⃣ força atualizar imagem REAL do servidor (anti cache)
    if(data.foto){
      const novaFoto = data.foto + "?t=" + new Date().getTime();
      avatar.src = novaFoto;

      if(perfilOriginal){
        perfilOriginal.foto = novaFoto;
      }
    }

    Swal.fire({
      icon:'success',
      title:'Foto atualizada!',
      confirmButtonColor:'#347142'
    });

  }catch(err){
    console.error(err);

    Swal.fire({
      icon:'error',
      title:'Erro ao atualizar foto',
      text:'Tente novamente',
      confirmButtonColor:'#347142'
    });
  }
}
