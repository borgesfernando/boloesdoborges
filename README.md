# 📌 Projeto Bolões do Borges 

**🤝 SUA COMUNIDADE CONFIÁVEL DE BOLÕES!**  
Projeto organizado com transparência, tecnologia avançada e 15 anos de experiência para multiplicar suas chances nos principais concursos especiais da CAIXA.

## 🎯 Principais Recursos

- **📅 Concursos Especiais** organizados:
  - Lotofácil da Independência
  - Quina de São João
  - Dupla Sena de Páscoa
  - Mega da Virada
 
- **📅 Projetos Mensais** com sorteios diários:
  - Lotofácil
  - Quina

- **🤖 Tecnologia de Ponta**:
  - Machine Learning para análise estatística
  - Redes Neurais para otimização de palpites
  - Sistemas automatizados de conferência

- **✨ 15 Anos de História**:
  - Comunidade consolidada
  - Prestação de contas transparente
  - Resultados comprovados

## 📊 Como Participar

1. Inicie com seu cadastro [AQUI](https://docs.google.com/forms/d/e/1FAIpQLSeGURdHgTYpsLF4hcW45xlHJGkdqv4ubCNr3lvGk4dGCcTqxw/viewform)
2. Entre na comunidade
3. Confira os projetos disponíveis

## 🔍 Transparência Total

- Todos os palpites são registrados e auditáveis
- Resultados publicados imediatamente após os sorteios
- Todas as informações são enviadas no e-mail
- Relatórios completos de desempenho

## 📌 Regras Básicas

✔️ Participação voluntária  
✔️ Sem fins lucrativos  
✔️ Responsabilidade compartilhada  
✔️ Respeito aos prazos de pagamento  

## 📧 Contato

Dúvidas ou sugestões?  
Entre em contato: [correiodofernando@gmail.com](mailto:correiodofernando@gmail.com)

---

**⚠️ Importante**: Este projeto é uma ação entre amigos organizada por Borges, sem vínculo com a CAIXA Econômica Federal. Participação voluntária por adultos maiores de 18 anos 🤝🏻

## 🔄 JSON sempre atualizado a partir do `js/config.js`

Há automação para gerar um JSON consumível por integrações (ex.: n8n) com base em `js/config.js`.

### GitHub Actions (automático no `main`)

- Workflow: `.github/workflows/update-projetos.yml`
- Em cada push para `main`, roda `node scripts/extract-projetos.js` e atualiza `data/projetos.json` no repositório.

### Hook local de git (pré-commit)

Para gerar e commitar o JSON automaticamente em cada commit local:

1. Configure os hooks uma vez:
   - `bash scripts/setup-git-hooks.sh`
2. A cada commit, o hook executa `node scripts/extract-projetos.js` e adiciona `data/projetos.json` ao commit.

### Geração manual (opcional)

- `node scripts/extract-projetos.js`
- Saída: `data/projetos.json`

### Consumo pelo n8n

- Faça um HTTP GET para o arquivo estático `data/projetos.json` hospedado no seu ambiente (por exemplo, via GitHub Pages/VPS/Nginx).

> Observação: Todas as referências a Docker foram removidas deste projeto. O deploy pode ser feito por qualquer servidor estático (GitHub Pages, Nginx, etc.).
