# Em conjunto

App web privado para finanças do casal, em português e BRL. Node.js 24+, sem dependências externas.

## Executar

```sh
npm test
npm start
```

O servidor escuta em 127.0.0.1:3000. HOST e PORT permitem configurar o endereço. Não exponha à internet: esta versão inicial não tem autenticação. Dados persistem em `data/gestao.sqlite` (SQLite). Faça backup desse arquivo com o servidor parado. DB_PATH permite selecionar outro banco.

Despesas, receitas, aportes e resgates podem ser atribuídos a Eu, Esposa ou Compartilhado. O filtro seleciona mês e responsável. Saldo de caixa = receitas − despesas − aportes + resgates. Aportes líquidos do mês = aportes − resgates; não representa patrimônio, cotação ou valorização dos ativos.

## Importação

CSV UTF-8 com cabeçalho `data,descricao,valor,tipo`. Aceita separador vírgula ou ponto e vírgula, campos entre aspas, data AAAA-MM-DD ou DD/MM/AAAA, valores decimais brasileiros. Tipo opcional: despesa, receita, aporte ou resgate. Sem tipo, valor negativo indica despesa e positivo receita.

OFX lê transações STMTTRN, DTPOSTED, TRNAMT e MEMO/NAME. A compatibilidade precisa ser validada com extratos reais de cada banco; não há conectores específicos. PDFs e XLSX não são suportados. Selecione responsável, banco e categoria no formulário antes de escolher o arquivo. Revise a prévia antes de confirmar. Possíveis duplicatas (mesma data, descrição, valor, tipo, banco e responsável) são ignoradas. Lançamentos legítimos idênticos exigem inclusão manual. Limite de 2 MB e 5000 registros.

Itaú, Nubank e Banco do Brasil estão disponíveis como instituições. Não há conexão bancária automática, Open Finance ou MCP nesta versão. Não armazene senhas bancárias aqui. Login individual, patrimônio com preços de mercado e integrações são evoluções futuras.

Exportação CSV respeita os filtros atuais. Importação usa a atribuição selecionada no formulário; colunas extras de responsável/banco/categoria não são restauradas automaticamente.
