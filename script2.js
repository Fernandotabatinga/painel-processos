import {
    db,
    collection,
    getDocs,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot
} from "./firebase-config.js";

window.filtroResponsavel = 'todos';
window.filtroPrioridade = 'todas';
window.filtroNome = 'todos';

async function testarConexaoFirebase() {
    try {
        const querySnapshot = await getDocs(collection(db, "solicitacoes"));
        console.log("Firebase conectado! Total de documentos:", querySnapshot.size);
    } catch (error) {
        console.error("Erro ao conectar ao Firestore:", error);
    }
}

testarConexaoFirebase();

document.addEventListener('DOMContentLoaded', () => {
    atualizarHoraData();
    document.getElementById('clima').innerHTML = '<i class="fas fa-sun"></i> Teresina-PI, 32°C';

    // Observa mudanças no Firestore e carrega solicitações dinamicamente
    onSnapshot(collection(db, "solicitacoes"), (snapshot) => {
        limparQuadroKanban();
        snapshot.forEach((docSnap) => {
            const dados = docSnap.data();
            criarCardHTML(docSnap.id, dados);
        });
        atualizarContadores();
    });
});

window.onload = function () {
    atualizarEstiloFiltro('responsavel', window.filtroResponsavel);
    atualizarEstiloFiltro('prioridade', window.filtroPrioridade);
    atualizarEstiloFiltro('nome', window.filtroNome);
};


// Atualizar hora e data
function atualizarHoraData() {
    const agora = new Date();
    const formatoData = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    document.getElementById('hora-data').innerHTML = '<i class="fas fa-calendar-alt"></i> ' + formatoData.format(agora);
    
    // Atualizar a cada minuto
    setTimeout(atualizarHoraData, 60000);
}

// Função para abrir modal
window.abrirModal = function abrirModal(id) {
    document.getElementById(id).style.display = 'block';
}

// Função para fechar modal
window.fecharModal = function fecharModal(id) {
    document.getElementById(id).style.display = 'none';
}

