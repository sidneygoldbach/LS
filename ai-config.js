// Configurações para integração com APIs de IA
// Escolha uma das opções abaixo e configure suas credenciais

class AIConfig {
    constructor() {
        // ⚠️ CONFIGURAÇÃO NECESSÁRIA ⚠️
        // Para usar o aplicativo, você precisa:
        // 1. Escolher um provedor de IA
        // 2. Inserir sua chave de API válida
        // 3. Salvar este arquivo
        
        this.provider = 'gemini'; // 'openai', 'gemini', 'claude', 'local'
        
        // 🔑 CHAVE DE API CONFIGURADA:
        this.apiKey = 'AIzaSyCZCh9lNtl1LV0AskSgcQtBxPQU84O9NSk'; // ✅ Google Gemini configurado!
        
        // 🌤️ API DE METEOROLOGIA 100% GRATUITA (Open-Meteo):
        // Não requer chave de API! Totalmente gratuita para uso não comercial
        // Documentação: https://open-meteo.com/
        
        // 📝 Exemplos de onde obter chaves:
        // OpenAI: https://platform.openai.com/api-keys
        // Google Gemini: https://makersuite.google.com/app/apikey
        // Claude: https://console.anthropic.com/
        
        this.baseURL = this.getBaseURL();
        
        // Verificar se a API key foi configurada
        if (this.apiKey === 'YOUR_API_KEY_HERE' || !this.apiKey) {
            console.warn('⚠️ API Key não configurada! Configure sua chave em ai-config.js');
        }
    }
    
    getBaseURL() {
        const urls = {
            openai: 'https://api.openai.com/v1',
            gemini: 'https://generativelanguage.googleapis.com/v1',
            claude: 'https://api.anthropic.com/v1',
            local: 'http://localhost:8000' // Para APIs locais
        };
        return urls[this.provider];
    }
    
    // Integração com OpenAI GPT
    async callOpenAI(question) {
        const response = await fetch(`${this.baseURL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [{
                    role: 'system',
                    content: 'Você é um assistente útil que responde perguntas de forma clara e concisa em português.'
                }, {
                    role: 'user',
                    content: question
                }],
                max_tokens: 150,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    // Integração com Google Gemini
    async callGemini(question) {
        const response = await fetch(`${this.baseURL}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: question
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 150
                }
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }
    
    // Integração com Claude (Anthropic)
    async callClaude(question) {
        const response = await fetch(`${this.baseURL}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-sonnet-20240229',
                max_tokens: 150,
                messages: [{
                    role: 'user',
                    content: question
                }]
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status}`);
        }
        
