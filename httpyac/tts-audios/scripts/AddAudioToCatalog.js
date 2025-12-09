const fs = require('fs');
const path = require('path');
const inquirer = require('inquirer').default || require('inquirer');

/** Categorias Válidas de um TTS */
const VALID_CATEGORIES = [
  'greeting',
  'objection',
  'followup',
  'closing',
  'qualification',
  'scheduling',
  'system_environment',
];

/** Modelos disponíveis pelo ElevenLabs */
const AVAILABLE_MODELS = [
  'eleven_v3',
  'eleven_flash_v2_5',
  'eleven_turbo_v2_5',
];

/**
 * Converte título para ID válido (lowercase, underscores)
 * @param {string} text - Texto a converter
 * @returns {string} ID normalizado
 */
function normalizeToId(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_') // Espaços para underscore
    .replace(/[^a-z0-9_]/g, '') // Remove caracteres inválidos
    .replace(/_+/g, '_') // Remove underscores duplicados
    .replace(/^_|_$/g, ''); // Remove underscores nas extremidades
}

/**
 * Função de validação do título
 * @param {string} text - Texto a validar
 * @returns {boolean|string} true se válido, mensagem de erro caso contrário
 */
function validateTitle(text) {
  if (!text || !text.trim()) return 'Título não pode estar vazio';
  if (text.length < 3) return 'Título deve ter pelo menos 3 caracteres';
  return true;
}

/**
 * Função de validação dos parâmetros de Voz
 * @param {string} value - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @param {string} paramName - Nome do parâmetro
 * @returns {boolean|string} true se válido, mensagem de erro caso contrário
 */
function validateVoiceParameter(value, min, max, paramName) {
  const num = parseFloat(value);

  if (isNaN(num)) {
    return `${paramName} deve ser um número`;
  }

  if (num < min || num > max) {
    return `${paramName} deve estar entre ${min} e ${max}`;
  }

  return true;
}

/**
 * Função principal para adicionar o áudio ao audio-catalog.json
 */
