# 📋 AgentCore - Documentação do Projeto

## 1. Visão Geral

**AgentCore** é um projeto em fase inicial de desenvolvimento focado na construção de um **agente de atendimento inteligente** que integra a API do **ElevenLabs** para síntese e processamento de voz. O projeto possui uma arquitetura modular preparada para evoluir de consumo via HTTPYac para implementações futuras com SDKs e packages nativos.

### Objetivos Principais

- Consumir e integrar a API ElevenLabs para geração de voz
- Desenvolver um agente de atendimento (call center) com capacidades de conversação
- Construir e testar prompts otimizados para interações naturais
- Estabelecer um framework robusto para orquestração de chamadas e diálogos

---

## 2. Estrutura do Projeto

```
AgentCore/
├── common/                  # Utilidades compartilhadas
│   ├── FilenameHelper.js
│   ├── NetworkDiagnostics.js
│   └── PostRequest.js
├── backend/                 # Lógica de backend (em desenvolvimento)
├── httpyac/                 # Testes e simulações via HTTPYac
│   ├── simulation/           # Simulações de cenários de atendimento
│   └── tts-audios/          # Requisições de Text-to-Speech (TTS)
│       ├── closing/
│       ├── followup/
│       ├── greeting/
│       ├── objection/
│       ├── qualification/
│       └── scheduling/
├── CTX-PROMPTS/            # Prompts e instruções para LLM
│   ├── llms.txt            # Prompts sucintos
│   └── llms-full.txt       # Prompts completos
├── REPOS DE AJUDA/         # Repositórios de referência
│   └── elevenlabs-examples/
├── SANDBOX-ESTUDO/         # Documentação de estudo e roteiros
├── config.js               # Configuração central do projeto
└── package.json            # Dependências Node.js

```

---

## 3. Componentes Principais

### 3.1 Common (common)

Módulos reutilizáveis de infraestrutura:

| Arquivo                 | Propósito                                                |
| ----------------------- | -------------------------------------------------------- |
| `FilenameHelper.js`     | Utilitários para manipulação de nomes de arquivo e paths |
| `NetworkDiagnostics.js` | Diagnósticos e validação de conectividade                |
| `PostRequest.js`        | Cliente HTTP abstraído para requisições POST             |

### 3.2 HTTPYac (httpyac)

Ambiente de testes e simulação de requisições para a API ElevenLabs.

#### **Simulações (simulation)**

Cenários de atendimento completos para testes de fluxo:

- `SIMUL-Agendamento.http` - Simulação de scheduling/agendar
- `SIMUL-Apresentação.http` - Simulação de introdução do agente
- `SIMUL-Introdução.http` - Simulação de boas-vindas
- `SIMUL-NEG-Não Avisado.http` - Simulação de objeções (leads não avisados)
- `TPL_simulation_base.http` - Template base para novas simulações

#### **TTS Audios (tts-audios)**

Estrutura de requisições de Text-to-Speech organizadas por **contexto de conversa**:

