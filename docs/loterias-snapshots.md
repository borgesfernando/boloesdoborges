# Snapshots públicos das loterias

O publicador consulta a CAIXA e mantém snapshots brutos compatíveis em `data/*-api.json`.

## Frescor e consumo

`data/loterias-health.json` é o contrato sanitizado de saúde. Ele contém `atualizadoEm` e, por modalidade, `dataApuracao`, `concurso` e `dataProximoConcurso`. Consumidores devem cruzá-lo com `data/calendario-caixa.json`.

O snapshot é continuidade, não fonte temporal isolada. Após o horário oficial, resultado anterior não pode ser exibido como atual. Em divergência, prevalece o calendário para data/hora e a resposta deve informar pendência da apuração.

## Atualização

- recuperação diária: 06h BRT;
- janela crítica: a cada 5 minutos, de 10 minutos antes até 1 hora pós-sorteio;
- janela crítica noturna: a cada 5 minutos de 20h50 a 22h00 BRT;
- janela crítica de domingo: a cada 5 minutos de 10h50 a 12h00 BRT.

Na janela crítica, o publicador lê `data/calendario-caixa.json` e consulta somente as modalidades que têm sorteio entre 10 minutos antes e 1 hora depois do horário oficial. Exceções do calendário (por exemplo, concursos especiais) substituem a grade semanal. A recuperação das 06h BRT consulta todas as modalidades.

O script mantém retries para a CAIXA e, quando o snapshot de uma modalidade já contém a apuração da data corrente, deixa de consultar essa modalidade até o próximo dia. O workflow só cria commit quando houver dado novo.