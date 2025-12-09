// Precisamos dos módulos 'fs' (File System) e 'path' (Caminhos) do Node.js
import  fs from 'fs';
import path from 'path';

/**
 * Helper para gerar um nome de arquivo formatado para saídas de áudio.
 * Este helper é chamado de dentro do arquivo .http
 *
 * Formato: {ID}-{Endpoint}-{Name}--{Model}-{Dict}-{Voice}-{Datetime}
 *
 * @param {string} endpoint - O valor de @endpoint (ex: "TTS")
 * @param {string} name - O nome/título da fala (ex: "Finalização")
 * @param {string} model - O ID do modelo (ex: "eleven_v2_5_flash")
 * @param {string} dict - O dicionário (ex: "Alias")
 * @param {string} voice - O nome da voz (ex: "FF04")
 * @returns {string} O nome do arquivo formatado (sem o caminho)
 */
/**
 * Agora aceita um parâmetro opcional `llm` que, quando presente, será
 * adicionado à parte do modelo no nome do arquivo. Mantém compatibilidade
 * com chamadas que não passe esse argumento.
 */
export const generateAudioFilename = (output, endpoint, name, model, dict, voice, llm) => {
    
    // --- 1. Calcular o próximo ID ---
    // Diretório onde os arquivos são salvos (baseado no seu @outputPath)
    const outputDir = output ?? './http-audios/out';

    // Garante que o diretório exista
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Lê os arquivos existentes no diretório
    const files = fs.readdirSync(outputDir);
    const idRegex = /^\d{4}-/; // Regex para arquivos que começam com "0000-"
    let maxId = 0;

    // Encontra o maior ID existente
    files.forEach(file => {
        if (idRegex.test(file)) {
            const currentId = parseInt(file.substring(0, 4), 10);
            if (currentId > maxId) {
                maxId = currentId;
            }
        }
    });

    // O novo ID é o último ID + 1, formatado com 4 dígitos (ex: 0005)
    const newId = (maxId + 1).toString().padStart(4, '0');

    // --- 2. Calcular o Datetime ---
    // Formato: YYYY-MM-DDTHH-mm
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const datetimeString = `${year}-${month}-${day}T${hours}-${minutes}`;

    // --- 3. Montar o nome do arquivo ---
    // Formato: {ID}-{Endpoint}-{Name}--{Model[-LLM]}-Dict={Dict}-{Voice}-{Datetime}
    // Se `llm` for fornecido, concatenamos ao model com um hífen.
    // A Duração é omitida, pois o arquivo ainda não foi criado.
    const filename = `${newId}-${endpoint}-${name}--${model}-LLM=${llm ?? "none"}-Dict=${dict}-V=${voice ?? "none"}-${datetimeString}`;

    return filename;
};