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

## 🚀 Deploy em Container (VPS)

Esta aplicação é estática (HTML/CSS/JS). O deploy recomendado é via Nginx em container.

### Opção A: Docker Compose (porta 8080)

1. Build e subida:
   - `docker compose up -d --build`
2. Acesse: `http://SEU_IP:8080`

Arquivos relevantes:
- `Dockerfile` – imagem baseada em `nginx:alpine`, copia o site para `/usr/share/nginx/html`.
- `nginx.conf` – cache para assets, gzip e cabeçalhos básicos de segurança.
- `docker-compose.yml` – expõe `8080->80`, com healthcheck.

### Opção B: Integrar com Traefik/Proxy reverso (HTTPS)

1. Descomente e ajuste as labels no `docker-compose.yml` com seu domínio.
2. Garanta que seu proxy (Traefik/Caddy/Nginx) aponte para a porta interna `80` do serviço.

### Atualizações de versão

- `docker compose pull && docker compose up -d --build` para reconstruir com mudanças.

### Checklist pós-deploy

- [ ] Abrir `index.html` e navegar até `faq.html` e `templates/*` para validar links.
- [ ] Conferir cache de assets (CSS/JS) e headers no navegador (devtools > Network).
- [ ] Se usar HTTPS atrás de proxy, habilitar HTTP/2 no proxy e compressão lá.
