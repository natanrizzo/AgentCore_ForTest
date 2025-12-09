const { execSync } = require('child_process');

/**
 * Função que realiza diagnósticos de rede (ping e traceroute) para um host específico.
 *
 * @param {string} host - A URL base para extrair o hostname.
 * @returns {{ pingResult: string, tracertResult: string }}
* */
function runNetworkDiagnostics(host) {
    let hostname = 'api.elevenlabs.io'; // Valor default.
    if (host) {
        try {
            const url = new URL(host);
            hostname = url.hostname;
        } catch (e) {
            // Se a URL for inválida, mantém o hostname padrão
        }
    }

    /* Sessão de diagnóstico de rede */
    // Realiza o ping
    let pingResult = null;
    try {
        const platform = process.platform;
        const pingCmd = platform === 'win32' 
            ? `ping -n 1 ${hostname}` 
            : `ping -c 1 ${hostname}`;
        pingResult = execSync(pingCmd, { encoding: 'utf8', timeout: 5000 });
    } catch (error) {
        pingResult = `Error:\n${error.message}${error.stack ? '\n' + error.stack : ''}`;
    }

    // Realiza o traceroute
    let tracertResult = null;
    try {
        const platform = process.platform;
        const tracertCmd = platform === 'win32'
            ? `tracert -h 10 ${hostname}`
            : `traceroute -m 10 ${hostname}`;
        tracertResult = execSync(tracertCmd, { encoding: 'utf8', timeout: 10000 });
    } catch (error) {
        tracertResult = `Error:\n${error.message}${error.stack ? '\n' + error.stack : ''}`;
    }

    // Tratamentos para visualição dos resultados no YAML corretamente.
    // Validação: campo pingResult para garantir que seja string e com nova linha
    if (!pingResult) pingResult = `No ping result\n`;
    if (typeof pingResult !== 'string') pingResult = String(pingResult) + '\n';
    if (!pingResult.includes('\n')) pingResult = pingResult + '\n';

    // Validação: campo tracertResult para garantir que seja string e com nova linha
    if (!tracertResult) tracertResult = `No tracert result\n`;
    if (typeof tracertResult !== 'string') tracertResult = String(tracertResult) + '\n';
    if (!tracertResult.includes('\n')) tracertResult = tracertResult + '\n';

    return { pingResult, tracertResult };
}

module.exports = { runNetworkDiagnostics };