# Site Projection v1 — atualizações factuais dos projetos

Este repositório consome um artefato público chamado `data/site-projection.json`, usado pelo painel **Agora na comunidade** para mostrar projetos em andamento e atualizações confirmadas.

## Contrato

O artefato usa:

```json
{
  "schemaVersion": 1,
  "projectionVersion": "site-projection.v1",
  "projectedThrough": "<data/hora ou null>",
  "current": {},
  "updates": []
}
```

- `current` contém o estado factual mais recente de cada projeto projetado;
- `updates` contém o histórico factual público;
- apenas informações públicas permitidas fazem parte desse arquivo.

## Painel Agora na comunidade

Para esse painel, `site-projection.v1` é a fonte factual utilizada pelo renderer.

Projetos com status `OPEN` ou `ACTIVE` aparecem como ativos. Projetos com status `CLOSED` deixam o bloco ativo, mas seus fatos podem permanecer no histórico de atualizações.

Calendário futuro e informações de próximos projetos não criam uma abertura por conta própria.

## Matriz de apresentação

O painel apresenta a etapa atual assim:

| Situação | Fato recebido | Apresentação |
| --- | --- | --- |
| Aberto | projeto ativo sem etapa finalizante | **Em execução** |
| Reta final | `stage=ALERTA_FINAL` | **Reta final** |
| Última chamada | `stage=ULTIMA_CHAMADA` | **Última chamada** |
| Encerrado | `status=CLOSED` / encerramento factual | sai do bloco de projetos ativos |

A sequência mínima é:

```text
Em execução -> Reta final -> Encerrado
```

Quando o próprio projeto publica uma etapa real de última chamada:

```text
Em execução -> Reta final -> Última chamada -> Encerrado
```

A etapa **Última chamada é condicional**. O site não cria ou deduz essa etapa quando ela não foi publicada pelo projeto.

Atualizações intermediárias, como lembretes, podem aparecer no histórico sem alterar o destaque principal do card.

## Atualização do artefato

O arquivo é recebido por um fluxo automatizado de sincronização e só deve ser alterado por esse processo. O receiver valida versão, formato e conteúdo antes de aceitar uma atualização.

A leitura no navegador usa `cache: no-store` para evitar depender de uma cópia antiga do artefato durante a navegação.

## Privacidade e segurança

`site-projection.json` é deliberadamente público. Ele não deve conter:

- credenciais ou tokens;
- dados pessoais;
- dados bancários ou PIX;
- conteúdo de planilhas privadas;
- URLs administrativas;
- logs, stacks ou detalhes internos de infraestrutura.

Se o artefato estiver ausente ou inválido, o painel deve falhar de forma segura, sem inventar estado de projeto.

## Compatibilidade

A matriz de apresentação é derivada de campos já existentes no contrato e não cria uma nova versão da Site Projection.

Mudanças futuras no schema público devem ser versionadas explicitamente e manter validação compatível nos consumidores.
