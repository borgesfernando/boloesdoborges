document.addEventListener('DOMContentLoaded', function() {
    const projetoId = localStorage.getItem('projetoSelecionado');
    const projeto = CONF_PROJETOS[projetoId];
    
    if (projeto) {
        document.getElementById('titulo-pagina').textContent = projeto.nome;
        
        const container = document.getElementById('conteudo-projeto');
        container.innerHTML = `
            <h1 style="color: ${projeto.corPrimaria}">${projeto.nome}</h1>
            <div class="detalhes">
                <p>Valor: R$ ${projeto.valor}</p>
                <p>Parcelas: ${projeto.parcelas}x</p>
                <p>Data: ${projeto.data}</p>
            </div>
            <a href="index.html">Voltar</a>
        `;
    } else {
        window.location.href = 'index.html';
    }
});
