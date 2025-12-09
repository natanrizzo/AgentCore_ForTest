# YAML→HTTP runners (ElevenLabs)

**Objetivo**: Ler variáveis de _front‑matter YAML_ (`.md`) ou de `config.yaml`,
fazer requests ElevenLabs e salvar **JSON** e **MP3**.

## Pré‑requisitos

- Node.js ≥ 18
- Uma chave ElevenLabs (`ELEVEN_API_KEY`)
- Um `AGENT_ID` válido para testes de _simulate-conversation_

## Instalação

```bash
cd elevenlabs-yaml-http-runners
cp .env.example .env   # edite sua chave e AGENT_ID
npm i
```

## Executar

Simular conversa a partir do `prompts/input.md`:

```bash
npm run simulate:md
# Saídas: out/conversation.json e out/conversation.mp3
```

Gerar diálogo (Text‑to‑Dialogue) a partir do `config.yaml`:

```bash
npm run dialogue:yaml
# Saída: out/dialogue.mp3
```

## httpyac (opcional)

Arquivo: `http/elevenlabs.http`.
Requer `httpyac` instalado globalmente.

```bash
npx httpyac http/elevenlabs.http -e default
```

> Aviso: esquemas de payload podem evoluir. Estes runners
> enviam o corpo **como está** do YAML/front‑matter. Ajuste as
> chaves conforme a documentação oficial.

## Novos comandos com HTTPYAC.

- Simulação.

```bash
npx httpyac send http/simulate.http --all
```

- Text-to-Speech (TTS)

```bash
npx httpyac send http/tts.http --all
```
