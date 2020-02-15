# csv-api

## Detalhes
- Upload de dados de arquivo CSV para banco de dados MySql
- Cria novo usuário e código a partir do nome do arquivo
- Lista todos os clientes pelo código do usuário
- Valida CEP utilizando API de busca pelo Correios
- Deleta usuário pelo código
- Quando um usuário é deletado, todos os clientes relacionados a ele também são deletados

## Instalação

1. Baixar o repositório para a máquina local
2. Digitar `npm install` para instalar as dependências do projeto
3. Rodar o script db.sql no MySql
4. Digitar `nodemon server` para iniciar o servidor

## Testes (Postman)
- Remover o `Content-type` do `Header` da requisição
- Na aba `Body`, escolher `form-data`
- No campo `Key`, ecsolher  o tipo `File` e selecionar o arquivo no campo `Value`
- Há 2 arquivos csv na pasta `tmp/csv` para utilizar nos testes
- A configuração de acesso ao banco de dados encontra-se em app/database/mysqlConnector.js

## Desenvolvimento
- Sistema operacional: Windows
- Editor: Visual Studio Code
- Testes: Postman

## Bibliotecas
- Axios
- Body-parser
- cep-promise
- csv-parse
- express
- fast-csv
- lodash
- moment
- multer
- mysql
- mysql2
- reqwest
- sequelize
- winston
- xhr2
- yup
- nodemon

## Documentação


