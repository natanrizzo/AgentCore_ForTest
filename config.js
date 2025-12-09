require('dotenv').config();

const config = {
    elevenlabs: {
        api_key: process.env.ELEVENLABS_API_KEY,
        agent_id: 'agent_2101k6144df8e9k80spt9h8m63yq',
        base_url: 'https://api.elevenlabs.io',
        models: [
            "eleven_v3",
            "eleven_flash_v2_5",
            "eleven_turbo_v2_5",
        ]
    },
    /*
    STT Speach-to-Text
    */
    stt_params: {
        provider: 'elevenlabs',
        language: 'pt-BR',
        encoding: '',
        rate: null,
        audio_channel_count: 1
    },
    /*
    TTS - Text-to-Speech Configuration
    */
    voice_settings: {
        provider: 'elevenlabs', // or 'google', 'azure', 'aws'
        endpont: "GET /v1/voices/{voice_id}/settings"
        //Configuração padrão da voz FF03 de exemplo, apenas variar no ARQUIVO GERADOR.
        //stability: 0.92,
        //use_speaker_boost: true,
        //similarity_boost: 0.75,
        //style: 0.46,
        //speed: "1.0"
    },

    // Audio Settings
    audio_out_params: {
        output_path: './http-audios/out',
        format: 'mp3',
        bitrate: '192k',
        sample_rate: 44100
    },

    // API Rate Limiting
    rate_limits: {
        requests_per_minute: 50,
        characters_per_request: 2000,
        max_concurrent_requests: 5
    }
};

/**
 * MODO DE USO
    const { config } = require('./config');

    console.log(config.elevenlabs.voice.id); // default FF03
    config.elevenlabs.voice.name = 'FF04';
    console.log(config.elevenlabs.voice.id); // id de FF04
 */
// --- Minimal voice mapping (name -> id) ---
const voices_by_name = {
    "FF04": "2GjEiBcNU3qMWn4sAFHh",
    "FF03": "wwjVck1XIYAewhk5NRXK", //DEFAULT
    "Marcio - Bold & Captivating": "Zk0wRqIFBWGMu2lIk7hw",
    "Carla - Children's story narrator": "oJebhZNaPllxk6W0LSBA",
    "Rachel": "21m00Tcm4TlvDq8ikWAM",
    "Drew": "29vD33N1CtxCmqQRPOHJ",
    "Clyde": "2EiwWnXFnvU5JabPnv8n",
    "Paul": "5Q0t7uMcjvnagumLfvZi",
    "Aria": "9BWtsMINqrJLrRacOk9x",
    "Masculino": "re2r5d74PqDzicySNW0I", // Leon Stern PRINCIPAL MASCULINO ***
    "Feminino": "Sm1seazb4gs7RSlUVw7c", // Anika PRINCIPAL FEMININO ***
    // New
    "Will": "QWzA13xdHsD8GLBwVILU", // Will - Intensity in Storytelling
    "HopeUC": "tnSpp4vdxKPjI9w0GnoV", // Hope - upbeat and clear
    "Leo": "IvLWq57RKibBrqZGpQrC", // Leo - Energetic Hindi
    "Nassim": "repzAAjoKlgcT2oOAIWt", // Nassim
    "Fernando": "dlGxemPxFMTY7iXagmOj", // Fernando Martinez
    "Jerry": "XA2bIQ92TabjGbpO2xRr", // Jerry
    "Krishna": "m5qndnI7u4OAdXhH0Mr5", // Krishna
    "Jeff": "gs0tAILXbY5DNrJrsM6F", // Jeff
    "Anika": "Sm1seazb4gs7RSlUVw7c", // Anika PRINCIPAL FEMININO ***
    "Alex Wright": "GzE4TcXfh9rYCU9gVgPp", // Alex Wright
    "Saira": "vghiSqG5ezdhd8F3tKAD", // Saira
    "Leon": "re2r5d74PqDzicySNW0I", // Leon Stern PRINCIPAL MASCULINO ***
    "Peter": "GgV5QStPLpmkN7FOHJtY", // Peter - Engaging ..
    "Arthur": "TtRFBnwQdH1k01vR0hMz", // Arthur - Energetic ..
    "HopeCT": "WZlYpi1yf6zJhNWXih74", // Hope - Corporate Training
};

// Somente “set by name”; id é derivado
const voice = {
    _name: 'FF03', // default
    get name() { return this._name; },
    set name(v) {
        if (!voices_by_name[v]) throw new Error(`Voice not found: ${v}`);
        this._name = v;
    },
    get id() {
        return voices_by_name[this._name];
    },
};

// Anexa ao config e espelha voice_id de leitura
config.elevenlabs.voice = voice;
Object.defineProperty(config.elevenlabs, 'voice_id', {
    get() { return config.elevenlabs.voice.id; },
    set() { throw new Error('voice_id é derivado; defina elevenlabs.voice.name'); },
    enumerable: true,
});

module.exports = { config, voices_by_name, voice };