// Fechar modal ao clicar fora dele
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Gerar ID único para novos cards
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Adicionar nova solicitação e salvar no Firebase
window.adicionarNovaSolicitacao = async function adicionarNovaSolicitacao(event) {
    event.preventDefault();
    const titulo = document.getElementById('titulo').value;
    const prioridade = document.getElementById('prioridade').value;
    const responsavel = document.getElementById('responsavel').value;
    const departamento = document.getElementById('departamento').value;
    const prazo = document.getElementById('prazo').value;
    const descricao = document.getElementById('descricao').value;

    try {
        await addDoc(collection(db, "solicitacoes"), {
            titulo,
            prioridade,
            responsavel,
            departamento,
            prazo,
            descricao,
            concluido: false,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error("Erro ao adicionar solicitação:", error);
    }

    fecharModal('modal-solicitacao');
    document.getElementById('form-nova-solicitacao').reset();
    aplicarFiltros();
}

// Cria a estrutura HTML do card a partir dos dados do Firebase
function criarCardHTML(id, dados) {
    const { titulo, prioridade, responsavel, departamento, prazo, descricao, concluido } = dados;
    const colunaId = concluido ? 'coluna-concluido' : 'coluna-' + prioridade;
    let corPrioridade;
    switch (prioridade) {
        case 'urgente': corPrioridade = 'var(--urgente-color)'; break;
        case 'alta': corPrioridade = 'var(--alta-color)'; break;
        case 'media': corPrioridade = 'var(--media-color)'; break;
        case 'baixa': corPrioridade = 'var(--baixa-color)'; break;
        default: corPrioridade = 'var(--primary-color)';
    }
    const prazoDisplay = prazo ? `Prazo: ${prazo}` : 'Novo';

    const card = document.createElement('div');
    card.className = 'kanban-card';
    card.dataset.id = id;
    card.dataset.prioridade = prioridade;
    card.dataset.departamento = departamento;
    card.innerHTML = `
        <div class="card-indicator" style="background-color: ${concluido ? 'var(--concluido-color)' : corPrioridade};"></div>
        <div class="card-header">
            <span class="card-tag">${departamento}</span>
            <span class="priority-badge badge-${prioridade}">${prioridade.charAt(0).toUpperCase() + prioridade.slice(1)}</span>
        </div>
        <div class="card-title">${titulo}</div>
        ${descricao ? `<div class="card-description">${descricao}</div>` : ''}
        <div class="progress-bar">
            <div class="progress-fill" style="width: ${concluido ? '100' : '0'}%; background-color: ${concluido ? 'var(--concluido-color)' : corPrioridade};"></div>
        </div>
        <div class="card-meta">
            <span class="responsible-name">${responsavel}</span>
            <span>${concluido ? 'Concluído: ' + new Date().toLocaleDateString() : prazoDisplay}</span>
        </div>
        <div class="card-actions">
            <button class="card-action action-delete" onclick="excluirCard('${id}')"><i class="fas fa-trash"></i> Excluir</button>
            ${!concluido ? `<button class="card-action action-complete" onclick="concluirCard('${id}')"><i class="fas fa-check"></i> Concluir</button>` : ''}
        </div>
    `;

    document.getElementById(colunaId).appendChild(card);
    aplicarFiltros();
}

// Excluir card do Firebase
window.excluirCard = async function excluirCard(id) {
    if (confirm('Tem certeza que deseja excluir esta solicitação?')) {
        try {
            await deleteDoc(doc(db, "solicitacoes", id));
        } catch (error) {
            console.error("Erro ao excluir solicitação:", error);
        }
    }
    aplicarFiltros();
}

// Concluir card (atualizar no Firebase)
window.concluirCard = async function concluirCard(id) {
    if (!confirm("Deseja concluir a solicitação?")) return;
    try {
        await updateDoc(doc(db, "solicitacoes", id), {
            concluido: true
        });
    } catch (error) {
        console.error("Erro ao concluir solicitação:", error);
    }
    aplicarFiltros();
}

// Atualizar contadores (com base no quadro atual)
function atualizarContadores() {
    const urgente = document.querySelectorAll('#coluna-urgente .kanban-card').length;
    const alta = document.querySelectorAll('#coluna-alta .kanban-card').length;
    const media = document.querySelectorAll('#coluna-media .kanban-card').length;
    const baixa = document.querySelectorAll('#coluna-baixa .kanban-card').length;
    const concluido = document.querySelectorAll('#coluna-concluido .kanban-card').length;

    document.getElementById('urgente-count').textContent = urgente;
    document.getElementById('alta-count').textContent = alta;
    document.getElementById('media-count').textContent = media;
    document.getElementById('baixa-count').textContent = baixa;
    document.getElementById('concluido-count').textContent = concluido;

    document.getElementById('contador-urgente').textContent = urgente;
    document.getElementById('contador-alta').textContent = alta;
    document.getElementById('contador-media').textContent = media;
    document.getElementById('contador-baixa').textContent = baixa;
    document.getElementById('contador-concluido').textContent = concluido;


    const total = urgente + alta + media + baixa + concluido;
    document.getElementById('solicitacoes-hoje').textContent = total - concluido;
    document.getElementById('concluidas-hoje').textContent = concluido;

    const percentConcluido = total > 0 ? Math.round((concluido / total) * 100) : 0;
    document.querySelector('#concluidas-hoje').closest('.d-flex').querySelector('.progress-fill').style.width = percentConcluido + '%';

    const percentPendente = total > 0 ? Math.round(((total - concluido) / total) * 100) : 0;
    document.querySelector('#solicitacoes-hoje').closest('.d-flex').querySelector('.progress-fill').style.width = percentPendente + '%';
}

// Remove todos os cards do quadro para repovoar
function limparQuadroKanban() {
    ['urgente','alta','media','baixa','concluido'].forEach(pri => {
        const col = document.getElementById(`coluna-${pri}`);
        if (col) {
            col.innerHTML = '';
        }
    });
}

// Função para filtrar por responsável
// window.filtrarPorResponsavel = function filtrarPorResponsavel(filtro) {
//     const cards = document.querySelectorAll('.kanban-card');

//     if (filtro === 'todos') {
//         cards.forEach(card => card.style.display = 'block');
//     } else {
//         cards.forEach(card => {
//             const departamento = card.dataset.departamento;
//             if (departamento === filtro) {
//                 card.style.display = 'block';
//             } else {
//                 card.style.display = 'none';
//             }
//         });
//     }
// }

// Função para filtrar por prioridade
// window.filtrarPorPrioridade = function filtrarPorPrioridade(filtro) {
//     const cards = document.querySelectorAll('.kanban-card');
    
//     cards.forEach(card => {
//         if (filtro === 'todas') {
//             card.style.display = 'block';
//         } else {
//             if (card.dataset.prioridade === filtro) {
//                 card.style.display = 'block';
//             } else {
//                 card.style.display = 'none';
//             }
//         }
//     });
// }

// // Função para filtrar por nome
// window.filtrarPorNome = function filtrarPorNome(filtro) {
//     const cards = document.querySelectorAll('.kanban-card');

//     cards.forEach(card => {
//         if (filtro === 'todos') {
//             card.style.display = 'block';
//         } else {
//             if (card.querySelector('.responsible-name').textContent === filtro) {
//                 card.style.display = 'block';
//             } else {
//                 card.style.display = 'none';
//             }
//         }
//     });
// }

window.filtrarPorResponsavel = function filtrarPorResponsavel(responsavel) {
    window.filtroResponsavel = responsavel;
    aplicarFiltros();
    atualizarEstiloFiltro('responsavel', responsavel);
}

window.filtrarPorPrioridade = function filtrarPorPrioridade(prioridade) {
    window.filtroPrioridade = prioridade;
    aplicarFiltros();
    atualizarEstiloFiltro('prioridade', prioridade);
}

window.filtrarPorNome = function filtrarPorNome(nome) {
    window.filtroNome = nome;
    aplicarFiltros();
    atualizarEstiloFiltro('nome', nome);
}

function aplicarFiltros() {
    const todosCards = document.querySelectorAll('.kanban-card');

    console.log('Responsável:', window.filtroResponsavel);
    console.log('Prioridade:', window.filtroPrioridade);    
    console.log('Nome:', window.filtroNome);

    todosCards.forEach(card => {
        let mostrar = true;

        // Filtro por responsável
        if (window.filtroResponsavel !== 'todos' && card.dataset.departamento !== window.filtroResponsavel) {
            mostrar = false;
        }

        // Filtro por prioridade
        if (window.filtroPrioridade !== 'todas' && card.dataset.prioridade !== window.filtroPrioridade) {
            mostrar = false;
        }

        // Filtro por nome
        if (window.filtroNome !== 'todos' && card.querySelector('.responsible-name').textContent !== window.filtroNome) {
            mostrar = false;
        }

        card.style.display = mostrar ? 'block' : 'none';
    });
}

function atualizarEstiloFiltro(tipo, valorSelecionado) {
    let seletorBase = '';
    if (tipo === 'responsavel') {
        seletorBase = "[onclick^=\"filtrarPorResponsavel\"]";
    } else if (tipo === 'prioridade') {
        seletorBase = "[onclick^=\"filtrarPorPrioridade\"]";
    } else if (tipo === 'nome') {
        seletorBase = "[onclick^=\"filtrarPorNome\"]";
    }

    const itens = document.querySelectorAll(`.dropdown-menu ${seletorBase}`);

    console.log(itens);

    itens.forEach(item => {
        item.classList.remove('ativo');
        if (item.getAttribute('onclick').includes(`('${valorSelecionado}')`)) {
            item.classList.add('ativo');
        }
    });
}




// Função para limpar todos os concluídos (inclusive do FireBase)
window.limparConcluidos = function limparConcluidos() {
    if (confirm('Tem certeza que deseja excluir todas as solicitações concluídas?')) {
        const cardsConcluidos = document.querySelectorAll('#coluna-concluido .kanban-card');
        cardsConcluidos.forEach(card => {
            const id = card.dataset.id;
            deleteDoc(doc(db, "solicitacoes", id));
        }
        );
    }
    aplicarFiltros();
}




