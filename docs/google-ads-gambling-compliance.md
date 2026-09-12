# Google Ads Gambling Compliance — repositório legado

## Decisão arquitetural

`borgesfernando.github.io/boloesdoborges` é arquivo público e superfície de dados/documentação. **Não é domínio de certificação nem final URL de Google Ads.**

Domínio comercial canônico:

`https://site.boloesdoborges.shop`

## Por quê

A política de certificação Google Gambling exige domínio controlado diretamente pelo anunciante e torna inelegíveis sites hospedados em subdomínios gratuitos de terceiros. Por isso, tentar tornar o GitHub Pages uma segunda landing de mídia criaria duplicidade e risco desnecessário.

## Matriz das páginas publicadas

| Superfície | Classificação | Tratamento |
| --- | --- | --- |
| `index.html` | comercial legado | arquivo; direcionar jornada vigente para `/comunidade` no domínio canônico |
| `acumulados.html` | comercial legado | arquivo; não usar como final URL |
| `especiais.html` | comercial legado | arquivo; não usar como final URL |
| `mensais.html` | comercial legado | arquivo; não usar como final URL |
| `projetos-abertos.html` | comercial legado | arquivo; estado vigente deve vir do site/fonte canônica |
| `linhas-de-projetos.html` | catálogo legado | arquivo; versão vigente no site canônico |
| `boloes/acumulados/*.html` | projeto legado | arquivo; sem mídia paga |
| `boloes/especiais/*.html` | projeto legado | arquivo; sem mídia paga |
| `boloes/mensais/*.html` | projeto legado | arquivo; sem mídia paga |
| `estrategias.html` | metodologia | arquivo; sem mídia paga |
| `estrategias/*.html` | metodologia | arquivo; sem mídia paga |
| `ia.html` | metodologia/IA | arquivo; não usar como landing |
| `faq.html` | suporte legado | arquivo; FAQ vigente no domínio canônico |
| `prest.html` | transparência | arquivo; versão vigente em `/prestacao-de-contas` |
| `institucional/sobre.html` | institucional | arquivo; equivalente `/sobre` |
| `institucional/termos.html` | legal/comercial | arquivo; equivalente `/termos` |
| `institucional/privacidade.html` | privacidade | arquivo; equivalente `/privacidade` |
| `institucional/contato.html` | contato | arquivo; equivalente `/contato` |
| `atualizacoes.html` | histórico | arquivo |
| `sitemap.html` | navegação | arquivo |
| `jogo-responsavel.html` | espelho informativo | `noindex,follow`; canonical `/jogo-responsavel` |

## Regras para manutenção

- novos CTAs comerciais devem apontar para o domínio canônico;
- não criar campanha com `borgesfernando.github.io` como URL final;
- para páginas com equivalente inequívoco, migrar gradualmente para `noindex,follow` + canonical correspondente;
- não apontar canonical genérico para uma página diferente apenas para “padronizar” domínio;
- não esconder conteúdo de jogo ou participação para tentar evitar a classificação de Gambling;
- manter 18+, ausência de garantia de prêmio e ausência de vínculo/chancela CAIXA em superfícies institucionais relevantes.

## Gate

Alterações neste repositório reduzem ambiguidade de domínio, mas **não tornam a operação elegível para Google Ads**. O Gate permanece dependente de enquadramento regulatório, documentação/licença/autorização aplicável e certificação Google Gambling no domínio comercial.
