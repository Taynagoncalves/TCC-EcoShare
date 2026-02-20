let todasDenuncias = []; // guarda todas denúncias carregadas


// versão padrão do alerta pra não repetir configuração
const swal = (opts) => Swal.fire({
  confirmButtonText: 'Confirmar',
  cancelButtonText: 'Cancelar',
  denyButtonText: 'Não',
  ...opts
});


/* traduz o código da categoria  */
function formatarCategoria(cat) {
  if (!cat) return '-';

  const nomes = {
    spam: 'Spam',
    ofensivo: 'Ofensivo',
    fake: 'Informação falsa',
    ilegal: 'Conteúdo ilegal'
  };

  return nomes[cat] || cat;
}


/* busca denúncias no servidor */
async function carregarDenuncias() {
  const res = await fetch('/denuncia/admin');
  todasDenuncias = await res.json();
  renderizarDenuncias(todasDenuncias);
}


/* monta a tabela */
function renderizarDenuncias(denuncias) {

  const tbody = document.getElementById('listaDenuncias');
  tbody.innerHTML = '';

  if (!denuncias.length) {
    tbody.innerHTML = `<tr><td colspan="5">Nenhuma denúncia encontrada.</td></tr>`;
    return;
  }

  denuncias.forEach(d => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${d.denuncia_id}</td>

      <td class="usuario-col">
        <strong>${d.denunciante ?? 'Desconhecido'}</strong>
        <div class="subinfo">ID ${d.denunciante_id ?? '-'}</div>
      </td>

      <td>
        <span class="categoria ${d.categoria}">
          ${formatarCategoria(d.categoria)}
        </span>
      </td>

      <td class="resumo">
        ${d.mensagem?.slice(0, 60) ?? '-'}
        ${d.mensagem?.length > 60 ? '...' : ''}
      </td>

      <td>
        <span class="status ${d.status}">
          ${d.status}
        </span>
      </td>

      <td class="acoes">
        <div class="acoes-wrap">

          <button class="btn-exibir">Exibir</button>

          ${
            d.doacao_id != null
            ? `<button class="btn-recusar" onclick="removerPublicacao(${d.doacao_id}, ${d.denuncia_id})">Remover</button>`
            : ''
          }

          <button class="btn-concluir" onclick="resolverDenuncia(${d.denuncia_id})">
            Resolver
          </button>

        </div>
      </td>
    `;

    // abre modal com detalhes
    tr.querySelector('.btn-exibir')
      .addEventListener('click', () => abrirDetalheDenuncia(d));

    tbody.appendChild(tr);
  });
}


/* filtra por categoria */
function filtrarDenuncias() {
  const categoria = document.getElementById('filtroCategoria').value;

  if (!categoria) {
    renderizarDenuncias(todasDenuncias);
    return;
  }

  const filtradas = todasDenuncias.filter(d => d.categoria === categoria);
  renderizarDenuncias(filtradas);
}


/* modal completo da denúncia */
function abrirDetalheDenuncia(d) {
  swal({
    width: 850,
    background: '#f8fafc',
    title: `<span style="font-size:22px">Denúncia #${d.denuncia_id}</span>`,
    html: `
      <div style="display:flex;gap:30px;align-items:flex-start">

        <div style="flex:1;text-align:left">

          <div style="background:white;padding:15px;border-radius:12px;margin-bottom:15px">
            <h3 style="margin-bottom:6px;color:#374151">Denunciante</h3>
            <p><b>${d.denunciante}</b> (ID ${d.denunciante_id})</p>
          </div>

          <div style="background:white;padding:15px;border-radius:12px;margin-bottom:15px">
            <h3 style="margin-bottom:6px;color:#374151">Doação reportada</h3>
            <p><b>Doador:</b> ${d.doador} (ID ${d.doador_id})</p>
            <p><b>Material:</b> ${d.nome_material}</p>
            <p><b>Descrição:</b> ${d.descricao ?? 'sem descrição'}</p>
          </div>

          <div style="background:white;padding:15px;border-radius:12px">
            <h3 style="margin-bottom:6px;color:#374151">Motivo da denúncia</h3>
            <p style="white-space:pre-line">${d.mensagem}</p>
          </div>

        </div>

        <div style="width:300px">
          <div style="background:white;padding:15px;border-radius:12px;text-align:center">
            <h4 style="margin-bottom:10px;color:#374151">Imagem da Doação</h4>

            ${
              d.imagem
              ? `<img src="/uploads/${d.imagem}"
                   style="width:100%;border-radius:12px;box-shadow:0 6px 18px rgba(0,0,0,.25)">`
              : `<p style="color:#9ca3af"><i>sem imagem</i></p>`
            }
          </div>
        </div>

      </div>
    `,
    showDenyButton: true,
    showCancelButton: true,
    confirmButtonText: 'Bloquear 7 dias',
    denyButtonText: 'Banir permanente',
    cancelButtonText: 'Fechar'
  }).then(async (result) => {

    if (!result.isConfirmed && !result.isDenied) return;

    // pede motivo antes de punir
    const { value: motivo } = await swal({
      title: 'Motivo da punição',
      input: 'textarea',
      inputPlaceholder: 'o usuário receberá este motivo por email...',
      inputAttributes: { style: 'height:120px' },
      confirmButtonText: 'Aplicar punição',
      showCancelButton: true
    });

    if (!motivo) return;

    const tipo = result.isConfirmed ? '7dias' : 'ban';

    await fetch(`/usuarios/admin/punir/${d.doador_id}`, {
      method:'PUT',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ tipo, motivo })
    });

    swal({
      icon:'success',
      title:'Usuário punido com sucesso'
    });
  });
}


/* remove publicação denunciada */
async function removerPublicacao(doacaoId, denunciaId) {
  const confirm = await swal({
    title: 'Remover publicação?',
    text: 'Esta ação não poderá ser desfeita!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d32f2f',
    cancelButtonColor: '#aaa',
    confirmButtonText: 'Sim, remover'
  });

  if (!confirm.isConfirmed) return;

  await fetch(`/doacoes/${doacaoId}`, { method: 'DELETE' });
  await resolverDenuncia(denunciaId);

  swal({
    icon: 'success',
    title: 'Publicação removida',
    timer: 1500,
    showConfirmButton: false
  });
}


/* marca denúncia como resolvida */
async function resolverDenuncia(id) {
  const confirm = await swal({
    title: 'Marcar como resolvido?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#2e7d32',
    confirmButtonText: 'Sim'
  });

  if (!confirm.isConfirmed) return;

  await fetch(`/denuncia/${id}/resolver`, { method: 'PUT' });

  swal({
    icon: 'success',
    title: 'Denúncia resolvida',
    timer: 1400,
    showConfirmButton: false
  });

  carregarDenuncias();
}


// inicia carregando a lista
carregarDenuncias();