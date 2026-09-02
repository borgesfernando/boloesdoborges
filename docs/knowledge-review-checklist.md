# Knowledge Dataset — checklist de revisão

Antes de aprovar mudança no dataset:

- [ ] a intent representa uma intenção, não apenas uma pergunta isolada;
- [ ] exemplos diferentes realmente pertencem à mesma intenção;
- [ ] a fonte indicada existe e é a autoridade correta;
- [ ] nenhum dado mutável foi copiado para resposta estática sem necessidade;
- [ ] `dynamic`/`hybrid` possui resolver e fonte operacional;
- [ ] temas sensíveis possuem guardrails suficientes;
- [ ] não há segredo, PIX, dado bancário ou identificador de participante;
- [ ] resposta não promete previsão, prêmio ou rentabilidade;
- [ ] resposta não cria vínculo inexistente com a Caixa;
- [ ] lacuna editorial foi corrigida na fonte apropriada, quando necessário;
- [ ] alteração incompatível considera versão do contrato;
- [ ] suíte `bash scripts/validate-knowledge-local.sh` passa;
- [ ] integração de produção, se houver no futuro, está em PR separada com fallback.
