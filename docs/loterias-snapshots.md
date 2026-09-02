# Snapshots públicos das loterias

O publicador consulta a CAIXA e mantém snapshots brutos compatíveis em `data/*-api.json`.

## Frescor e consumo

`data/loterias-health.json` é o contrato sanitizado de saúde. Ele contém `atualizadoEm` e, por modalidade, `dataApuracao`, `concurso` e `dataProximoConcurso`. Consumidores devem cruzá-lo com `data/calendario-caixa.json`.

O snapshot é continuidade, não fonte temporal isolada. Após o horário oficial, resultado anterior não pode ser exibido como atual. Em divergência, prevalece o calendário para data/hora e a resposta deve informar pendência da apuração.

## Atualização

- rotina: uma vez por hora, entre 06h e 20h BRT;
- janela crítica noturna: a cada 5 minutos de 20h50 a 23h30 BRT;
- janela crítica de domingo: a cada 5 minutos de 10h50 a 12h30 BRT.

O script mantém retries para a CAIXA e o workflow só cria commit quando houver dado novo.