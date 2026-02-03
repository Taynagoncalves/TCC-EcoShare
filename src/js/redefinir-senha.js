const form = document.getElementById("formRedefinir");

// pega o token da URL
const params = new URLSearchParams(window.location.search);
const token = params.get("token");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const senha = document.getElementById("senha").value;
  const confirmar = document.getElementById("confirmar").value;

  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Link inválido",
      text: "Token ausente. Solicite novamente a redefinição de senha.",
      confirmButtonColor: "#347142"
    });
    return;
  }

  //  validação de senha (mínimo 6 caracteres)
  if (!senha || senha.length < 6) {
    Swal.fire({
      icon: "warning",
      title: "Senha inválida",
      text: "A senha deve ter no mínimo 6 caracteres.",
      confirmButtonColor: "#347142"
    });
    return;
  }

  if (senha !== confirmar) {
    Swal.fire({
      icon: "error",
      title: "Senhas diferentes",
      text: "As senhas informadas não coincidem.",
      confirmButtonColor: "#347142"
    });
    return;
  }

  try {
    const res = await fetch("/redefinir-senha", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, senha })
    });

    const json = await res.json();

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "Erro",
        text: json.error || "Não foi possível redefinir a senha.",
        confirmButtonColor: "#347142"
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Senha redefinida!",
      text: "Sua senha foi alterada com sucesso. Faça login novamente.",
      confirmButtonColor: "#347142"
    }).then(() => {
      window.location.href = "/login";
    });

  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Erro inesperado",
      text: "Erro de conexão com o servidor.",
      confirmButtonColor: "#347142"
    });
  }
});