# Knowledge Dataset — notas de implementação

- O repositório não possui `package.json` raiz; por isso a validação usa apenas APIs nativas do Node.
- O schema JSON é documentação/contrato interoperável; o validador Node aplica invariantes adicionais de repositório.
- Referências de `sources` nesta v1 são caminhos locais públicos do repositório, o que permite validação de existência sem rede.
- `faq.html` não é usado como autoridade porque é derivado de `faq.json`.
- `minifaq.json` não é usado como autoridade porque é resumo derivado.
- Cópias no `novo-site` são consumidores sincronizados, não fontes autoritativas.
- Respostas `dynamic/hybrid` não contêm preço, prazo ou disponibilidade atuais como fatos estáticos.
- A existência de um intent seed demonstra o contrato; não significa cobertura total daquela categoria.