async function addAudioToCatalog() {
  try {
    console.log(`
╔════════════════════════════════════════╗
║  📝 Adicionar Novo Áudio ao Catálogo  ║
╚════════════════════════════════════════╝
`);

    // ===== PASSO 1: Categoria =====
    console.log('✏️  PASSO 1: Selecionar Categoria\n');

    const { category } = await inquirer.prompt([
      {
        type: 'select',
        name: 'category',
        message: 'Selecione a categoria:',
        choices: VALID_CATEGORIES,
      },
    ]);

    console.log(`✅ Categoria selecionada: ${category}\n`);

    // ===== PASSO 2: Título (usado para gerar ID) =====
    console.log('✏️  PASSO 2: Título\n');
    console.log('💡 Dica: O título será usado para gerar o ID automaticamente\n');

    const { title } = await inquirer.prompt([
      {
        type: 'input',
        name: 'title',
        message: 'Título do áudio (ex: iOS Screening Response):',
        validate: validateTitle,
        filter: (val) => val.trim(),
      },
    ]);

    // ===== GERAR ID AUTOMATICAMENTE =====
    const audioId = `${category}_${normalizeToId(title)}`;
    console.log(`\n🆔 ID gerado automaticamente: ${audioId}\n`);

    // Verificar se ID já existe no catálogo
    const projectRoot = path.resolve(__dirname, '../../..');
    const catalogPath = path.join(
      projectRoot,
      'httpyac/tts-audios/config/audio-catalog.json'
    );

    let catalog;
    try {
      const content = fs.readFileSync(catalogPath, 'utf8');
      catalog = JSON.parse(content);
    } catch (error) {
      throw new Error(`Não foi possível ler o catálogo: ${error.message}`);
    }

    if (catalog.audios[audioId]) {
      console.error(
        `\n❌ Áudio com ID "${audioId}" já existe no catálogo!\n`
      );
      console.log(
        'Sugestões:\n' +
        '  • Escolha um título diferente\n' +
        '  • Ou selecione uma categoria diferente\n'
      );
      process.exit(1);
    }

    // ===== PASSO 3: Texto do Áudio =====
    console.log('✏️  PASSO 3: Texto do Áudio\n');

    const { input } = await inquirer.prompt([
      {
        type: 'input',
        name: 'input',
        message: 'Texto a ser sintetizado (o que será convertido em áudio):',
        validate: (val) =>
          val.trim() ? true : 'Texto não pode estar vazio',
        filter: (val) => val.trim(),
      },
    ]);

    // ===== PASSO 4: Configuração de Voz =====
    console.log('\n✏️  PASSO 4: Configuração de Voz\n');

    const voiceAnswers = await inquirer.prompt([
      {
        type: 'input',
        name: 'voiceAlias',
        message: 'Alias da voz (ex: FF03, FF04, FF05):',
        default: 'FF03',
        filter: (val) => val.trim(),
        validate: (val) =>
          val.trim() ? true : 'Alias da voz não pode estar vazio',
      },
      {
        type: 'input',
        name: 'stability',
        message: 'Estabilidade (0.0-1.0) [padrão: 0.5]:',
        default: '0.5',
        validate: (val) =>
          validateVoiceParameter(val || '0.5', 0, 1, 'Estabilidade'),
        filter: (val) => parseFloat(val || '0.5'),
      },
      {
        type: 'input',
        name: 'similarity_boost',
        message: 'Similarity Boost (0.0-1.0) [padrão: 0.75]:',
        default: '0.75',
        validate: (val) =>
          validateVoiceParameter(
            val || '0.75',
            0,
            1,
            'Similarity Boost'
          ),
        filter: (val) => parseFloat(val || '0.75'),
      },
      {
        type: 'input',
        name: 'speed',
        message: 'Velocidade (0.5-2.0) [padrão: 1.0]:',
        default: '1.0',
        validate: (val) =>
          validateVoiceParameter(val || '1.0', 0.5, 2.0, 'Velocidade'),
        filter: (val) => parseFloat(val || '1.0'),
      },
      {
        type: 'input',
        name: 'style',
        message: 'Estilo (0.0-1.0) [padrão: 0.0]:',
        default: '0.0',
        validate: (val) =>
          validateVoiceParameter(val || '0.0', 0, 1, 'Estilo'),
        filter: (val) => parseFloat(val || '0.0'),
      },
    ]);

    const {
      voiceAlias,
      stability,
      similarity_boost,
      speed,
      style,
    } = voiceAnswers;

    // ===== PASSO 5: Modelos =====
    console.log('\n✏️  PASSO 5: Modelos de TTS\n');

    const { models } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'models',
        message:
          'Selecione modelos (espaço para marcar, enter para confirmar) [padrão: todos]:',
        choices: AVAILABLE_MODELS,
        default: AVAILABLE_MODELS,
        validate: (values) =>
          values.length > 0
            ? true
            : 'Selecione pelo menos um modelo',
      },
    ]);

    // ===== PASSO 6: Variáveis =====
    console.log('\n✏️  PASSO 6: Variáveis (Opcional)\n');
    console.log(
      'Variáveis são placeholders no texto: {{vendor}}, {{lead}}, etc.\n'
    );

    const variables = {};
    const { addVars } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'addVars',
        message: 'Deseja adicionar variáveis?',
        default: false,
      },
    ]);

    if (addVars) {
      let continueAdding = true;
      let varCount = 0;

      while (continueAdding) {
        const { varName } = await inquirer.prompt([
          {
            type: 'input',
            name: 'varName',
            message: `Variável ${varCount + 1} - Nome (ou deixar vazio para terminar):`,
            filter: (val) => val.trim(),
          },
        ]);

        if (!varName) {
          continueAdding = false;
          break;
        }

        if (!/^[a-z_]+$/.test(varName)) {
          console.error(
            '❌ Nome deve conter apenas letras minúsculas e underscore\n'
          );
          continue;
        }

        const { varValue } = await inquirer.prompt([
          {
            type: 'input',
            name: 'varValue',
            message: `Variável "${varName}" - Valor:`,
            validate: (val) =>
              val.trim() ? true : 'Valor não pode estar vazio',
            filter: (val) => val.trim(),
          },
        ]);

        variables[varName] = varValue;
        varCount++;
        console.log(`✅ Variável "${varName}" adicionada\n`);
      }
    }

    // ===== PASSO 7: Revisão e Confirmação =====
    console.log('\n✏️  PASSO 7: Revisão Final\n');
    console.log('═══════════════════════════════════════════════');
    console.log(`🆔 ID do Áudio:    ${audioId}`);
    console.log(`📁 Categoria:      ${category}`);
    console.log(`📝 Título:         ${title}`);
    console.log(
      `🔊 Texto:          "${input.substring(0, 55)}${
        input.length > 55 ? '...' : ''
      }"`
    );
    console.log(`🎙️  Voz (alias):    ${voiceAlias}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Parâmetros de Voz:`);
    console.log(`  • Estabilidade:    ${stability}`);
    console.log(`  • Similarity:      ${similarity_boost}`);
    console.log(`  • Velocidade:      ${speed}`);
    console.log(`  • Estilo:          ${style}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`Modelos:           ${models.join(', ')}`);
    console.log(
      `Variáveis:         ${
        Object.keys(variables).length > 0
          ? Object.keys(variables).join(', ')
          : 'Nenhuma'
      }`
    );
    console.log('═══════════════════════════════════════════════\n');

    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Deseja adicionar este áudio ao catálogo?',
        default: true,
      },
    ]);

    if (!confirm) {
      console.log('\n❌ Operação cancelada\n');
      return;
    }

    // ===== ETAPA 8: Salvar no Catálogo =====
    const newAudio = {
      category,
      title,
      input,
      voice: {
        alias: voiceAlias,
        stability,
        similarity_boost,
        speed,
        style,
      },
      models,
      variables,
    };

    catalog.audios[audioId] = newAudio;
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 4), 'utf8');

    console.log(`\n✅ Áudio "${audioId}" adicionado com sucesso!\n`);

    // ===== PASSO 9: Próximos Passos =====
    console.log('📋 Próximos passos:\n');
    console.log(`1️⃣  Gerar arquivo .http:`);
    console.log(`   npm run tts:generate ${audioId}\n`);
    console.log(`2️⃣  Ou regenerar todos os arquivos:`);
    console.log(`   npm run tts:generate:all\n`);
    console.log(`3️⃣  Testar no httpyac:`);
    console.log(
      `   httpyac ./httpyac/tts-audios/${category}/tts-${audioId}.http\n`
    );
  } catch (error) {
    console.error(`\n❌ Erro: ${error.message}\n`);
    process.exit(1);
  }
}

if (require.main === module) {
  addAudioToCatalog();
}

module.exports = addAudioToCatalog;