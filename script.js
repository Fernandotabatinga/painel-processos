function registrarSolicitacao() {
    const destinatario = document.getElementById('destinatario').value;
    const urgencia = document.getElementById('urgencia').value;
    const registradoPor = document.getElementById('registradoPor').value;
    const descricao = document.getElementById('descricao').value;

    if (!registradoPor || !descricao) {
        alert("Preencha todos os campos!");
        return;
    }

    const cores = {
        "Neto": "blue",
        "Isadora": "red",
        "Tiago": "green",
        "Fernando": "black"
    };

    const solicitacao = {
        destinatario,
        urgencia,
        registradoPor,
        descricao,
        cor: cores[destinatario]
    };

    let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];
    solicitacoes.push(solicitacao);
    localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));

    window.location.href = "index.html";
}

function carregarSolicitacoes() {
    let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];

    solicitacoes.forEach((solicitacao, index) => {
        let div = document.createElement("div");
        div.classList.add("solicitacao");
        div.style.backgroundColor = solicitacao.cor;
        div.innerHTML = `<strong>${solicitacao.destinatario}</strong> <br> ${solicitacao.descricao} <br> 
                         <small>Registrado por: ${solicitacao.registradoPor}</small> 
                         <span class="fechar" onclick="removerSolicitacao(${index})">❌</span>`;

        document.getElementById(solicitacao.urgencia).appendChild(div);
    });
}

function removerSolicitacao(index) {
    let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];
    solicitacoes.splice(index, 1);
    localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
    location.reload();
}

if (window.location.pathname.includes("index.html")) {
    carregarSolicitacoes();
}
