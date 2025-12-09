const fs = require("fs");
const path = require("path");

/**
 * Factory para criação de requisições de Text-to-Speech (TTS).
 * Responsável por gerar requisições TTS com base em diferentes parâmetros e configurações.
 * 
 * @class TTSRequestFactory
 */
class TTSRequestFactory {
    constructor(catalogPath, configPath) {
        this.catalogPath = catalogPath;
        this.catalog = this.loadCatalog();
        this.config = this.loadConfig(configPath);
    }

    /**
     * Carrega o catálogo com validação.
     * 
     * @returns {object} Catálogo de áudios
     */
    loadCatalog() {
        try {
            const content = fs.readFileSync(this.catalogPath, 'utf-8');
            return JSON.parse(content);
        } catch (error) {
            throw new Error(`Erro ao carregar catálogo: ${error.message}`);
        }
    }

    /**
     * Carrega a configuração do projeto.
     * 
     * @param {string} configPath - Caminho para config.js
     * @returns {object} Configuração
     */
    loadConfig(configPath) {
        try {
            // Resolve para a raiz do projeto (3 níveis acima do script)
            const rootDir = path.resolve(__dirname, '../../..');
            const absolutePath = path.join(rootDir, configPath);
            
            console.log(`📂 Tentando carregar config de: ${absolutePath}`);
            return require(absolutePath).config;
        } catch (error) {
            console.warn(`⚠️  Erro ao carregar config.js: ${error.message}`);
            console.warn('Usando configuração padrão...\n');
            return this.getDefaultConfig();
        }
    }

    /**
     * Retorna configuração padrão caso config.js não exista.
     * 
     * @returns {object} Configuração padrão
     */
    getDefaultConfig() {
        return {
            elevenlabs: {
                api_key: process.env.ELEVEN_API_KEY || '',
                base_url: 'https://api.elevenlabs.io',
                voice: { id: 'default' }
            },
            audio: {
                output_path: './httpyac/tts-audios/out'
            }
        };
    }

    /**
     * Processa template do .http com base no áudio do catálogo.
     * 
     * @param {string} audioId 
     * @param {object} audio 
     */
    generateTemplate(audioId, audio) {
        /**
         * Gera a seção de variáveis do template.
         * Ex.: @vendor = "Alexandre Lucas"
         */
        const variablesSection = Object.entries(audio.variables)
            .map(([key, value]) => `@${key} = ${value}`)
            .join('\n');
        
        const modelsArray = JSON.stringify(audio.models);

        return `# @import ../TPL_tts_base.http
# Auto-generated: ${new Date().toISOString()}
# Audio ID: ${audioId}

# Variáveis do Prompt do Agente.
{{
    const trainingData = {
        "1": "${audio.input.replace(/"/g, '\\"')}"
    };

    const input = trainingData["1"];
    const config = require("../../../config.js").config;
    config.elevenlabs.voice.name = "${audio.voice.alias}";

    exports.voice = config.elevenlabs.voice;
    exports.models = ${modelsArray};
    exports.input = input;
    exports.config = config;
}}

${variablesSection}

# Configuração do Arquivo e Requisição
@endpoint = tts
@title = ${audio.title}
@dict = alias

# Variáveis do Sistema
@OUT_DIR = ./httpyac/tts-audios/${audio.category}/out
@ELEVEN_API_KEY = {{config.elevenlabs.api_key}}
@VOICE_ALIAS = {{voice.name}}
@VOICE_ID = {{voice.id}}
@baseURL = {{config.elevenlabs.base_url}}

# Configuração da Voz
@stability = {{${audio.voice.stability}}}
@similarity_boost = {{${audio.voice.similarity_boost}}}
@speed = {{${audio.voice.speed}}}
@style = {{${audio.voice.style}}}

###
# @ref generateAudio
`;
    }

    /**
     * Gera um arquivo .http individual utilizando audioId.
     * 
     * @param {string} audioId 
     * @param {string} outputDir
     */
    generateHttpFile(audioId, outputDir) {
        /** Audio obtido a partir do catálogo. */
        const audio = this.catalog.audios[audioId];
        
        if (!audio) {
            throw new Error(`Áudio "${audioId}" não encontrado`);
        }

        // Gera o template do arquivo .http
        const template = this.generateTemplate(audioId, audio);
        const categoryDir = path.join(outputDir, audio.category);
        const filePath = path.join(categoryDir, `tts-${audioId}.http`);

        // Cria o diretório de categoria, se não existir
        fs.mkdirSync(categoryDir, { recursive: true });
        // Salva o arquivo .http
        fs.writeFileSync(filePath, template, 'utf-8');

        console.log(`Arquivo gerado: ${filePath}`);
        return filePath;
    }

    /**
     * Gera TODOS os arquivos .http do catáligo.
     */
    generateAllHttpFiles(outputDir) {
        console.log("\n🔄 Gerando arquivos TTS...\n");

        // Pega os IDs de todos os áudios no catálogo
        const audioIds = Object.keys(this.catalog.audios);
        let successCount = 0;
        let errorCount = 0;

        // Itera sobre cada áudio e gera o arquivo .http correspondente
        audioIds.forEach(audioId => {
            try {
                this.generateHttpFile(audioId, outputDir);
                successCount++;
            } catch (error) {
                console.error(`❌ Erro ao gerar áudio "${audioId}": ${error.message}`);
                errorCount++;
            }
        });

        console.log(`\n📊 Resumo: ${successCount} sucesso, ${errorCount} erros`);
    }

    /**
     * Lista todos os audios disponíveis no catálogo.
     */
    listAudios() {
        console.log("\n📚 Áudios disponíveis no catálogo:\n");

        const groupedByCategory = {};
        // Agropa os áudios por categoria
        Object.entries(this.catalog.audios).forEach(([id, audio]) => {
            if (!groupedByCategory[audio.category]) {
                groupedByCategory[audio.category] = [];
            }
            groupedByCategory[audio.category].push(id);
        });

        // Exibe os áudios agrupados por categoria
        Object.entries(groupedByCategory).forEach(([category, audios]) => {
            console.log(`📁 ${category.toUpperCase()}`);
            audios.forEach(audioId => {
                const audio = this.catalog.audios[audioId];
                console.log(`   └─ ${audioId}`);
                console.log(`      Input: "${audio.input.substring(0, 50)}..."`);
            });
            console.log();
        });
    }
}

// === Interface CLI ===
if (require.main === module) {
    // Instancia a Factory de Requisições TTS
    const factory = new TTSRequestFactory(
        "./httpyac/tts-audios/config/audio-catalog.json",
        "./config.js"
    );

    // Pega os argumentos da linha de comando
    const command = process.argv[2];
    const audioId = process.argv[3];

    try {
        switch (command) {
            case 'generateAllHttpFiles':
                factory.generateAllHttpFiles('./httpyac/tts-audios');
                break;
            
            case 'generate':
                if (!audioId) {
                console.error('❌ Use: generate <audioId>');
                process.exit(1);
                }
                factory.generateHttpFile(audioId, './httpyac/tts-audios');
                break;
            
            case 'list':
                factory.listAudios();
                break;
            
            default:
                console.log('Comandos: generate-all | generate <id> | list');
        }
    } catch (error) {
        console.error(`❌ ${error.message}`);
        process.exit(1);
    }
}

module.exports = TTSRequestFactory;