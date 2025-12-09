# AgentCore - Agente de Atendimento com IA

Um framework para automação e orquestração de agentes de voz inteligentes, integrado com a API da ElevenLabs para síntese de voz (Text-to-Speech).

##  sobre o projeto

O **AgentCore** é uma plataforma projetada para construir, testar e gerenciar agentes de atendimento virtual. O objetivo principal é facilitar a criação de fluxos de conversação naturais e a geração de áudios dinâmicos para cenários de call center, utilizando `httpyac` para simular requisições e validar scripts de diálogo.

Este projeto serve como uma base robusta para o desenvolvimento de soluções de IA de voz, focando na manutenibilidade e escalabilidade.

## Primeiros Passos

Para configurar o ambiente de desenvolvimento localmente, siga os passos abaixo.

### Pré-requisitos

- **Node.js**: Certifique-se de ter o Node.js instalado (versão 18 ou superior).
- **Chave de API da ElevenLabs**: Você precisará de uma chave de API da [ElevenLabs](https://elevenlabs.io/).

### Instalação

1.  **Clone o repositório:**
    ```sh
    git clone https://github.com/natanrizzo/AgentCore_ForTest.git
    cd AgentCore_ForTest
    ```

2.  **Instale as dependências:**
    ```sh
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    - Renomeie o arquivo `.env.example` para `.env`.
    - Abra o arquivo `.env` e substitua o valor da variável `ELEVENLABS_API_KEY` pela sua chave de API.
    ```env
    ELEVENLABS_API_KEY="sua_chave_de_api_aqui"
    ```

## Uso

Os scripts principais podem ser executados através do NPM para automatizar a geração de áudios TTS.

-   **Listar todos os scripts de áudio disponíveis:**
    ```sh
    npm run tts:list
    ```

-   **Gerar um áudio específico (modo interativo):**
    ```sh
    npm run tts:generate
    ```

-   **Gerar todos os áudios a partir dos arquivos `.http`:**
    ```sh
    npm run tts:generate:all
    ```

## Estrutura do Projeto

A organização do repositório foi pensada para separar as responsabilidades e facilitar a manutenção:

```
├── common/             # Módulos e utilitários compartilhados
├── docs/               # Documentação detalhada do projeto
├── httpyac/            # Scripts para testes e geração de áudio
│   ├── simulation/     # Simulações de fluxos de chamada
│   └── tts-audios/     # Requisições TTS por categoria
├── CTX-PROMPTS/        # Prompts e contextos para a IA
├── .env.example        # Arquivo de exemplo para variáveis de ambiente
├── config.js           # Configurações centrais da aplicação
└── package.json        # Dependências e scripts do projeto
```

## Documentação

Para uma visão mais aprofundada da arquitetura, componentes e convenções do projeto, consulte os seguintes documentos:

-   **[Documentação da Arquitetura](./docs/architecture.md)**
-   **[Referências e Links Úteis](./docs/references.md)**

## Contribuição

As contribuições são bem-vindas! Para saber como participar do desenvolvimento do AgentCore, por favor, leia nosso **[Guia de Contribuição](./CONTRIBUTING.md)**.

## Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.
