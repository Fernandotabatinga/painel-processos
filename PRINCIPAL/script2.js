// Função para registrar uma nova solicitação
function registrarSolicitacao() {
    const destinatario = document.getElementById('destinatario').value;
    const urgencia = document.getElementById('urgencia').value;
    const registradoPor = document.getElementById('registradoPor').value;
    const descricao = document.getElementById('descricao').value;

    // Validação dos campos obrigatórios
    if (!destinatario || !urgencia || !registradoPor || !descricao) {
        alert("Preencha todos os campos!");
        return;
    }

    // Cores associadas aos destinatários
    const cores = {
        "Neto": "blue",
        "Isadora": "red",
        "Tiago": "green",
        "Fernando": "black"
    };

    // Cria o objeto da solicitação
    const solicitacao = {
        destinatario,
        urgencia,
        registradoPor,
        descricao,
        cor: cores[destinatario] || "gray" // Cor padrão caso o destinatário não esteja na lista
    };

    // Salva a solicitação no localStorage
    let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];
    solicitacoes.push(solicitacao);
    localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));

    // Redireciona para a página principal
    window.location.href = "index.html";
}

// Função para carregar as solicitações no quadro Kanban
function carregarSolicitacoes() {
    let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];

    solicitacoes.forEach((solicitacao, index) => {
        // Cria o card da solicitação
        const card = document.createElement("div");
        card.classList.add("kanban-card");
        card.setAttribute("data-id", index);
        card.setAttribute("data-prioridade", solicitacao.urgencia.toLowerCase());
        card.innerHTML = `
            <div class="card-indicator" style="background-color: ${solicitacao.cor};"></div>
            <div class="card-header">
                <span class="card-tag">${solicitacao.destinatario}</span>
                <span class="priority-badge badge-${solicitacao.urgencia.toLowerCase()}">${solicitacao.urgencia}</span>
            </div>
            <div class="card-title">${solicitacao.descricao}</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: 0%; background-color: ${solicitacao.cor};"></div>
            </div>
            <div class="card-meta">
                <span class="responsible-name">${solicitacao.registradoPor}</span>
                <span>Prazo: Hoje</span>
            </div>
            <div class="card-actions">
                <button class="card-action action-delete" onclick="removerSolicitacao(${index})"><i class="fas fa-trash"></i> Excluir</button>
                <button class="card-action action-complete" onclick="concluirCard(${index})"><i class="fas fa-check"></i> Concluir</button>
            </div>
        `;

        // Adiciona o card à coluna correspondente
        const coluna = document.getElementById(`coluna-${solicitacao.urgencia.toLowerCase()}`);
        if (coluna) {
            coluna.appendChild(card);
        }
    });
}

// Função para remover uma solicitação
function removerSolicitacao(index) {
    let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];
    solicitacoes.splice(index, 1); // Remove a solicitação do array
    localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes)); // Atualiza o localStorage
    location.reload(); // Recarrega a página para refletir as mudanças
}

// Função para marcar uma solicitação como concluída
function concluirCard(index) {
    let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];
    solicitacoes[index].concluido = true; // Marca como concluído
    localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes)); // Atualiza o localStorage
    location.reload(); // Recarrega a página para refletir as mudanças
}

// Carrega as solicitações ao abrir a página
if (window.location.pathname.includes("index.html")) {
    carregarSolicitacoes();
}