| Categoria          | Uso                                                                    |
| ------------------ | ---------------------------------------------------------------------- |
| **greeting/**      | Saudações, apresentação do agente, construção de rapport               |
| **objection/**     | Tratamento de objeções comuns (já tem contador, já tem assessor, etc.) |
| **qualification/** | Qualificação e identificação de leads                                  |
| **scheduling/**    | Agendamento e confirmação de horários                                  |
| **followup/**      | Acompanhamento e confirmação de informações                            |
| **closing/**       | Encerramento de chamada e convites                                     |

### 3.3 Prompts (CTX-PROMPTS)

Banco de instruções para o modelo de linguagem:

- `llms.txt` - Versão concisa de prompts e instruções
- `llms-full.txt` - Versão completa com contexto detalhado

### 3.4 Backend (backend)

_Estrutura em desenvolvimento para implementação futura de SDKs ElevenLabs e lógica de orquestração._

---

## 4. Fluxo de Desenvolvimento Atual

### 4.1 Stack Tecnológico

- **Linguagem**: JavaScript (Node.js)
- **Gerenciador de Pacotes**: Yarn v3
- **Testes/Simulação**: HTTPYac
- **APIs Externas**: ElevenLabs

### 4.2 Ciclo de Desenvolvimento

1. **Concepção de Prompts**: Criação em CTX-PROMPTS
2. **Testes via HTTPYac**: Validação em simulation e tts-audios
3. **Integração Backend**: Implementação em backend (futura)
4. **SDK/Package Native**: Migração de HTTPYac para SDKs (roadmap)

---

## 5. Roteiros de Atendimento

O projeto está estruturado para suportar um agente que percorre diferentes **fases de uma chamada de vendas**:

### Fase 1: Greeting (Saudação)

```
greeting_agent_disclosure (Divulgação do agente)
  ↓
greeting_agent_introduction (Apresentação)
  ↓
greeting_identify_lead (Identificação do lead)
  ↓
greeting_rapport_build (Construção de rapport)
  ↓
greeting_rapport_check (Verificação de rapport)
```

### Fase 2: Qualification (Qualificação)

Avaliação de necessidades e perfil do prospect.

### Fase 3: Objection Handling (Tratamento de Objeções)

Roteiros para as objeções mais comuns:

- Já possui contador/assessor
- Já possui seguros/investimentos
- Percepção de custo elevado
- Desconhecimento da marca/produto

### Fase 4: Scheduling (Agendamento)

Confirmação de disponibilidade e marcação de reunião.

### Fase 5: Followup (Acompanhamento)

Confirmação de email, confirmação de dados.

### Fase 6: Closing (Encerramento)

Convite para próxima ação ou encerramento da chamada.

---

## 6. Padrões e Convenções

### 6.1 Nomenclatura de Arquivos HTTPYac

```
tts-<categoria>_<ação>_<contexto>.http
simulação-<contexto>_<variação>.http
```

**Exemplos:**

- `tts-greeting_agent_introduction.http` - TTS para introdução do agente
- `tts-objection_already_have_accountant.http` - TTS para objeção específica
- `SIMUL-Agendamento.http` - Simulação de fluxo de agendamento

### 6.2 Estrutura de Prompts

Prompts devem ser armazenados em CTX-PROMPTS e categorizados por:

- **Sistema**: Instruções base do agente
- **Contexto**: Informações sobre a empresa e produtos
- **Respostas**: Templates de respostas por cenário

---

## 7. Recursos Externos e Referências

### 7.1 ElevenLabs API

- Localização de exemplos: `/REPOS DE AJUDA/elevenlabs-examples/`
- Documentação oficial: https://elevenlabs.io/docs/api
- Endpoints principais para o projeto:
  - TTS (Text-to-Speech)
  - Voice Cloning
  - Voice Settings

### 7.2 HTTPYac

Ferramenta utilizada para testar e simular requisições HTTP sem necessidade de código compilado.

---

## 9. Como Usar Este Projeto (Para IAs)

### 9.1 Contexto para Assistentes de IA

1. **Análise de Estrutura**: Consulte CTX-PROMPTS para entender o tom e estilo esperados
2. **Referência de Fluxos**: Use simulation como exemplos de fluxos completos
3. **Padrões de Resposta**: Verifique os templates TTS para consistência
4. **Configuração**: Acesse config.js para parâmetros do projeto

### 9.2 Edição de Prompts

- Atualizações em llms.txt para prompts concisos
- Documentação completa em llms-full.txt
- Sempre manter versionamento de mudanças

### 9.3 Adição de Novos Cenários

Ao adicionar novo cenário de atendimento:

1. Criar arquivo em `/httpyac/tts-audios/<categoria>/tts-<ação>.http`
2. Documentar fluxo correspondente em CTX-PROMPTS
3. Adicionar simulação em simulation se aplicável

---

## 10. Dependências e Configuração

### 10.1 Requisitos

- Node.js (versão recomendada: 18+)
- Yarn v3
- HTTPYac (para testes locais)
- Chave de API ElevenLabs

---

## Sumário de Arquivos-Chave

| Arquivo/Pasta | Descrição                    | Status                |
| ------------- | ---------------------------- | --------------------- |
| CTX-PROMPTS   | Banco central de prompts     | 🟢 Ativo              |
| tts-audios    | Requisições TTS por contexto | 🟢 Ativo              |
| simulation    | Simulações de fluxos         | 🟡 Em desenvolvimento |
| common        | Utilidades compartilhadas    | 🟡 Em desenvolvimento |
| backend       | SDK ElevenLabs (futuro)      | 🔴 Não iniciado       |
| config.js     | Configuração central         | 🟡 A ser documentado  |

---

**Versão da Documentação**: 1.0  
**Última Atualização**: 21 de novembro de 2025  
**Status do Projeto**: Em desenvolvimento ativo
