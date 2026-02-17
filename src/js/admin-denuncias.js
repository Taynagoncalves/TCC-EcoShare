async function carregarDenuncias() {
  const res = await fetch('/denuncia/admin');
  const denuncias = await res.json();

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
      <td>${d.denunciante ?? '-'}</td>
      <td>${d.mensagem}</td>
      <td><span class="status ${d.status}">${d.status}</span></td>
      <td class="acoes">
        ${d.doacao_id != null ? `<button class="btn-exibir" onclick="exibirPublicacao(${d.doacao_id})">Exibir</button>` : ''}
        ${d.doacao_id != null ? `<button class="btn-recusar" onclick="removerPublicacao(${d.doacao_id}, ${d.denuncia_id})">Remover</button>` : ''}
        <button class="btn-concluir" onclick="resolverDenuncia(${d.denuncia_id})">Resolver</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/* EXIBIR PUBLICAÇÃO */
async function exibirPublicacao(id) {
  const res = await fetch(`/doacoes/${id}`);
  const d = await res.json();

  Swal.fire({
    title: d.nome_material,
    html: `
      <img src="/uploads/${d.imagem}" style="width:100%;border-radius:12px;margin-bottom:10px;">
      <p><b>Quantidade:</b> ${d.quantidade}</p>
      <p><b>Descrição:</b> ${d.descricao || 'Sem descrição'}</p>
    `,
    confirmButtonColor: '#2e7d32',
    confirmButtonText: 'Fechar'
  });
}

/* REMOVER PUBLICAÇÃO */
async function removerPublicacao(doacaoId, denunciaId) {

  const confirm = await Swal.fire({
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

  Swal.fire({
    icon: 'success',
    title: 'Publicação removida',
    timer: 1500,
    showConfirmButton: false
  });
}

/* RESOLVER DENÚNCIA */
async function resolverDenuncia(id) {

  const confirm = await Swal.fire({
    title: 'Marcar como resolvido?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#2e7d32',
    confirmButtonText: 'Sim'
  });

  if (!confirm.isConfirmed) return;

  await fetch(`/denuncia/${id}/resolver`, { method: 'PUT' });

  Swal.fire({
    icon: 'success',
    title: 'Denúncia resolvida',
    timer: 1400,
    showConfirmButton: false
  });

  carregarDenuncias();
}

carregarDenuncias();
