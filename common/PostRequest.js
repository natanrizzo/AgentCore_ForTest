const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');
const yaml = require('js-yaml');
const { generateAudioFilename } = require('./FilenameHelper.js');
const {  runNetworkDiagnostics } = require('./NetworkDiagnostics.js');

/**
 * Função responsável por salvar a resposta da simulação de conversa em um arquivo YAML.
 *
 * @async
 * @param {{ response: any; context: any; }} param0 
 * @param {*} param0.response 
 * @param {*} param0.context 
 * @returns {*} 
 */
async function saveSimulateConversationResponse({ response, context }) {
  // Pega as variávies do contexto.
  const { endpoint, title, dict, JSON_OUT_DIR } = context.variables;
  // Passa o LLM opcional quando disponível para incluir no nome do arquivo
  const llm = context.variables.llm || null;

  // Gera o nome do arquivo base
  const filenameBase = generateAudioFilename(JSON_OUT_DIR, endpoint, title, 'none', dict, 'agent', llm);
  const outputDir = path.resolve(process.cwd(), JSON_OUT_DIR);
  fs.mkdirSync(outputDir, { recursive: true });

  // Calcula o tempo de resposta em ms.
  const startTime = context.variables.requestStartTime || Date.now();
  const endTime = Date.now();
  const ms = endTime - startTime;

  // Gera o timestamp
  const now = new Date();
  const datetimeStamp = now.toISOString();

  // Parseia o corpo da resposta para JSON
  const jsonObject = JSON.parse(response.rawBody);

  // Passa o host e realiza os diagnósticos de rede.
  const { pingResult, tracertResult } = runNetworkDiagnostics(context.variables.baseURL);

  // Prepara o objeto de metadados
  const responseMetadata = {
    server_ping: pingResult,
    server_tracert: tracertResult,
    ms: ms,
    datetime_stamp: datetimeStamp,
    generator_name: `${endpoint}-${title}`,
    response: jsonObject,
    request: context.variables.lastRequest || null
  };

  // Salva o arquivo yaml com o filename final
  const finalFilename = `${filenameBase}.yaml`;
  const finalOutputPath = path.join(outputDir, finalFilename);
  
  writeYAMLFile(finalOutputPath, responseMetadata);

  console.log(`[HTTPYac] Simulação salva: ${finalOutputPath}`);
}

/** 
 * Função responsável por salvar o áudio TTS recebido na resposta.
 * Definindo o nome apartir do filename helper e incluindo a duração do áudio no nome do arquivo.
 * 
 * @async
 * @param {{ response: any; context: any; }} param0 
 * @param {*} param0.response 
 * @param {*} param0.context 
 * @returns {*}
*/
async function saveAudioResponse({ response, context }) {
  // Pega as variávies do contexto.
  const {
    endpoint,
    title,
    dict,
    VOICE_ALIAS,
    loopControl,
    model,
    models,
    OUT_DIR,
    stability,
    similarity_boost,
    speed,
    style,
    input
  } = context.variables;

  // Validação: evita processar se o índice estiver fora do array
  if (!!loopControl && (loopControl.model_index >= models.length || loopControl.model_index < 0)) {
    console.log(`[HTTPYac] Índice ${loopControl.model_index} fora do range. Pulando processamento.`);
    return;
  }
  
  // Validação: verifica se há resposta válida
  if (!response || !response.rawBody) {
    console.log(`[HTTPYac] Resposta inválida ou vazia. Pulando processamento.`);
    return;
  }
  
  // Pega o model atual para o filename;
  const currentModel = model ?? models[loopControl.model_index];

  // Gera o nome do arquivo base
  const filenameBase = generateAudioFilename(OUT_DIR, endpoint, title, currentModel, dict, VOICE_ALIAS);
  const outputDir = path.resolve(process.cwd(), OUT_DIR);
  fs.mkdirSync(outputDir, { recursive: true });
  const tempFilename = `${filenameBase}_temp.mp3`;
  const tempOutputPath = path.join(outputDir, tempFilename);
  // Salva o áudio temporariamente
  fs.writeFileSync(tempOutputPath, response.rawBody);

  // Pega a duração do áudio através do music-metadata
  const audioMetadata = await mm.parseFile(tempOutputPath);
  const duration = audioMetadata.format.duration;
  const durationString = `${Math.round(duration)}s`;

  // Define o nome final do arquivo com a duração
  const finalFilename = `${filenameBase}D=${durationString}.mp3`;
  const finalOutputPath = path.join(outputDir, finalFilename);

  // Renomeia o arquivo temporário para o nome final com a duração.
  fs.renameSync(tempOutputPath, finalOutputPath);
  console.log(`[HTTPYac] Áudio salvo: ${finalOutputPath}`);

  // Calcula o tempo de resposta em ms.
  const startTime = context.variables.requestStartTime || Date.now();
  const endTime = Date.now();
  const ms = endTime - startTime;

  // Gera o timestamp
  const now = new Date();
  const datetimeStamp = now.toISOString();

  // Prepara o objeto de metadados
  const responseMetadata = {
    ms: ms,
    datetime_stamp: datetimeStamp,
    generator_name: `${endpoint}-${title}`,
    model: currentModel,
    voice: VOICE_ALIAS,
    duration_seconds: durationString,
    stability: stability,
    similarity_boost: similarity_boost,
    speed: speed,
    style: style,
    text: input
  };

    // Salva o arquivo yaml com o filename final
  const yamlFilename = `${filenameBase}.yaml`;
  const yamlOutputPath = path.join(outputDir, yamlFilename);

  writeYAMLFile(yamlOutputPath, responseMetadata);
}

/**
 * Função auxiliar para escrever um arquivo YAML.
 * 
 * @param {string} filepath 
 * @param {object} data 
 */
function writeYAMLFile(filepath, data) {
  try {
    // Converte para YAML
    const yamlDataContent = yaml.dump(data, { 
      indent: 2,
      lineWidth: -1,
      noRefs: true,
      sortKeys: false
    });
  
    fs.writeFileSync(filepath, yamlDataContent);
    console.log(`[HTTPYac] Metadados da resposta salva em: ${filepath}`);
  } catch (error) {
    console.error(`[HTTPYac] Erro ao salvar o arquivo YAML: ${error}`);
  }
}

module.exports = { saveSimulateConversationResponse, saveAudioResponse };


