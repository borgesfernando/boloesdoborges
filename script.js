document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('lista-projetos');
    
    Object.entries(CONF_PROJETOS).forEach(([id, projeto]) => {
        const card = document.createElement('div');
        card.className = 'projeto-card';
        card.innerHTML = `
            <h2>${projeto.nome}</h2>
            <p>Data: ${projeto.data}</p>
        `;
        
        card.addEventListener('click', () => {
            // Armazena o projeto selecionado no localStorage
            localStorage.setItem('projetoSelecionado', id);
            // Redireciona para a página do projeto
            window.location.href = 'projeto.html';
        });
        
        container.appendChild(card);
    });
});
