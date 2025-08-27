# 🤖 AI Voice Assistant

Um assistente de voz inteligente com reconhecimento de fala, síntese de voz e integração com múltiplas APIs de IA. O projeto oferece informações em tempo real sobre clima e horário, utilizando APIs gratuitas.

## ✨ Funcionalidades

### 🎤 Reconhecimento de Voz
- Reconhecimento de fala em tempo real usando Web Speech API
- Detecção automática de silêncio com timeout configurável (15 segundos)
- Suporte para comandos de voz em português brasileiro
- Interface visual com indicadores de status e animações

### 🔊 Síntese de Voz
- Conversão de texto para fala (Text-to-Speech)
- Vozes em português brasileiro
- Controle automático de reprodução

### 🧠 Integração com IA
Suporta múltiplos provedores de IA:
- **Google Gemini** (configurado por padrão - gemini-1.5-flash)
- OpenAI GPT
- Anthropic Claude
- IA Local (Ollama, LM Studio)

### 🌤️ Informações em Tempo Real
- **Clima atual e previsão**: Usando Open-Meteo API (100% gratuita, sem chave necessária)
- **Data e hora**: Informações locais em tempo real
- **Detecção inteligente**: Reconhece automaticamente perguntas sobre clima e tempo
- **Previsão do tempo**: Dados para hoje e amanhã
- **Geocoding**: Busca automática de coordenadas por nome da cidade

## 🚀 Como Usar

### Pré-requisitos
- Navegador moderno com suporte à Web Speech API (Chrome recomendado)
- Conexão com internet
- Microfone funcional
- Chave de API do Google Gemini

### Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/ai-voice-assistant.git
   cd ai-voice-assistant
   ```

2. **Configure a API do Gemini:**
   - Abra o arquivo `ai-config.js`
   - A chave já está configurada para demonstração
   - Para uso próprio, obtenha sua chave em: https://makersuite.google.com/app/apikey

3. **Execute o servidor local:**
   ```bash
   python3 -m http.server 8000
   ```
   
4. **Acesse no navegador:**
   ```
   http://localhost:8000
   ```

### Configuração da API

Edite o arquivo `ai-config.js` para configurar seu provedor de IA:

```javascript
class AIConfig {
    constructor() {
        this.provider = 'gemini'; // ou 'openai', 'claude', 'local'
        this.apiKey = 'SUA_CHAVE_AQUI';
    }
}
```

## 🎯 Exemplos de Uso

### Comandos de Voz Suportados

**Informações de Tempo:**
- "Que horas são?"
- "Qual é a data de hoje?"
- "Que dia da semana é hoje?"

**Informações de Clima:**
- "Como está o tempo hoje?"
- "Qual a temperatura agora?"
- "Vai chover amanhã?"
- "Como vai estar o clima amanhã em São Paulo?"
- "Qual a previsão do tempo?"
- "Como está o vento?"

**Perguntas Gerais:**
- "Explique sobre inteligência artificial"
- "Como funciona o reconhecimento de voz?"
- "Conte uma piada"
- "Qual é a capital do Brasil?"

## 🛠️ Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **APIs de IA**: Google Gemini, OpenAI, Claude
- **APIs de Dados**: 
  - Open-Meteo (clima e previsão)
  - Open-Meteo Geocoding (coordenadas de cidades)
- **Web APIs**: Speech Recognition, Speech Synthesis
- **Servidor**: Python HTTP Server

## 📁 Estrutura do Projeto

```
ai-voice-assistant/
├── index.html          # Interface principal
├── script.js           # Lógica do reconhecimento de voz
├── ai-config.js        # Configuração das APIs de IA e clima
├── styles.css          # Estilos da interface
├── README.md           # Documentação
├── CONFIGURACAO_API.md # Guia de configuração
└── .gitignore          # Arquivos ignorados pelo Git
```

## 🔧 Configuração Avançada

### Personalizar Timeout de Silêncio
```javascript
// Em script.js
const SILENCE_TIMEOUT = 15000; // 15 segundos
```

### Adicionar Novos Provedores de IA
```javascript
// Em ai-config.js
async callCustomAI(question) {
    // Implementar integração com nova API
}
```

### Personalizar Detecção de Palavras-chave
```javascript
// Em ai-config.js - função requiresRealTimeInfo
const weatherKeywords = ['clima', 'tempo', 'chuva', 'previsão', 'amanhã'];
const timeKeywords = ['hora', 'horas', 'data', 'hoje', 'dia'];
```

## 🌍 APIs Utilizadas

### Open-Meteo (Clima)
- **100% Gratuita**: Sem necessidade de chave de API
- **Dados atuais**: Temperatura, umidade, vento, pressão, condições
- **Previsão**: Dados para hoje e amanhã
- **Cobertura**: Mundial
- **Documentação**: https://open-meteo.com/

### Open-Meteo Geocoding
- **Gratuita**: Busca de coordenadas por nome da cidade
- **Suporte**: Múltiplos idiomas incluindo português
- **Fallback**: Coordenadas padrão para São Paulo

### Google Gemini (IA)
- **Modelo**: gemini-1.5-flash
- **Capacidades**: Texto, análise, conversação
- **Contexto**: Enriquecido com informações de tempo e clima
- **Documentação**: https://ai.google.dev/

## 🔒 Segurança

- ✅ Não armazena dados de áudio localmente
- ✅ Chaves de API configuráveis pelo usuário
- ✅ Comunicação HTTPS com APIs externas
- ✅ APIs de clima sem necessidade de chave
- ⚠️ **Importante**: Nunca commite chaves de API no repositório

## 🐛 Solução de Problemas

### Microfone não funciona
1. Verifique permissões do navegador para microfone
2. Teste o microfone em outras aplicações
3. Use HTTPS ou localhost (obrigatório para Web Speech API)
4. Experimente navegadores diferentes (Chrome recomendado)

### Erro 404 na API
1. Verifique se a chave de API está correta
2. Confirme se o modelo Gemini está disponível
3. Verifique conexão com internet
4. Tente atualizar a página

### Reconhecimento de voz não funciona
1. Use navegador compatível (Chrome recomendado)
2. Fale claramente e próximo ao microfone
3. Verifique se o idioma está configurado para português
4. Aguarde o timeout de silêncio (15 segundos)

### Informações de clima não aparecem
1. Verifique conexão com internet
2. Teste com perguntas específicas sobre clima
3. Verifique console do navegador para erros

## 📈 Funcionalidades Implementadas

- ✅ Reconhecimento de voz com timeout inteligente
- ✅ Síntese de voz em português
- ✅ Integração com Google Gemini
- ✅ API de clima 100% gratuita (Open-Meteo)
- ✅ Informações de data e hora em tempo real
- ✅ Detecção inteligente de perguntas sobre clima/tempo
- ✅ Previsão do tempo para amanhã
- ✅ Geocoding automático de cidades
- ✅ Interface responsiva e animada
- ✅ Sistema de logs para debugging

## 🚀 Roadmap Futuro

- [ ] Suporte a múltiplos idiomas
- [ ] Interface mobile ainda mais otimizada
- [ ] Histórico de conversas
- [ ] Integração com mais APIs de clima
- [ ] Modo offline básico
- [ ] Personalização de voz
- [ ] Notificações de clima
- [ ] Integração com calendário

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ usando Trae AI

---

**⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!**

**🎤 Experimente agora: Diga "Como está o tempo hoje?" ou "Que horas são?"**