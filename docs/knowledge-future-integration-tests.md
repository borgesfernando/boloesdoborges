# Knowledge Dataset — gates para integrações futuras

Uma PR que conectar um consumidor deverá demonstrar, no mínimo:

- pergunta conhecida -> intent correta;
- pergunta ambígua -> fallback seguro;
- intent `canonical` -> guardrails respeitados;
- intent `dynamic` -> consulta ao resolver antes da resposta;
- resolver indisponível -> nenhuma afirmação favorável por padrão;
- intent `hybrid` -> conteúdo estável não sobrescreve estado atual;
- intent `human` -> escalonamento sem inventar o dado solicitado;
- nenhuma exposição de dados privados em logs;
- fallback para o comportamento anterior durante rollout;
- desligamento simples da integração sem alterar as fontes canônicas.
