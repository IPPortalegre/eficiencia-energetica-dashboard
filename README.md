# Dashboard de Eficiência Energética - Campus IPP

![image](https://github.com/user-attachments/assets/43cd4752-0df4-44f4-82c7-6a1e91087b3e)



Um dashboard para a monitorização de métricas de eficiência energética do IPP (Instituto Politécnico de Portalegre), apresentando dados em tempo real provenientes da plataforma IoT ThingsBoard.


## Funcionalidades

- Métricas em tempo real de consumo e produção de energia
- Monitorização e visualização de emissões de CO2
- Distribuição das fontes de energia (solar e elétrica)
- Dados ambientais (temperatura, humidade)
- Gráficos interativos


## Stack utilizada
- **Frontend**: 
  - HTML5, CSS3, JavaScript
  - Chart.js para visualização de dados
  - Bootstrap para layout responsivo
- **Backend**:
  - Node.js
  - Integração com API do ThingsBoard
- **Implementação**:
  - Containerização com Docker
 

## Atualizações

Nas últimas atualizações do dashboard duas variáveis de ambiente foram transformadas em query strings que devem ser inseridas na url da seguinte forma:

- `https://seu-site/?assetid=asset_id_aqui&title=titulo_do_local_aqui`.

## Variáveis de Ambiente

Para rodar este projeto, vais precisar adicionar as seguintes variáveis de ambiente ao teu ficheiro .env (lembre-se de alterar o ficheiro .env-example para .env ou crie um novo ficheiro com nome de .env)

- `THINGSBOARD_URL`= https://o-teu-url-do-thingsboard

- `THINGSBOARD_USERNAME`= seu_utilizador

- `THINGSBOARD_PASSWORD`= sua_palavra_passe

- `THINGSBOARD_ASSETID`= seu_id_de_asset (não utilizado mais)

- `PORT`= 3000

- `CACHE_TTL`= 300

- `TITLE_IPP` = nome_do_local (não utilizado mais)


## Pré-requisitos
- Node.js (versão 14 ou superior)
- Git
- Docker (opcional)
- Conta ThingsBoard com acesso à API

## Instalação

Para a instalação do projeto podes seguir uma das seguintes opções apresentadas.

### Rodar localmente

Clone o repositório

```bash
  git clone https://github.com/blackeyes1222006/node-app.git
```

Entre no diretório do projeto

```bash
  cd node-app
```

Instale as dependências

```bash
  npm install
```

Inicie o servidor

```bash
  npm start
```

Aceda à página em
```bash
  http://localhost:3000
```


### Rodar com o docker (Recomendado)

Clone o repositório

```bash
  git clone https://github.com/blackeyes1222006/node-app.git
```

Entre no diretório do projeto

```bash
  cd node-app
```

Construa a imagem docker
```bash
  docker-compose build
```

Execute o container
```bash
  docker-compose up
```

Aceda à página em
```bash
  http://localhost:3000
```
## Atualizar repositório

Quando o utilizador quiser atualizar os ficheiros do repositório basta rodar os seguintes comandos (faça isso dentro do ficheiro main, que é o node-app através de um terminal)
```bash
  git pull
```
Em caso de erros
```bash
  git stash
  git pull
  git stash pop
```

## Configuração

O dashboard pode ser configurado editando os seguintes ficheiros:
- Estrutura principal e estilo da página
```
public/index.html 
```
- Chamadas à API no frontend
```
public/api.js 
```
- Servidor backend e endpoints da API
```
server.js 
```
- Variáveis de ambiente para ligação ao ThingsBoard
```
.env 
```

## Endpoints da API
- **GET /api/getdata** : Obtém dados de telemetria do ThingsBoard

- **GET /api/gethistory** : Obtém os dados históricos que são usados nos gráficos

- **GET /** : É usado pela página principal do dashboard

### Licença

Este projeto está licenciado sob a Licença MIT - consulte o ficheiro LICENSE para mais informações.
