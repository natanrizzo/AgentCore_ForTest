# Guia de uso do TTS CLI.

# Comandos:

## Adicionar um novo audio ao catálogo.

```batch
    npm run tts:add
```

Comando passa por várias etapas para a criação, como definição de model, título, variáveis etc..

## Ver todos os áudios disponíveis

```batch
    npm run tts:list
```

## Gerar um arquivo específico

```batch
npm run tts:generate greeting_ios_screening_response
```

## Regenerar TODOS os arquivos após alterar o catálogo

```batch
npm run tts:generate:all
```

## Executar uma requisição via HTTPYac.

```batch
npx httpyac send "caminho_do_arquivo.http" |--all|
```
