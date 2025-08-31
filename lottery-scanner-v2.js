class LotteryScanner {
    constructor() {
        console.log('🏗️ Construtor LotteryScanner iniciado');
        
        try {
            this.initializeElements();
            this.bindEvents();
            
            this.scannedNumbers = {
                main: [],
                powerball: null
            };
            this.lastResults = null;
            
            console.log('✅ Construtor LotteryScanner concluído com sucesso');
        } catch (error) {
            console.error('❌ Erro no construtor LotteryScanner:', error);
            alert('ERRO: ' + error.message);
            throw error;
        }
    }

    initializeElements() {
        console.log('🔧 initializeElements() iniciado');
        
        // Elementos principais - verificar se existem antes de atribuir
        this.scanButton = document.getElementById('scanButton');
        if (!this.scanButton) {
            console.error('❌ ERRO CRÍTICO: scanButton não encontrado no DOM!');
            throw new Error('scanButton não encontrado no DOM');
        }
        console.log('✅ scanButton encontrado:', this.scanButton);
        
        this.scanText = document.getElementById('scanText');
        this.loadingSpinner = document.getElementById('loadingSpinner');
        this.imageInput = document.getElementById('imageInput');
        
        // Modal de números
        this.numbersModal = document.getElementById('numbersModal');
        if (!this.numbersModal) {
            console.error('❌ ERRO CRÍTICO: numbersModal não encontrado no DOM!');
            throw new Error('numbersModal não encontrado no DOM');
        }
        console.log('✅ numbersModal encontrado:', this.numbersModal);
        
        this.stateSelect = document.getElementById('stateSelect');
        this.checkNumbersBtn = document.getElementById('checkNumbersBtn');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        // Modal de resultados
        this.resultsModal = document.getElementById('resultsModal');
        this.resultsContent = document.getElementById('resultsContent');
        this.finishBtn = document.getElementById('finishBtn');
        
        console.log('✅ initializeElements() concluído - elementos críticos encontrados');
    }

    bindEvents() {
        console.log('🔗 bindEvents() iniciado');
        // Usar try-catch para cada elemento para evitar falhas
        try {
            console.log('🎯 Verificando scanButton:', this.scanButton);
            if (this.scanButton && this.scanButton.addEventListener) {
                console.log('✅ Anexando evento de clique ao scanButton');
                this.scanButton.addEventListener('click', () => {
                    console.log('🖱️ Clique detectado no scanButton!');
                    this.showConfigModal();
                });
                console.log('✅ Evento anexado com sucesso');
            } else {
                console.error('❌ scanButton não encontrado ou não tem addEventListener');
            }
        } catch (e) { 
            console.error('❌ scanButton event failed:', e); 
        }
        
        try {
            if (this.imageInput && this.imageInput.addEventListener) {
                this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
            }
        } catch (e) { console.warn('imageInput event failed:', e); }
        
        try {
            if (this.checkNumbersBtn && this.checkNumbersBtn.addEventListener) {
                this.checkNumbersBtn.addEventListener('click', () => this.checkNumbers());
            }
        } catch (e) { console.warn('checkNumbersBtn event failed:', e); }
        
        try {
            if (this.cancelBtn && this.cancelBtn.addEventListener) {
                this.cancelBtn.addEventListener('click', () => this.closeNumbersModal());
            }
        } catch (e) { console.warn('cancelBtn event failed:', e); }
        
        try {
            if (this.finishBtn && this.finishBtn.addEventListener) {
                this.finishBtn.addEventListener('click', () => this.finish());
            }
        } catch (e) { console.warn('finishBtn event failed:', e); }
        
        try {
            if (this.numbersModal && this.numbersModal.addEventListener) {
                this.numbersModal.addEventListener('click', (e) => {
                    if (e.target === this.numbersModal) {
                        this.closeNumbersModal();
                    }
                });
            }
        } catch (e) { console.warn('numbersModal event failed:', e); }
        
        try {
            if (this.resultsModal && this.resultsModal.addEventListener) {
                this.resultsModal.addEventListener('click', (e) => {
                    if (e.target === this.resultsModal) {
                        this.closeResultsModal();
                    }
                });
            }
        } catch (e) { console.warn('resultsModal event failed:', e); }
    }

    startScan() {
        alert('🚨 DEBUG: startScan() foi chamado!');
        console.log('🔍 startScan() chamado');
        
        try {
            alert('🚨 DEBUG: Tentando executar showLoading()');
            this.showLoading();
            alert('🚨 DEBUG: showLoading() executado com sucesso!');
            console.log('✅ showLoading() executado');
            
            // Detectar se é dispositivo móvel
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                            ('ontouchstart' in window) || 
                            (navigator.maxTouchPoints > 0);
            
            console.log('📱 Dispositivo móvel detectado:', isMobile);
            console.log('🌐 User Agent:', navigator.userAgent);
            
            if (isMobile) {
                console.log('📱 Executando tryCamera() para mobile');
                // No mobile, tentar usar a câmera diretamente
                this.tryCamera();
            } else {
                console.log('💻 Executando showDesktopOptions() para desktop');
                // No desktop, mostrar opções
                this.showDesktopOptions();
            }
        } catch (error) {
            console.error('❌ Erro em startScan():', error);
            this.hideLoading();
            this.showError('Erro ao iniciar scan: ' + error.message);
        }
    }
    
    async tryCamera() {
        console.log('📷 tryCamera() iniciado');
        try {
            console.log('🎥 Solicitando acesso à câmera...');
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                } 
            });
            console.log('✅ Acesso à câmera obtido');
            
            // Criar elemento de vídeo temporário
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            
            // Aguardar o vídeo carregar
            video.onloadedmetadata = () => {
                // Criar canvas para capturar frame
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                
                // Capturar frame
                ctx.drawImage(video, 0, 0);
                
                // Parar stream
                stream.getTracks().forEach(track => track.stop());
                
                // Converter para blob e processar
                canvas.toBlob(blob => {
                    this.processImage(blob);
                }, 'image/jpeg', 0.8);
            };
            
        } catch (error) {
            console.error('❌ Erro ao acessar câmera:', error);
            console.log('🔄 Fallback para showDesktopOptions()');
            this.showDesktopOptions();
        }
    }
    
    showDesktopOptions() {
        console.log('💻 showDesktopOptions() iniciado');
        this.hideLoading();
        console.log('✅ hideLoading() executado');
        
        // Criar modal de opções para desktop
        console.log('🔧 Criando modal de opções...');
        const optionsModal = document.createElement('div');
        optionsModal.className = 'modal';
        optionsModal.innerHTML = `
            <div class="modal-content desktop-options">
                <h2>Escolha uma opção</h2>
                <p>Como você gostaria de fornecer a imagem do cartão?</p>
                <div class="options-buttons">
                    <button id="useCamera" class="option-btn camera-btn">
                        📷 Usar Câmera
                    </button>
                    <button id="uploadFile" class="option-btn file-btn">
                        📁 Escolher Arquivo
                    </button>
                </div>
                <button id="cancelOptions" class="cancel-btn">Cancelar</button>
            </div>
        `;
        
        document.body.appendChild(optionsModal);
        
        // Eventos dos botões
        document.getElementById('useCamera').addEventListener('click', () => {
            document.body.removeChild(optionsModal);
            this.startCameraCapture();
        });
        
        document.getElementById('uploadFile').addEventListener('click', () => {
            document.body.removeChild(optionsModal);
            this.showLoading();
            setTimeout(() => {
                this.imageInput.click();
            }, 300);
        });
        
        document.getElementById('cancelOptions').addEventListener('click', () => {
            document.body.removeChild(optionsModal);
        });
        
        // Fechar clicando fora
        optionsModal.addEventListener('click', (e) => {
            if (e.target === optionsModal) {
                document.body.removeChild(optionsModal);
            }
        });
    }
    
    async startCameraCapture() {
        try {
            this.showLoading();
            this.scanText.textContent = 'Acessando câmera...';
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            this.showCameraModal(stream);
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            this.hideLoading();
            this.showError('Não foi possível acessar a câmera. Tente escolher um arquivo.');
        }
    }
    
    showCameraModal(stream) {
        const cameraModal = document.createElement('div');
        cameraModal.className = 'modal camera-modal';
        cameraModal.innerHTML = `
            <div class="modal-content camera-content">
                <h2>Posicione o cartão na câmera</h2>
                <div class="camera-container">
                    <video id="cameraVideo" autoplay playsinline></video>
                    <div class="camera-overlay">
                        <div class="scan-frame"></div>
                    </div>
                </div>
                <div class="camera-controls">
                    <button id="captureBtn" class="capture-btn">📸 Capturar</button>
                    <button id="closeCameraBtn" class="cancel-btn">Cancelar</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(cameraModal);
        
        const video = document.getElementById('cameraVideo');
        video.srcObject = stream;
        
        // Eventos dos botões
        document.getElementById('captureBtn').addEventListener('click', () => {
            this.captureImage(video, stream);
            document.body.removeChild(cameraModal);
        });
        
        document.getElementById('closeCameraBtn').addEventListener('click', () => {
            stream.getTracks().forEach(track => track.stop());
            document.body.removeChild(cameraModal);
            this.hideLoading();
        });
    }
    
    captureImage(video, stream) {
        console.log('🎥 captureImage() iniciado');
        console.log('🎥 Video dimensions:', video.videoWidth, 'x', video.videoHeight);
        
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            
            console.log('🎥 Canvas criado:', canvas.width, 'x', canvas.height);
            
            context.drawImage(video, 0, 0);
            console.log('✅ Imagem desenhada no canvas');
            
            // Parar o stream
            stream.getTracks().forEach(track => {
                console.log('🛑 Parando track:', track.kind);
                track.stop();
            });
            console.log('✅ Stream parado');
            
            // Converter para blob e processar
            console.log('🔄 Convertendo canvas para blob...');
            canvas.toBlob((blob) => {
                console.log('✅ Blob criado:', blob.size, 'bytes');
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                console.log('✅ File criado:', file.name, file.size, 'bytes');
                console.log('🚀 Chamando handleImageSelect...');
                this.handleImageSelect({ target: { files: [file] } });
            }, 'image/jpeg', 0.8);
        } catch (error) {
            console.error('❌ Erro em captureImage:', error);
            this.hideLoading();
            this.showError('Erro ao capturar imagem: ' + error.message);
        }
    }
    
    handleImageSelect(event) {
        console.log('📁 handleImageSelect() iniciado');
        console.log('📁 Event:', event);
        console.log('📁 Event.target:', event.target);
        console.log('📁 Files:', event.target.files);
        
        const file = event.target.files[0];
        console.log('📁 File selecionado:', file);
        
        if (file) {
            console.log('✅ File válido, iniciando processamento...');
            console.log('📁 File details:', {
                name: file.name,
                size: file.size,
                type: file.type,
                lastModified: file.lastModified
            });
            this.processImage(file);
        } else {
            console.log('❌ Nenhum arquivo selecionado');
            this.hideLoading();
        }
    }
    
    async processImage(imageFile) {
        console.log('🔍 processImage() iniciado');
        console.log('🔍 ImageFile:', imageFile);
        
        try {
            console.log('🚀 Iniciando processamento OCR com PaddleOCR...');
            this.showLoading();
            
            // Aguardar carregamento das bibliotecas
            await this.waitForLibraries();
            
            // Converter arquivo para dataURL
            const dataURL = await this.fileToDataURL(imageFile);
            console.log('✅ Imagem convertida para dataURL');
            
            // Executar OCR com Tesseract
            console.log('🔍 Iniciando OCR com Tesseract...');
            const { data: { text } } = await Tesseract.recognize(
                dataURL,
                'eng',
                {
                    logger: m => console.log('📊 Tesseract:', m)
                }
            );
            
            console.log('✅ OCR concluído. Texto extraído:', text);
            
            // Extrair números do texto
            const extractedNumbers = this.extractNumbersAlternative(text);
            console.log('🔢 Números extraídos:', extractedNumbers);
            
            if (extractedNumbers.length === 0) {
                this.hideLoading();
                this.showError('Nenhum número foi detectado na imagem. Tente uma foto mais clara.');
                return;
            }
            
            // Organizar números em fileiras
            const rows = this.organizeIntoRows(extractedNumbers);
            console.log('Fileiras organizadas:', rows);
            
            this.hideLoading();
            this.displayMultipleRows(rows);
            
        } catch (error) {
            console.error('Erro no processamento:', error);
            this.hideLoading();
            this.showError('Erro ao processar a imagem. Tente novamente.');
        }
    }
    
    async waitForLibraries() {
        console.log('📚 waitForLibraries() iniciado');
        console.log('📚 Verificando bibliotecas disponíveis:');
        console.log('  - window.cv:', !!window.cv);
        console.log('  - window.Tesseract:', !!window.Tesseract);
        
        let attempts = 0;
        const maxAttempts = 100; // 10 segundos máximo
        
        // Aguardar carregamento do OpenCV
        while (!window.cv || !window.cv.Mat) {
            attempts++;
            console.log(`⏳ Aguardando OpenCV carregar... (tentativa ${attempts}/${maxAttempts})`);
            if (attempts > maxAttempts) {
                throw new Error('Timeout: OpenCV não carregou em 10 segundos');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log('✅ OpenCV carregado!');
        
        // Aguardar carregamento do Tesseract
        attempts = 0;
        while (!window.Tesseract) {
            attempts++;
            console.log(`⏳ Aguardando Tesseract carregar... (tentativa ${attempts}/${maxAttempts})`);
            if (attempts > maxAttempts) {
                throw new Error('Timeout: Tesseract não carregou em 10 segundos');
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log('✅ Tesseract carregado!');
        
        console.log('🎉 Todas as bibliotecas carregadas com sucesso!');
    }
    
    fileToDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    extractNumbersAlternative(text) {
        console.log('Texto original:', text);
        
        // Primeiro, limpar e normalizar o texto
        let cleanText = text
            // Substituições de caracteres OCR comuns
            .replace(/[Oo]/g, '0')
            .replace(/[Il|]/g, '1')
            .replace(/[Ss]/g, '5')
            .replace(/[Zz]/g, '2')
            .replace(/[Bb]/g, '6')
            .replace(/[Gg]/g, '6')
            .replace(/[Tt]/g, '7')
            .replace(/[Aa]/g, '4')
            .replace(/[Ee]/g, '8')
            .replace(/[Qq]/g, '9')
            // Padrões específicos do gabarito
            .replace(/03/g, '3')   // "03" vira "3"
            .replace(/04/g, '4')   // "04" vira "4"
            .replace(/05/g, '5')   // "05" vira "5"
            .replace(/06/g, '6')   // "06" vira "6"
            .replace(/07/g, '7')   // "07" vira "7"
            .replace(/08/g, '8')   // "08" vira "8"
            .replace(/09/g, '9')   // "09" vira "9"
            // Remover pontuações e normalizar espaços
            .replace(/[.,;:!?()\[\]{}"'`~@#$%^&*+=<>\/\\|]/g, ' ')
            .replace(/[-_]/g, ' ')  // Hífens e underscores viram espaços
            .replace(/\s+/g, ' ')
            .trim();
        
        console.log('Texto limpo:', cleanText);
        
        // Padrões OCR expandidos para extrair números
        const ocrPatterns = [
            // Padrões específicos do gabarito (com e sem zero à esquerda)
            /\b0?([1-9])\b/g,       // "01", "02", etc. -> "1", "2", etc.
            /\b([1-6]?[0-9])\b/g,   // Números de 1-69
            /\b([1-2]?[0-6])\b/g,   // Números de 1-26 (Powerball)
            
            // Padrões genéricos expandidos
            /AW\s*(\d+)/gi,         // "AW 13"
            /&(\d+)/gi,             // "&850"
            /(\d+)\s*A/gi,          // "13 A"
            /O\s*(\d+)/gi,          // "O 03"
            /(\d+)\s*[ABCDEFGHIJKLMNOPQRSTUVWXYZ]/gi, // Número seguido de letra
            /[ABCDEFGHIJKLMNOPQRSTUVWXYZ]\s*(\d+)/gi, // Letra seguida de número
            /(\d+)E/gi,             // "80E"
            /B(\d+)/gi,             // "B2"
            /%(\d+)/gi,             // "%69"
            /(\d+)\s*[Oo]/gi,       // "13 oo", "1 O"
            /[Oo]\s*(\d+)/gi,       // "O 03"
            /e\s*(\d+)/gi,          // "e 8"
            /LG\s*&(\d+)/gi,        // "LG &850"
            /Aug(\d+)/gi,           // "Aug23"
            /§(\d+)/gi,             // "§15"
            /(\d+)\s*[A-Z]/gi,      // "13 A", "6 B"
            /[A-Z]\s*(\d+)/gi,      // "A 13", "B 6"
            /\*(\d+)/gi,            // "*42"
            /(\d+)\*/gi,            // "42*"
            /\+(\d+)/gi,            // "+15"
            /(\d+)\+/gi,            // "15+"
            /=(\d+)/gi,             // "=23"
            /(\d+)=/gi,             // "23="
            /\$(\d+)/gi,            // "$45"
            /(\d+)\$/gi,            // "45$"
            /\#(\d+)/gi,            // "#67"
            /(\d+)\#/gi,            // "67#"
            /\((\d+)\)/gi,          // "(12)"
            /\[(\d+)\]/gi,          // "[34]"
            /\{(\d+)\}/gi,          // "{56}"
            /"(\d+)"/gi,           // ""78""
            /'(\d+)'/gi,            // "'90'"
            /`(\d+)`/gi,            // "`12`"
            /~(\d+)/gi,             // "~34"
            /(\d+)~/gi,             // "34~"
            /@(\d+)/gi,             // "@56"
            /(\d+)@/gi,             // "56@"
            /\^(\d+)/gi,            // "^78"
            /(\d+)\^/gi,            // "78^"
            /\|(\d+)/gi,            // "|90"
            /(\d+)\|/gi,            // "90|"
            /\\(\d+)/gi,           // "\12"
            /(\d+)\\/gi,           // "12\\"
            /\/(\d+)/gi,            // "/34"
            /(\d+)\//gi,            // "34/"
            /<(\d+)/gi,             // "<56"
            /(\d+)>/gi,             // "56>"
            /\?(\d+)/gi,            // "?78"
            /(\d+)\?/gi,            // "78?"
            /!(\d+)/gi,             // "!90"
            /(\d+)!/gi,             // "90!"
            /:(\d+)/gi,             // ":12"
            /(\d+):/gi,             // "12:"
            /;(\d+)/gi,             // ";34"
            /(\d+);/gi,             // "34;"
            /,(\d+)/gi,             // ",56"
            /(\d+),/gi,             // "56,"
            /\.(\d+)/gi,            // ".78"
            /(\d+)\./gi,            // "78."
            /\s(\d+)\s/gi,          // Números isolados por espaços
            /^(\d+)/gi,             // Números no início da linha
            /(\d+)$/gi,             // Números no final da linha
            /\b(\d+)\b/gi           // Qualquer número como palavra completa
        ];
        
        const numbers = new Set();
        
        // Aplicar todos os padrões
        ocrPatterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(cleanText)) !== null) {
                const num = parseInt(match[1] || match[0]);
                if (!isNaN(num)) {
                    // Filtrar números válidos para Powerball (1-69 para principais, 1-26 para Powerball)
                    if (num >= 1 && num <= 69) {
                        numbers.add(num);
                    }
                }
            }
        });
        
        const result = Array.from(numbers).sort((a, b) => a - b);
        console.log('Números finais extraídos:', result);
        return result;
    }
    
    organizeIntoRows(numbers) {
        // Organizar números em grupos de 5 + 1 Powerball
        const rows = [];
        
        // Se temos números suficientes, tentar criar fileiras completas
        if (numbers.length >= 6) {
            for (let i = 0; i <= numbers.length - 6; i += 6) {
                const mainNumbers = numbers.slice(i, i + 5).sort((a, b) => a - b);
                const powerball = numbers[i + 5];
                
                // Validar se os números principais estão no range correto (1-69)
                const validMainNumbers = mainNumbers.filter(n => n >= 1 && n <= 69);
                // Validar se o Powerball está no range correto (1-26)
                const validPowerball = powerball >= 1 && powerball <= 26 ? powerball : null;
                
                if (validMainNumbers.length === 5) {
                    rows.push({
                        mainNumbers: validMainNumbers,
                        powerball: validPowerball
                    });
                }
            }
        }
        
        // Se não conseguimos criar fileiras completas, tentar criar com os números disponíveis
        if (rows.length === 0 && numbers.length >= 5) {
            const mainNumbers = numbers.slice(0, 5).filter(n => n >= 1 && n <= 69).sort((a, b) => a - b);
            const powerball = numbers.length > 5 ? numbers.find(n => n >= 1 && n <= 26 && !mainNumbers.includes(n)) : null;
            
            if (mainNumbers.length >= 5) {
                rows.push({
                    mainNumbers: mainNumbers.slice(0, 5),
                    powerball: powerball
                });
            }
        }
        
        // Se ainda não temos fileiras, criar uma fileira parcial
        if (rows.length === 0 && numbers.length > 0) {
            const validNumbers = numbers.filter(n => n >= 1 && n <= 69).sort((a, b) => a - b);
            if (validNumbers.length > 0) {
                rows.push({
                    mainNumbers: validNumbers.slice(0, Math.min(5, validNumbers.length)),
                    powerball: null
                });
            }
        }
        
        return rows.slice(0, 5); // Máximo 5 fileiras
    }
    
    displayMultipleRows(rows) {
        if (rows.length === 0) {
            this.showError('Nenhuma fileira válida foi detectada.');
            return;
        }
        
        // Limpar conteúdo anterior
        const modalContent = this.numbersModal.querySelector('.modal-content');
        const existingRows = modalContent.querySelector('.detected-rows');
        if (existingRows) {
            existingRows.remove();
        }
        
        // Criar seção para as fileiras detectadas
        const rowsSection = document.createElement('div');
        rowsSection.className = 'detected-rows';
        rowsSection.innerHTML = `
            <h3>Fileiras Detectadas (${rows.length})</h3>
            <p>Verifique e edite os números se necessário:</p>
        `;
        
        rows.forEach((row, index) => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'number-row';
            rowDiv.innerHTML = `
                <div class="row-label">Fileira ${String.fromCharCode(65 + index)}:</div>
                <div class="main-numbers">
                    ${row.mainNumbers.map((num, i) => 
                        `<input type="number" class="number-input main-number" 
                                data-row="${index}" data-position="${i}" 
                                value="${num}" min="1" max="69">`
                    ).join('')}
                    ${Array(5 - row.mainNumbers.length).fill().map((_, i) => 
                        `<input type="number" class="number-input main-number" 
                                data-row="${index}" data-position="${row.mainNumbers.length + i}" 
                                value="" min="1" max="69" placeholder="?"`
                    ).join('')}
                </div>
                <div class="powerball-section">
                    <label>Powerball:</label>
                    <input type="number" class="number-input powerball-number" 
                           data-row="${index}" 
                           value="${row.powerball || ''}" min="1" max="26" placeholder="?">
                </div>
            `;
            rowsSection.appendChild(rowDiv);
        });
        
        // Inserir antes da seção de estado
        const stateSection = modalContent.querySelector('.state-section');
        modalContent.insertBefore(rowsSection, stateSection);
        
        // Adicionar validação aos inputs criados dinamicamente
        this.addInputValidation();
        
        this.showNumbersModal();
    }
    
    addInputValidation() {
        const numberInputs = this.numbersModal.querySelectorAll('.number-input');
        
        numberInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                const min = parseInt(e.target.min);
                const max = parseInt(e.target.max);
                
                if (value < min || value > max) {
                    e.target.style.borderColor = '#ff4444';
                    e.target.title = `Valor deve estar entre ${min} e ${max}`;
                } else {
                    e.target.style.borderColor = '#ddd';
                    e.target.title = '';
                }
            });
            
            input.addEventListener('blur', (e) => {
                const value = parseInt(e.target.value);
                const min = parseInt(e.target.min);
                const max = parseInt(e.target.max);
                
                if (e.target.value && (value < min || value > max)) {
                    e.target.value = '';
                    e.target.style.borderColor = '#ddd';
                }
            });
        });
    }
    
    checkNumbers() {
        const state = this.stateSelect.value;
        if (!state) {
            alert('Por favor, selecione um estado.');
            return;
        }
        
        // Coletar números das fileiras
        const rows = [];
        const rowElements = this.numbersModal.querySelectorAll('.number-row');
        
        rowElements.forEach((rowElement, index) => {
            const mainInputs = rowElement.querySelectorAll('.main-number');
            const powerballInput = rowElement.querySelector('.powerball-number');
            
            const mainNumbers = [];
            mainInputs.forEach(input => {
                const value = parseInt(input.value);
                if (!isNaN(value) && value >= 1 && value <= 69) {
                    mainNumbers.push(value);
                }
            });
            
            const powerball = parseInt(powerballInput.value);
            const validPowerball = !isNaN(powerball) && powerball >= 1 && powerball <= 26 ? powerball : null;
            
            if (mainNumbers.length > 0) {
                rows.push({
                    label: String.fromCharCode(65 + index),
                    mainNumbers: mainNumbers.sort((a, b) => a - b),
                    powerball: validPowerball
                });
            }
        });
        
        if (rows.length === 0) {
            alert('Por favor, preencha pelo menos uma fileira com números válidos.');
            return;
        }
        
        this.closeNumbersModal();
        this.showLoading();
        
        // Simular verificação (aqui você faria a chamada real para a API)
        setTimeout(() => {
            this.hideLoading();
            this.displayResults(rows, state);
        }, 2000);
    }
    
    displayResults(rows, state) {
        let resultsHTML = `
            <div class="results-header">
                <h3>Resultados para ${state}</h3>
                <p class="results-date">Último sorteio: 28 de Agosto de 2024</p>
            </div>
            
            <div class="winning-numbers">
                <h4>Números Sorteados:</h4>
                <div class="numbers-display">
                    <div class="main-numbers-display">
                        <span class="number">02</span>
                        <span class="number">03</span>
                        <span class="number">08</span>
                        <span class="number">11</span>
                        <span class="number">13</span>
                    </div>
                    <div class="powerball-display">
                        <span class="powerball">04</span>
                    </div>
                </div>
            </div>
            
            <div class="your-results">
                <h4>Suas Fileiras:</h4>
        `;
        
        rows.forEach(row => {
            const matches = this.checkMatches(row.mainNumbers, row.powerball, [2, 3, 8, 11, 13], 4);
            const prize = this.calculatePrize(matches.mainMatches, matches.powerballMatch);
            
            resultsHTML += `
                <div class="result-row ${matches.mainMatches >= 3 || matches.powerballMatch ? 'winner' : ''}">
                    <div class="row-header">
                        <span class="row-label">Fileira ${row.label}:</span>
                        <span class="match-info">${matches.mainMatches} acertos${matches.powerballMatch ? ' + Powerball' : ''}</span>
                    </div>
                    <div class="row-numbers">
                        <div class="main-numbers-result">
                            ${row.mainNumbers.map(num => {
                                const isMatch = [2, 3, 8, 11, 13].includes(num);
                                return `<span class="number ${isMatch ? 'match' : ''}">${num.toString().padStart(2, '0')}</span>`;
                            }).join('')}
                        </div>
                        <div class="powerball-result">
                            ${row.powerball ? 
                                `<span class="powerball ${row.powerball === 4 ? 'match' : ''}">${row.powerball.toString().padStart(2, '0')}</span>` : 
                                '<span class="powerball empty">--</span>'
                            }
                        </div>
                    </div>
                    ${prize ? `<div class="prize">🎉 Prêmio: ${prize}</div>` : ''}
                </div>
            `;
        });
        
        resultsHTML += `
            </div>
            
            <div class="summary">
                <p><strong>Resumo:</strong> ${rows.filter(row => {
                    const matches = this.checkMatches(row.mainNumbers, row.powerball, [2, 3, 8, 11, 13], 4);
                    return matches.mainMatches >= 3 || matches.powerballMatch;
                }).length} fileira(s) premiada(s) de ${rows.length} verificada(s).</p>
            </div>
        `;
        
        this.resultsContent.innerHTML = resultsHTML;
        this.showResultsModal();
        
        // Salvar resultados
        this.lastResults = { rows, state, winningNumbers: [2, 3, 8, 11, 13], powerball: 4 };
    }
    
    checkMatches(userMainNumbers, userPowerball, winningMainNumbers, winningPowerball) {
        const mainMatches = userMainNumbers.filter(num => winningMainNumbers.includes(num)).length;
        const powerballMatch = userPowerball === winningPowerball;
        
        return { mainMatches, powerballMatch };
    }
    
    calculatePrize(mainMatches, powerballMatch) {
        if (mainMatches === 5 && powerballMatch) return 'JACKPOT!';
        if (mainMatches === 5) return '$1,000,000';
        if (mainMatches === 4 && powerballMatch) return '$50,000';
        if (mainMatches === 4) return '$100';
        if (mainMatches === 3 && powerballMatch) return '$100';
        if (mainMatches === 3) return '$7';
        if (mainMatches === 2 && powerballMatch) return '$7';
        if (mainMatches === 1 && powerballMatch) return '$4';
        if (powerballMatch) return '$4';
        return null;
    }
    
    showConfigModal() {
        // Criar modal de configuração
        const configModal = document.createElement('div');
        configModal.className = 'modal';
        configModal.innerHTML = `
            <div class="modal-content">
                <h2>Configuração do Scanner</h2>
                <p>Selecione o estado antes de escanear:</p>
                
                <div class="state-section">
                    <label for="configStateSelect">Estado:</label>
                    <select id="configStateSelect">
                        <option value="">Selecione um estado</option>
                        <option value="AL">Alabama</option>
                        <option value="AZ">Arizona</option>
                        <option value="AR">Arkansas</option>
                        <option value="CA">California</option>
                        <option value="CO">Colorado</option>
                        <option value="CT">Connecticut</option>
                        <option value="DE">Delaware</option>
                        <option value="FL">Florida</option>
                        <option value="GA">Georgia</option>
                        <option value="ID">Idaho</option>
                        <option value="IL">Illinois</option>
                        <option value="IN">Indiana</option>
                        <option value="IA">Iowa</option>
                        <option value="KS">Kansas</option>
                        <option value="KY">Kentucky</option>
                        <option value="LA">Louisiana</option>
                        <option value="ME">Maine</option>
                        <option value="MD">Maryland</option>
                        <option value="MA">Massachusetts</option>
                        <option value="MI">Michigan</option>
                        <option value="MN">Minnesota</option>
                        <option value="MS">Mississippi</option>
                        <option value="MO">Missouri</option>
                        <option value="MT">Montana</option>
                        <option value="NE">Nebraska</option>
                        <option value="NH">New Hampshire</option>
                        <option value="NJ">New Jersey</option>
                        <option value="NM">New Mexico</option>
                        <option value="NY">New York</option>
                        <option value="NC">North Carolina</option>
                        <option value="ND">North Dakota</option>
                        <option value="OH">Ohio</option>
                        <option value="OK">Oklahoma</option>
                        <option value="OR">Oregon</option>
                        <option value="PA">Pennsylvania</option>
                        <option value="RI">Rhode Island</option>
                        <option value="SC">South Carolina</option>
                        <option value="SD">South Dakota</option>
                        <option value="TN">Tennessee</option>
                        <option value="TX">Texas</option>
                        <option value="UT">Utah</option>
                        <option value="VT">Vermont</option>
                        <option value="VA">Virginia</option>
                        <option value="WA">Washington</option>
                        <option value="WV">West Virginia</option>
                        <option value="WI">Wisconsin</option>
                        <option value="WY">Wyoming</option>
                    </select>
                </div>
                
                <div class="modal-buttons">
                    <button class="cancel-btn" onclick="this.closest('.modal').remove()">Cancelar</button>
                    <button class="primary-btn" onclick="window.lotteryScanner.startScanFromConfig()">Iniciar Scan</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(configModal);
    }

    startScanFromConfig() {
        const configStateSelect = document.getElementById('configStateSelect');
        const selectedState = configStateSelect ? configStateSelect.value : '';
        
        if (!selectedState) {
            alert('Por favor, selecione um estado antes de continuar.');
            return;
        }
        
        // Salvar o estado selecionado
        if (this.stateSelect) {
            this.stateSelect.value = selectedState;
        }
        
        // Fechar o modal de configuração
        const configModal = document.querySelector('.modal');
        if (configModal) {
            configModal.remove();
        }
        
        // Iniciar o scan
        this.startScan();
    }

    showNumbersModal() {
        this.numbersModal.classList.remove('hidden');
    }

    closeNumbersModal() {
        this.numbersModal.classList.add('hidden');
    }

    showResultsModal() {
        this.resultsModal.classList.remove('hidden');
    }

    closeResultsModal() {
        this.resultsModal.classList.add('hidden');
    }
    
    showLoading() {
        this.scanText.classList.add('hidden');
        this.loadingSpinner.classList.remove('hidden');
        this.scanButton.disabled = true;
    }
    
    hideLoading() {
        this.scanText.classList.remove('hidden');
        this.loadingSpinner.classList.add('hidden');
        this.scanButton.disabled = false;
        this.scanText.textContent = 'SCAN';
        this.imageInput.value = '';
    }
    
    finish() {
        this.closeResultsModal();
        // Reset para permitir novo escaneamento
        this.imageInput.value = '';
    }
    
    showError(message) {
        alert(message);
    }
}

// Inicializar o aplicativo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, waiting before initializing LotteryScanner...');
    
    // Verificar se elementos críticos existem
    const scanButton = document.getElementById('scanButton');
    const numbersModal = document.getElementById('numbersModal');
    
    console.log('🔍 Verificando elementos críticos:');
    console.log('  - scanButton:', !!scanButton, scanButton);
    console.log('  - numbersModal:', !!numbersModal, numbersModal);
    
    if (!scanButton) {
        console.error('❌ ERRO CRÍTICO: scanButton não encontrado!');
        alert('ERRO: Botão SCAN não encontrado no DOM');
        return;
    }
    
    if (!numbersModal) {
        console.error('❌ ERRO CRÍTICO: numbersModal não encontrado!');
        alert('ERRO: Modal de números não encontrado no DOM');
        return;
    }
    
    setTimeout(() => {
        try {
            console.log('🏗️ Initializing LotteryScanner v2...');
            window.lotteryScanner = new LotteryScanner();
            console.log('✅ LotteryScanner v2 initialized successfully and stored in window.lotteryScanner');
            console.log('🎯 Instância criada:', window.lotteryScanner);
        } catch (error) {
            console.error('❌ Error initializing LotteryScanner v2:', error);
            console.error('❌ Stack trace:', error.stack);
            alert('ERRO na inicialização: ' + error.message + '\n\nVeja o console para mais detalhes.');
        }
    }, 100);
});

// Service Worker desabilitado para evitar popup de instalação PWA
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/lottery-scanner-sw.js')
//             .then(registration => {
//                 console.log('SW registrado com sucesso:', registration);
//             })
//             .catch(registrationError => {
//                 console.log('Falha no registro do SW:', registrationError);
//             });
//     });
// }