        const data = await response.json();
        return data.content[0].text;
    }
    
    // Integração com API local (ex: Ollama, LM Studio)
    async callLocalAI(question) {
        const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama2', // ou outro modelo local
                messages: [{
                    role: 'user',
                    content: question
                }],
                max_tokens: 150,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`Erro na API local: ${response.status}`);
        }
        
        const data = await response.json();
        return data.choices[0].message.content;
    }
    
    // Obter coordenadas da cidade usando geocoding gratuito
    async getCityCoordinates(city = 'São Paulo') {
        try {
            const response = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`
            );
            
            if (!response.ok) {
                throw new Error(`Erro na API de geocoding: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.results || data.results.length === 0) {
                throw new Error('Cidade não encontrada');
            }
            
            return {
                latitude: data.results[0].latitude,
                longitude: data.results[0].longitude,
                name: data.results[0].name,
                country: data.results[0].country
            };
        } catch (error) {
            console.error('Erro ao obter coordenadas:', error);
            // Coordenadas padrão para São Paulo
            return {
                latitude: -23.5505,
                longitude: -46.6333,
                name: 'São Paulo',
                country: 'Brasil'
            };
        }
    }
    
    // Obter informações meteorológicas usando Open-Meteo (100% gratuita)
    async getWeatherInfo(city = 'São Paulo') {
        try {
            // Obter coordenadas da cidade
            const coords = await this.getCityCoordinates(city);
            
            // Buscar dados meteorológicos usando Open-Meteo API (atual + previsão para amanhã)
            const response = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,pressure_msl&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&timezone=auto&forecast_days=3`
            );
            
            if (!response.ok) {
                throw new Error(`Erro na API de clima: ${response.status}`);
            }
            
            const data = await response.json();
            const current = data.current;
            const daily = data.daily;
            
            // Mapear códigos de clima para descrições em português
            const weatherDescriptions = {
                0: 'céu limpo',
                1: 'principalmente limpo',
                2: 'parcialmente nublado',
                3: 'nublado',
                45: 'neblina',
                48: 'neblina com geada',
                51: 'garoa leve',
                53: 'garoa moderada',
                55: 'garoa intensa',
                61: 'chuva leve',
                63: 'chuva moderada',
                65: 'chuva intensa',
                71: 'neve leve',
                73: 'neve moderada',
                75: 'neve intensa',
                80: 'pancadas de chuva leves',
                81: 'pancadas de chuva moderadas',
                82: 'pancadas de chuva intensas',
                95: 'tempestade',
                96: 'tempestade com granizo leve',
                99: 'tempestade com granizo intenso'
            };
            
            // Dados atuais
            const currentWeather = {
                temperature: Math.round(current.temperature_2m),
                feelsLike: Math.round(current.apparent_temperature),
                humidity: current.relative_humidity_2m,
                description: weatherDescriptions[current.weather_code] || 'condição desconhecida',
                windSpeed: Math.round(current.wind_speed_10m * 10) / 10, // km/h
                windDirection: current.wind_direction_10m,
                pressure: Math.round(current.pressure_msl)
            };
            
            // Previsão para amanhã (índice 1 no array daily)
            const tomorrowWeather = {
                maxTemp: Math.round(daily.temperature_2m_max[1]),
                minTemp: Math.round(daily.temperature_2m_min[1]),
                description: weatherDescriptions[daily.weather_code[1]] || 'condição desconhecida',
                precipitation: daily.precipitation_sum[1],
                maxWindSpeed: Math.round(daily.wind_speed_10m_max[1] * 10) / 10
            };
            
            return {
                city: coords.name,
                country: coords.country,
                current: currentWeather,
                tomorrow: tomorrowWeather,
                // Manter compatibilidade com código anterior
                temperature: currentWeather.temperature,
                feelsLike: currentWeather.feelsLike,
                humidity: currentWeather.humidity,
                description: currentWeather.description,
                windSpeed: currentWeather.windSpeed,
                windDirection: currentWeather.windDirection,
                pressure: currentWeather.pressure
            };
        } catch (error) {
            console.error('Erro ao obter informações meteorológicas:', error);
            return {
                error: 'Erro ao obter clima',
                message: error.message
            };
        }
    }
    
    // Obter informações contextuais em tempo real
    async getContextualInfo(city = 'São Paulo') {
        const now = new Date();
        const timeInfo = {
            currentTime: now.toLocaleTimeString('pt-BR'),
            currentDate: now.toLocaleDateString('pt-BR'),
            dayOfWeek: now.toLocaleDateString('pt-BR', { weekday: 'long' }),
            timestamp: now.getTime()
        };
        
        const weatherInfo = await this.getWeatherInfo(city);
        
        return {
            time: timeInfo,
            weather: weatherInfo
        };
    }
    
    // Detectar se a pergunta requer informações em tempo real
    requiresRealTimeInfo(question) {
        const timeKeywords = ['hora', 'horas', 'agora', 'atual', 'data', 'hoje', 'dia', 'que horas'];
        const weatherKeywords = ['clima', 'tempo', 'meteorologia', 'chuva', 'sol', 'temperatura', 'graus', 'previsão', 'amanhã', 'vai chover', 'vai fazer', 'como está o tempo', 'como vai estar', 'neblina', 'nublado', 'ensolarado', 'vento'];
        
        const lowerQuestion = question.toLowerCase();
        
        // Verificar se é pergunta sobre horário (mais específica)
        const isTimeQuestion = timeKeywords.some(keyword => lowerQuestion.includes(keyword)) && 
                              !weatherKeywords.some(keyword => lowerQuestion.includes(keyword));
        
        // Verificar se é pergunta sobre clima
        const isWeatherQuestion = weatherKeywords.some(keyword => lowerQuestion.includes(keyword));
        
        return {
            needsTime: isTimeQuestion,
            needsWeather: isWeatherQuestion
        };
    }
    
    // Enriquecer pergunta com informações contextuais
    async enrichQuestionWithContext(question) {
        const realTimeNeeds = this.requiresRealTimeInfo(question);
        
        if (!realTimeNeeds.needsTime && !realTimeNeeds.needsWeather) {
            return question;
        }
        
        const contextInfo = await this.getContextualInfo();
        let enrichedQuestion = question;
        
        if (realTimeNeeds.needsTime) {
            enrichedQuestion += `\n\nInformações de tempo atual: Agora são ${contextInfo.time.currentTime} do dia ${contextInfo.time.currentDate} (${contextInfo.time.dayOfWeek}).`;
        }
        
        if (realTimeNeeds.needsWeather) {
            if (contextInfo.weather.error) {
                enrichedQuestion += `\n\nNota sobre clima: ${contextInfo.weather.message}`;
            } else {
                const weather = contextInfo.weather;
                const lowerQuestion = question.toLowerCase();
                
                // Verificar se a pergunta é sobre previsão futura
                const isForecastQuestion = ['amanhã', 'previsão', 'vai chover', 'vai fazer', 'como vai estar'].some(keyword => lowerQuestion.includes(keyword));
                
                if (isForecastQuestion && weather.tomorrow) {
                    enrichedQuestion += `\n\nInformações meteorológicas para ${weather.city}, ${weather.country}:`;
                    enrichedQuestion += `\n- HOJE: Temperatura ${weather.current.temperature}°C (sensação térmica ${weather.current.feelsLike}°C), ${weather.current.description}, umidade ${weather.current.humidity}%, vento ${weather.current.windSpeed} km/h.`;
                    enrichedQuestion += `\n- AMANHÃ: Temperatura entre ${weather.tomorrow.minTemp}°C e ${weather.tomorrow.maxTemp}°C, ${weather.tomorrow.description}, precipitação ${weather.tomorrow.precipitation}mm, vento máximo ${weather.tomorrow.maxWindSpeed} km/h.`;
                } else {
                    enrichedQuestion += `\n\nInformações meteorológicas atuais para ${weather.city}, ${weather.country}: Temperatura ${weather.temperature}°C (sensação térmica ${weather.feelsLike}°C), ${weather.description}, umidade ${weather.humidity}%, vento ${weather.windSpeed} km/h, pressão ${weather.pressure} hPa.`;
                }
            }
        }
        
        return enrichedQuestion;
    }
    
    // Método principal que chama a API configurada
    async processQuestion(question) {
        try {
            // Enriquecer pergunta com informações contextuais
            const enrichedQuestion = await this.enrichQuestionWithContext(question);
            
            console.log('Pergunta original:', question);
            console.log('Pergunta enriquecida:', enrichedQuestion);
            
            switch (this.provider) {
                case 'openai':
                    return await this.callOpenAI(enrichedQuestion);
                case 'gemini':
                    return await this.callGemini(enrichedQuestion);
                case 'claude':
                    return await this.callClaude(enrichedQuestion);
                case 'local':
                    return await this.callLocalAI(enrichedQuestion);
                default:
                    throw new Error('Provedor de IA não configurado');
            }
        } catch (error) {
            console.error('Erro ao processar pergunta:', error);
            throw error;
        }
    }
}

// Exportar para uso no script principal
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIConfig;
} else {
    window.AIConfig = AIConfig;
}