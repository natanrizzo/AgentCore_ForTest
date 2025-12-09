/**
 * Este arquivo realiza testes de audio (TTS) a partir de um array de vozes e modelos.
 * Ele no fim gera um arquivo de áudio para cada combinação de voz e modelo.
 */

// Fala a ser utilizada no teste
const trainingData = {
    "1": "Você conhece a Prudential? Já é cliente? Num ninho de mafagafos há sete mafagafinhos. Quando a mafagafa gafa, gafam os sete mafagafinhos. Trazei três pratos de trigo para três tigres tristes comerem. A aranha arranha a rã. A rã arranha a aranha. Nem a aranha arranha a rã. Nem a rã arranha a aranha. O tempo perguntou ao tempo quanto tempo o tempo tem, o tempo respondeu ao tempo que o tempo tem o tempo que o tempo tem. Se percebeste, percebeste. Se não percebeste, faz que percebeste para que eu perceba que tu percebeste. Percebeste?",
}
const input = trainingData["1"]

/**
 * Variável de controle de deleção da voz.
 * Atenção no uso desta variável. Ela está presente devido ao limite
 * de vozes no dashboard do ElevenLabs. Caso esteja utilizando uma voz personalisada
 * NÃO DEIXE ESTA VARIÁVEL COMO TRUE, caso contrário ela pode ser apagada permanentemente.
 * */ 
let deleteAfterUsing = true

// Vozes a serem utilizadas
//const voices = ["Masculino1", "Masculino2", "Masculino3", "Masculino4", "Feminino1", "Feminino2", "Feminino3", "Feminino4"];
const voices = ["Will", "HopeUC", "Leo", "Nassim", "Fernando", "Jerry", "Krishna", "Jeff", "Anika", "Alex Wright", "Saira", "Leon", "Peter", "Arthur", "HopeCT"];
// Modelos a serem utilizados
const models = ["eleven_v3", "eleven_flash_v2_5", "eleven_turbo_v2_5"];

// Require na config
const { config, voices_by_name } = require('../../config.js');
const { saveAudioResponse } = require("../../common/PostRequest.js");

// Variaveis da configuração de voz
let stability = 0.5 ?? config.text_to_speech.stability
let similarity_boost = 0.75 ?? config.text_to_speech.similarity_boost
let speed = 1.0 ?? config.text_to_speech.speed
let style = 0.0 ?? config.text_to_speech.style

// Variaveis do context
let endpoint = "tts"
let title = "test_voices"
let dict = "alias"
let OUT_DIR = "httpyac/tests/out"

// Body da requisição
const getRequestBody = (model) => ({
    "text": input,
    "model_id": model,
    "voice_settings": {
        "stability": stability,
        "similarity_boost": similarity_boost,
        "speed": speed,
        "style": style
    }
})

// Função auxiliar para obter o ID da voz
const getVoiceId = (voiceName) => {
    return voices_by_name[voiceName];
}

// Função auxiliar para adicionar delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Função responsável pela criação de arquivos de audio para cada uma das vozes.
 * Cria um arquivo de voz para cada um dos models.
 * No fim deleta a voz do dashboard no ElevenLabs para não estourar o limite.
 */
async function main() {
    let totalRequests = 0;
    let successfulRequests = 0;

    console.log(`[Iniciando] Gerando ${models.length * voices.length} arquivos de áudio...\n`);

    // Loop sequencial das voices e depois models
    for (const voice of voices) {
        const voiceId = getVoiceId(voice);

        for (const model of models) {
            totalRequests++;    
            try {
                
                // Faz o Fetch para a API ElevenLabs
                const response = await fetch(`${config.elevenlabs.base_url}/v1/text-to-speech/${voiceId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'xi-api-key': config.elevenlabs.api_key,
                        'Accept': 'audio/mpeg'
                    },
                    body: JSON.stringify(getRequestBody(model))
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                // Aguarda a resposta completa antes de processar
                const arrayBuffer = await response.arrayBuffer();
                
                // Verifica se o buffer não está vazio
                if (!arrayBuffer || arrayBuffer.byteLength === 0) {
                    throw new Error('Response body vazio');
                }

                const rawBody = Buffer.from(arrayBuffer);

                // Simula o contexto do httpyac para o saveAudioResponse
                const mockContext = {
                    variables: {
                        endpoint,
                        title,
                        dict,
                        model,
                        VOICE_ALIAS: voice,
                        OUT_DIR
                    }
                };

                // Chama a função de salvar o áudio e aguarda completamente
                await saveAudioResponse({
                    response: { rawBody },
                    context: mockContext
                });

                successfulRequests++;
                console.log(`✓ [${totalRequests}/${models.length * voices.length}] Voz: ${voice} | Modelo: ${model}`);

                // Pequeno delay entre requisições para evitar throttling
                await delay(100);
                
            } catch (error) {
                console.error(`✗ [${totalRequests}/${models.length * voices.length}] Voz: ${voice} | Modelo: ${model} | Erro: ${error.message}`);
            }
        }

        // Bloqueia a parte de deleção caso esta variável esteja como false.
        if (deleteAfterUsing) {
            // Deleta a voz para não ocupar espaço.
            const deleteVoiceResponse = await fetch(`${config.elevenlabs.base_url}/v1/voices/${voiceId}`, {
                method: 'DELETE',
                headers: {
                    'xi-api-key': config.elevenlabs.api_key,
                }
            });
            if (!deleteVoiceResponse.ok) {
                throw new Error(`HTTP ${deleteVoiceResponse.status}`);
            } 
        }
    }

    console.log(`\n[Resumo] Total: ${totalRequests} | Sucesso: ${successfulRequests} | Falha: ${totalRequests - successfulRequests}`);
}

// Executa a função main
main().catch(console.error);