class VoiceAI {
    constructor() {
        this.isRecording = false;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.recognition = null;
        this.aiConfig = new AIConfig();
        console.log('AIConfig inicializada:', this.aiConfig);
        
        this.initializeElements();
        this.initializeSpeechRecognition();
        this.bindEvents();
    }
    
    initializeElements() {
        this.voiceButton = document.getElementById('voiceButton');
        this.buttonText = document.getElementById('buttonText');
        this.micIcon = document.getElementById('micIcon');
        this.statusMessage = document.getElementById('statusMessage');
        this.responseContainer = document.getElementById('responseContainer');
        this.responseText = document.getElementById('responseText');
        this.audioPlayer = document.getElementById('responseAudio');
        
        // Novos elementos para input de texto
        this.questionContainer = document.getElementById('questionContainer');
        this.questionText = document.getElementById('questionText');
        this.questionInput = document.getElementById('questionInput');
        this.sendButton = document.getElementById('sendButton');
        
        // Variáveis para controle de áudio
        this.silenceTimer = null;
        this.audioDetected = false;
    }
    
    initializeSpeechRecognition() {
        console.log('🎤 ÁUDIO: Inicializando Speech Recognition');
        console.log('🎤 ÁUDIO: webkitSpeechRecognition disponível?', 'webkitSpeechRecognition' in window);
        console.log('🎤 ÁUDIO: SpeechRecognition disponível?', 'SpeechRecognition' in window);
        
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            console.log('🎤 ÁUDIO: Criando nova instância de SpeechRecognition');
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'pt-BR';
            this.recognition.maxAlternatives = 1;
            console.log('🎤 ÁUDIO: Configurações aplicadas - continuous: true, interimResults: true');
            console.log('🎤 ÁUDIO: Speech Recognition configurado com sucesso');
            
            this.recognition.onstart = () => {
                console.log('🎤 ÁUDIO: onstart disparado - reconhecimento iniciado');
                this.updateStatus('Escutando... Fale agora!');
            };
            
            this.recognition.onresult = (event) => {
                console.log('🎤 ÁUDIO: onresult disparado', event);
                console.log('🎤 ÁUDIO: Número de resultados:', event.results.length);
                this.checkForSpeech(); // Marcar que áudio foi detectado
                
                const result = event.results[event.results.length - 1];
                const transcript = result[0].transcript.trim();
                console.log('🎤 ÁUDIO: Transcript capturado:', transcript);
                console.log('🎤 ÁUDIO: Resultado é final?', result.isFinal);
                console.log('🎤 ÁUDIO: Confiança:', result[0].confidence);
                
                // Mostrar texto sendo capturado em tempo real no painel da pergunta
                if (transcript) {
                    this.updateQuestionPanel(transcript);
                }
                
                if (result.isFinal) {
                    console.log('🎤 ÁUDIO: Resultado final, transcript:', transcript);
                    if (transcript) {
                        this.updateStatus(`Pergunta: "${transcript}"`);
                        console.log('🎤 ÁUDIO: Chamando processQuestion com:', transcript);
                        this.processQuestion(transcript);
                    } else {
                        console.log('🎤 ÁUDIO: Transcript vazio, chamando handleSilentAudio');
                        this.handleSilentAudio();
                    }
                }
            };
            
            this.recognition.onerror = (event) => {
                console.error('🎤 ÁUDIO: onerror disparado:', event.error);
                console.log('🎤 ÁUDIO: Detalhes do erro:', event);
                if (event.error === 'no-speech' || event.error === 'audio-capture') {
                    console.log('🎤 ÁUDIO: Erro de captura de áudio ou sem fala');
                    this.handleSilentAudio();
                } else {
                    console.log('🎤 ÁUDIO: Outro tipo de erro:', event.error);
                    this.updateStatus('Erro no reconhecimento de voz.', 'error');
                    this.stopRecording();
                }
            };
            
            this.recognition.onend = () => {
                if (this.isRecording) {
                    this.stopRecording();
                }
            };
        } else {
            this.updateStatus('Reconhecimento de voz não suportado neste navegador.', 'error');
        }
    }
    
    bindEvents() {
        this.voiceButton.addEventListener('click', () => {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });
        
        // Eventos para input de texto
        this.questionInput.addEventListener('input', () => {
            this.handleTextInput();
        });
        
        this.questionInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.questionInput.value.trim()) {
                this.sendTextQuestion();
            }
        });
        
        this.sendButton.addEventListener('click', () => {
            this.sendTextQuestion();
        });
    }
    
    startRecording() {
        console.log('🎤 ÁUDIO: Iniciando startRecording');
        console.log('🎤 ÁUDIO: Recognition disponível?', !!this.recognition);
        
        if (!this.recognition) {
            console.log('🎤 ÁUDIO: Recognition não disponível!');
            this.updateStatus('Reconhecimento de voz não disponível.', 'error');
            return;
        }
        
        this.isRecording = true;
        this.audioDetected = false;
        
        // Limpar resposta anterior
        this.clearPreviousResponse();
        
        // Atualizar interface - mudança de cor e texto
        this.buttonText.textContent = 'Terminar';
        this.voiceButton.style.backgroundColor = '#dc3545';
        this.voiceButton.style.borderColor = '#dc3545';
        this.voiceButton.classList.add('recording');
        this.micIcon.classList.add('recording');
        this.updateStatus('Ouvindo... Fale sua pergunta.');
        
        // Iniciar reconhecimento de voz
        try {
            console.log('🎤 ÁUDIO: Tentando iniciar recognition.start()');
            this.recognition.start();
            console.log('🎤 ÁUDIO: Recognition.start() chamado com sucesso');
            
            // Timer para detectar problemas de captura
            this.silenceTimer = setTimeout(() => {
                if (!this.audioDetected && this.isRecording) {
                    console.log('🎤 ÁUDIO: Timer de silêncio disparado - nenhum áudio detectado em 5 segundos');
                    console.log('🎤 ÁUDIO: Possível problema: microfone não está capturando ou muito baixo');
                    this.updateStatus('Nenhum áudio detectado. Verifique o microfone e fale mais alto.', 'error');
                    this.handleSilentAudio();
                }
            }, 5000); // 5 segundos para detectar problemas
            
            // Timer adicional para forçar parada se necessário
            this.forceStopTimer = setTimeout(() => {
                if (this.isRecording) {
                    console.log('🎤 ÁUDIO: Forçando parada após 15 segundos');
                    this.stopRecording();
                }
            }, 15000);
            
        } catch (error) {
            console.error('🎤 ÁUDIO: Erro ao iniciar reconhecimento:', error);
            this.updateStatus('Erro ao iniciar gravação.', 'error');
            this.stopRecording();
        }
    }
    
    stopRecording() {
        this.isRecording = false;
        
        // Limpar timers
        if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
        }
        
        if (this.forceStopTimer) {
            clearTimeout(this.forceStopTimer);
            this.forceStopTimer = null;
        }
        
        // Parar reconhecimento de voz
        if (this.recognition) {
            this.recognition.stop();
        }
        
        // Atualizar interface - restaurar cor e texto original
        this.buttonText.textContent = 'Fazer Pergunta';
        this.voiceButton.style.backgroundColor = '#007bff';
        this.voiceButton.style.borderColor = '#007bff';
        this.voiceButton.classList.remove('recording');
        this.micIcon.classList.remove('recording');
        
        if (!this.statusMessage.textContent.includes('Pergunta:') && !this.statusMessage.textContent.includes('Falha')) {
            this.updateStatus('Gravação finalizada.');
        }
    }
    
    async processQuestion(question) {
        console.log('🔄 PROCESSANDO: Iniciando processQuestion com:', question);
        this.updateStatus('Processando sua pergunta...', 'processing');
        
        try {
            console.log('🔄 PROCESSANDO: Chamando callAI...');
            // Simular chamada para API de IA (substitua pela sua API real)
            const response = await this.callAI(question);
            console.log('🔄 PROCESSANDO: Resposta recebida:', response);
            
            this.updateStatus('Gerando resposta em áudio...', 'processing');
            
            console.log('🔄 PROCESSANDO: Chamando displayResponse...');
            // Exibir texto da resposta
            this.displayResponse(response);
            console.log('🔄 PROCESSANDO: Texto exibido no painel');
            
            console.log('🔄 PROCESSANDO: Chamando textToSpeech...');
            // Converter resposta para áudio
            await this.textToSpeech(response);
            console.log('Áudio gerado');
            
            this.updateStatus('Resposta pronta! Leia o texto ou clique no player para ouvir.', 'success');
            
        } catch (error) {
            console.error('Erro ao processar pergunta:', error);
            this.updateStatus('Erro ao processar sua pergunta. Tente novamente.', 'error');
        }
    }
    
    async callAI(question) {
        try {
            // Verificar se a API key está configurada
            if (this.aiConfig.apiKey === 'YOUR_API_KEY_HERE' || !this.aiConfig.apiKey) {
                return `🔧 **CONFIGURAÇÃO NECESSÁRIA**\n\nPara usar este aplicativo, você precisa configurar uma chave de API válida.\n\n📋 **Passos:**\n1. Abra o arquivo 'ai-config.js'\n2. Substitua 'YOUR_API_KEY_HERE' por sua chave real\n3. Salve o arquivo e recarregue a página\n\n📖 **Instruções completas:** Consulte o arquivo 'CONFIGURACAO_API.md'\n\n❓ **Sua pergunta foi:** "${question}"`;
            }
            
            // Usar a configuração de IA real
            return await this.aiConfig.processQuestion(question);
        } catch (error) {
            console.error('Erro na API de IA:', error);
            
            // Verificar tipos específicos de erro
            if (error.message.includes('401') || error.message.includes('Unauthorized')) {
                return `🔑 **ERRO DE AUTENTICAÇÃO**\n\nSua chave de API parece estar inválida ou expirada.\n\n🔧 **Solução:**\n1. Verifique se a chave em 'ai-config.js' está correta\n2. Gere uma nova chave se necessário\n3. Consulte 'CONFIGURACAO_API.md' para mais detalhes\n\n❓ **Sua pergunta foi:** "${question}"`;
            }
            
            if (error.message.includes('429') || error.message.includes('rate limit')) {
                return `⏱️ **LIMITE DE REQUISIÇÕES**\n\nMuitas requisições em pouco tempo.\n\n🔧 **Solução:**\nAguarde alguns minutos antes de tentar novamente.\n\n❓ **Sua pergunta foi:** "${question}"`;
            }
            
            // Erro genérico
            return `❌ **ERRO DE CONEXÃO**\n\nHouve um problema ao conectar com a IA.\n\n🔧 **Possíveis soluções:**\n• Verifique sua conexão com a internet\n• Confirme se a chave de API está correta\n• Consulte 'CONFIGURACAO_API.md' para ajuda\n\n❓ **Sua pergunta foi:** "${question}"\n\n🔍 **Detalhes técnicos:** ${error.message}`;
        }
    }
    
    async textToSpeech(text) {
        if ('speechSynthesis' in window) {
            return new Promise((resolve, reject) => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'pt-BR';
                utterance.rate = 0.9;
                utterance.pitch = 1;
                
                // Tentar encontrar uma voz em português
                const voices = speechSynthesis.getVoices();
                const portugueseVoice = voices.find(voice => 
                    voice.lang.includes('pt') || voice.lang.includes('BR')
                );
                
                if (portugueseVoice) {
                    utterance.voice = portugueseVoice;
                }
                
                utterance.onend = () => {
                    resolve();
                };
                
                utterance.onerror = (error) => {
                    console.error('Erro na síntese de voz:', error);
                    reject(error);
                };
                
                // Reproduzir através do speechSynthesis
                speechSynthesis.speak(utterance);
                
                // Mostrar controles de áudio (mesmo que seja speechSynthesis)
                if (this.audioPlayer) {
                    this.audioPlayer.style.display = 'block';
                }
            });
        } else {
            throw new Error('Síntese de voz não suportada');
        }
    }
    
    clearPreviousResponse() {
        // Limpar texto anterior e mostrar mensagem de aguardo
        this.responseText.textContent = 'Aguardando sua pergunta...';
        this.responseText.style.color = '#666';
        this.responseText.style.textAlign = 'center';
        this.responseText.style.fontStyle = 'italic';
        
        // Stop and reset audio if playing
        if (this.audioPlayer && typeof this.audioPlayer.pause === 'function') {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
            this.audioPlayer.src = '';
        }
    }
    
    displayResponse(responseText) {
        console.log('Exibindo resposta:', responseText);
        console.log('Elemento responseText:', this.responseText);
        
        // Exibir o texto da resposta
        this.responseText.textContent = responseText;
        this.responseText.style.color = '#333';
        this.responseText.style.textAlign = 'left';
        this.responseText.style.fontStyle = 'normal';
        
        console.log('Texto definido no elemento:', this.responseText.textContent);
        
        // Scroll suave para a resposta
        setTimeout(() => {
            this.responseContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
    }
    
    createAudioBlob(text) {
        // Para demonstração, vamos mostrar o player mesmo sem arquivo real
        // Em produção, você pode usar APIs como Google Text-to-Speech para gerar arquivos de áudio
        // O container já está visível através do displayResponse
        
        // Simular um arquivo de áudio (substitua por implementação real)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Configurar um tom simples como placeholder
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        
        // Não reproduzir automaticamente, apenas mostrar o controle
    }
    
    updateStatus(message, type = '') {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
    }
    
    // Método simplificado para detectar se houve fala
    checkForSpeech() {
        // Marcar que áudio foi detectado quando o reconhecimento funciona
        this.audioDetected = true;
    }
    
    handleSilentAudio() {
        this.stopRecording();
        
        // Exibir mensagem de falha no painel
        this.responseText.textContent = 'Falha na captura do áudio - Nenhum som foi detectado. Verifique se o microfone está funcionando e tente novamente.';
        this.responseText.style.color = '#dc3545';
        this.responseText.style.textAlign = 'center';
        this.responseText.style.fontStyle = 'normal';
        
        // Scroll para a resposta
        setTimeout(() => {
            this.responseContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
        
        this.updateStatus('Falha na captura do áudio.', 'error');
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Método para lidar com input de texto
    handleTextInput() {
        const inputValue = this.questionInput.value.trim();
        
        if (inputValue.length > 0) {
            // Mostrar botão "Enviar" quando começar a digitar
            this.sendButton.style.display = 'block';
            
            // Atualizar o painel da pergunta com o texto sendo digitado
            this.questionText.textContent = inputValue;
            this.questionText.style.color = '#333';
            this.questionText.style.textAlign = 'left';
            this.questionText.style.fontStyle = 'normal';
        } else {
            // Esconder botão "Enviar" quando não há texto
            this.sendButton.style.display = 'none';
            
            // Restaurar texto padrão
            this.questionText.textContent = 'Digite ou fale sua pergunta...';
            this.questionText.style.color = '#666';
            this.questionText.style.textAlign = 'center';
            this.questionText.style.fontStyle = 'italic';
        }
    }
    
    // Método para enviar pergunta por texto
    async sendTextQuestion() {
        const question = this.questionInput.value.trim();
        console.log('📝 TEXTO: Iniciando sendTextQuestion com:', question);
        
        if (!question) {
            this.updateStatus('Digite uma pergunta antes de enviar.', 'error');
            return;
        }
        
        // Limpar o input
        this.questionInput.value = '';
        this.sendButton.style.display = 'none';
        
        // Mostrar a pergunta final no painel
        this.questionText.textContent = question;
        this.questionText.style.color = '#333';
        this.questionText.style.textAlign = 'left';
        this.questionText.style.fontStyle = 'normal';
        
        console.log('📝 TEXTO: Chamando processQuestion com:', question);
        // Processar a pergunta (mesma lógica do áudio)
        await this.processQuestion(question);
    }
    
    // Método para atualizar o painel da pergunta durante gravação
    updateQuestionPanel(text) {
        this.questionText.textContent = text;
        this.questionText.style.color = '#333';
        this.questionText.style.textAlign = 'left';
        this.questionText.style.fontStyle = 'normal';
    }
}

// Inicializar a aplicação quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar carregamento das vozes do navegador
    if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = () => {
            console.log('Vozes carregadas:', speechSynthesis.getVoices().length);
        };
    }
    
    // Inicializar aplicação
    const app = new VoiceAI();
    
    // Verificar se está rodando no Facebook
    if (window.location.hostname.includes('facebook.com') || 
        window.navigator.userAgent.includes('FBAN') || 
        window.navigator.userAgent.includes('FBAV')) {
        console.log('Aplicação rodando no Facebook');
    }
});

// Service Worker para PWA (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registrado com sucesso:', registration);
            })
            .catch(registrationError => {
                console.log('Falha ao registrar SW:', registrationError);
            });
    });
}