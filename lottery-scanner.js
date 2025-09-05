// Lottery Scanner - Versão Limpa usando APENAS Trae AI OCR
// Remove todas as configurações antigas e pós-processamentos

class LotteryScanner {
    constructor() {
            this.scannedNumbers = null;
            console.log('🔍 DEBUG - Constructor chamado');
            console.log('DOM readyState:', document.readyState);
            console.log('Elementos no DOM no momento da construção:');
            console.log('- previewImage existe:', !!document.getElementById('previewImage'));
            console.log('- previewContainer existe:', !!document.getElementById('previewContainer'));
            this.initializeElements();
        }

    showCameraModal(stream) {
        // Criar modal da câmera
        const cameraModal = document.createElement('div');
        cameraModal.id = 'cameraModal';
        cameraModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;

        // Criar vídeo para preview
        const video = document.createElement('video');
        video.style.cssText = `
            max-width: 90%;
            max-height: 70%;
            border-radius: 10px;
        `;
        video.autoplay = true;
        video.playsInline = true;
        video.srcObject = stream;

        // Criar botões
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            margin-top: 20px;
            display: flex;
            gap: 20px;
        `;

        const captureBtn = document.createElement('button');
        captureBtn.textContent = '📸 Capturar';
        captureBtn.style.cssText = `
            padding: 15px 30px;
            font-size: 18px;
            background: #4CAF50;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
        `;

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '❌ Cancelar';
        cancelBtn.style.cssText = `
            padding: 15px 30px;
            font-size: 18px;
            background: #f44336;
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
        `;

        // Event listeners
        captureBtn.addEventListener('click', () => {
            this.capturePhoto(video, stream, cameraModal);
        });

        cancelBtn.addEventListener('click', () => {
            this.closeCameraModal(stream, cameraModal);
        });

        // Montar modal
        buttonContainer.appendChild(captureBtn);
        buttonContainer.appendChild(cancelBtn);
        cameraModal.appendChild(video);
        cameraModal.appendChild(buttonContainer);
        document.body.appendChild(cameraModal);
    }

    capturePhoto(video, stream, modal) {
        // Criar canvas para capturar a imagem
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        // Definir dimensões do canvas
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Desenhar frame atual do vídeo no canvas
        context.drawImage(video, 0, 0);
        
        // Converter para blob
        canvas.toBlob((blob) => {
            // Criar arquivo a partir do blob
            const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
            
            // Fechar modal da câmera
            this.closeCameraModal(stream, modal);
            
            // Processar imagem capturada
            this.handleImageFile(file);
        }, 'image/jpeg', 0.9);
    }

    closeCameraModal(stream, modal) {
        // Parar stream da câmera
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        
        // Remover modal
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }

    async handleImageFile(file) {
        if (!file) return;
        
        try {
            this.showLoading();
            const numbers = await this.performOCR(file);
            this.hideLoading();
            
            if (numbers && numbers.length > 0) {
                this.showNumbersModal(numbers);
            } else {
                this.showError('Nenhum número foi encontrado na imagem. Tente uma imagem mais clara.');
            }
        } catch (error) {
            this.hideLoading();
            console.error('Erro ao processar imagem:', error);
            this.showError('Erro ao processar a imagem: ' + error.message);
        }
    }

    initializeElements() {
        let attempts = 0;
        const maxAttempts = 20; // Máximo 20 tentativas (1 segundo)
        
        // Função para aguardar elementos estarem disponíveis
        const waitForElements = () => {
            attempts++;
            
            // Elementos principais - IDs corretos do HTML
            this.fileInput = document.getElementById('imageInput');
            this.uploadButton = document.getElementById('fileOption') || document.getElementById('scanButton');
            this.cameraButton = document.getElementById('cameraOption');
            this.loadingSpinner = document.getElementById('loadingSpinner');
            this.numbersModal = document.getElementById('numbersModal');
            this.closeModalButton = document.getElementById('cancelBtn');
            this.checkNumbersBtn = document.getElementById('checkNumbersBtn');
            this.resultsModal = document.getElementById('resultsModal');
            this.finishBtn = document.getElementById('finishBtn');
            
            // Inputs de números - usando classes do HTML
            this.numberInputs = document.querySelectorAll('.number-input');
            this.powerballInput = document.querySelector('.powerball-input');
            this.stateSelect = document.getElementById('stateSelect');
            
            // DEBUG: Verificar elementos de preview durante inicialização
            console.log('🔍 DEBUG - Inicializando elementos de preview...');
            
            // Elementos de preview de imagem
            this.previewImage = document.getElementById('previewImage');
            this.previewContainer = document.getElementById('previewContainer');
            
            console.log('DEBUG - Após inicialização:');
            console.log('this.previewImage:', this.previewImage);
            console.log('this.previewContainer:', this.previewContainer);
            console.log('Elemento previewImage no DOM:', document.getElementById('previewImage'));
            console.log('Elemento previewContainer no DOM:', document.getElementById('previewContainer'));
            
            // Verificar se elementos essenciais foram encontrados ou se excedeu tentativas
            if ((this.fileInput && this.uploadButton) || attempts >= maxAttempts) {
                if (this.fileInput && this.uploadButton) {
                    console.log('✅ Elementos principais encontrados');
                } else {
                    console.log('⚠️ Elementos não encontrados após', maxAttempts, 'tentativas. Continuando sem alguns elementos.');
                }
                this.setupEventListeners();
            } else {
                console.log('⏳ Aguardando elementos... (tentativa', attempts + '/' + maxAttempts + ')', {
                    fileInput: !!this.fileInput,
                    uploadButton: !!this.uploadButton
                });
                setTimeout(waitForElements, 50);
            }
        };
        
        waitForElements();
    }

    setupEventListeners() {
        // Verificações de null para evitar erros intermitentes
        if (!this.fileInput) {
            console.error('Elemento fileInput não encontrado');
            return;
        }
        
        if (!this.uploadButton) {
            console.warn('Elemento uploadButton não encontrado, alguns recursos podem não funcionar');
        }
        
        // Botão principal de scan (se existir)
        if (this.uploadButton) {
            this.uploadButton.addEventListener('click', () => this.fileInput.click());
        }
        
        // Botão de câmera (se existir)
        if (this.cameraButton) {
            this.cameraButton.addEventListener('click', () => this.openCamera());
        }
        
        // Input de arquivo
        this.fileInput.addEventListener('change', (e) => this.handleImageSelect(e));
        
        // Botões do modal de números (com verificação)
        if (this.closeModalButton) {
            this.closeModalButton.addEventListener('click', () => this.closeNumbersModal());
        }
        if (this.checkNumbersBtn) {
            this.checkNumbersBtn.addEventListener('click', () => this.checkNumbers());
        }
        
        // Botão do modal de resultados (com verificação)
        if (this.finishBtn) {
            this.finishBtn.addEventListener('click', () => this.closeResultsModal());
        }
        
        // Fechar modal clicando fora (com verificação)
        if (this.numbersModal) {
            this.numbersModal.addEventListener('click', (e) => {
                if (e.target === this.numbersModal) {
                    this.closeNumbersModal();
                }
            });
        }
    }

    async openCamera() {
        try {
            // Verificar se o navegador suporta getUserMedia
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                this.showError('Câmera não suportada neste navegador');
                return;
            }

            // Solicitar acesso à câmera
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } // Preferir câmera traseira
            });

            // Criar modal para câmera
            this.showCameraModal(stream);
        } catch (error) {
            console.error('Erro ao acessar câmera:', error);
            if (error.name === 'NotAllowedError') {
                this.showError('Acesso à câmera negado. Permita o acesso para usar esta funcionalidade.');
            } else if (error.name === 'NotFoundError') {
                this.showError('Nenhuma câmera encontrada no dispositivo.');
            } else {
                this.showError('Erro ao acessar câmera: ' + error.message);
            }
        }
    }

    async handleImageSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('🖼️ Imagem selecionada:', file.name);
        
        try {
            this.showLoading();
            this.hideError();
            
            // DEBUG: Verificar se elementos de preview existem
            console.log('🔍 DEBUG - Elementos de preview:');
            console.log('this.previewImage:', this.previewImage);
            console.log('this.previewContainer:', this.previewContainer);
            console.log('previewImage existe no DOM:', document.getElementById('previewImage'));
            console.log('previewContainer existe no DOM:', document.getElementById('previewContainer'));
            
            // Mostrar preview da imagem
            const imageUrl = URL.createObjectURL(file);
            if (this.previewImage && this.previewContainer) {
                this.previewImage.src = imageUrl;
                this.previewContainer.classList.remove('hidden');
                console.log('✅ Preview configurado com sucesso');
            } else {
                console.error('❌ Elementos de preview não encontrados:', {
                    previewImage: this.previewImage,
                    previewContainer: this.previewContainer
                });
            }
            
            console.log('🚀 Iniciando OCR Trae AI...');
            
            // Usar APENAS o OCR Trae AI - sem modificações
            const numbers = await this.performOCR(file);
            
            if (numbers && numbers.success && numbers.rows) {
                console.log('✅ OCR concluído com sucesso:', numbers);
                this.scannedNumbers = numbers;
                this.populateNumbersModal(numbers);
                this.showNumbersModal(numbers);
                console.log('✅ Modal de números exibido');
            } else {
                console.log('❌ Nenhum número detectado');
                this.showError('Não foi possível reconhecer os números. Tente novamente.');
            }
        } catch (error) {
            console.error('❌ Erro no processamento:', error);
            this.showError(`Erro ao processar a imagem: ${error.message}. Tente novamente.`);
        } finally {
            this.hideLoading();
        }
    }

    async performOCR(file) {
        try {
            console.log('🚀 performOCR iniciado - usando método Trae AI');
            
            // Usar APENAS o OCR do Trae AI - sem pós-processamento
            console.log('🔍 Usando OCR baseado no método Trae AI...');
            
            // Importar e usar o novo OCR
            const traeAiOcr = await import('./trae-ai-ocr.js');
            const numbers = await traeAiOcr.performTraeAiOCR(file);
            
            console.log('✅ OCR Trae AI concluído - dados puros:', numbers);
            
            // Retornar dados EXATAMENTE como o Trae AI fornece
            return numbers;
        } catch (error) {
            console.error('❌ Erro no OCR Trae AI:', error);
            throw error;
        }
    }

    populateNumbersModal(numbers) {
        // Usar apenas os dados puros do Trae AI
        if (numbers.rows) {
            console.log('📋 Populando modal com dados puros do Trae AI:', numbers.rows);
            
            // Se há múltiplas fileiras, usar a primeira para os inputs principais
            const firstRowKey = Object.keys(numbers.rows)[0];
            if (firstRowKey && numbers.rows[firstRowKey]) {
                const firstRow = numbers.rows[firstRowKey];
                
                // Preencher números principais
                if (Array.isArray(this.numberInputs) && firstRow.numbers) {
                    this.numberInputs.forEach((input, index) => {
                        if (firstRow.numbers[index] && input) {
                            input.value = firstRow.numbers[index];
                        }
                    });
                }
                
                // Preencher powerball
                if (firstRow.powerball && this.powerballInput) {
                    this.powerballInput.value = firstRow.powerball;
                }
            }
        }
    }

    showNumbersModal(numbers) {
        console.log('🎯 showNumbersModal chamada com:', numbers);
        
        // Verificar se numbers.rows existe e é um objeto válido
        if (!numbers || !numbers.rows) {
            console.error('❌ Dados inválidos para showNumbersModal:', numbers);
            this.showError('Dados de OCR inválidos.');
            return;
        }

        // Converter objeto rows para array se necessário (compatibilidade)
        let rowsArray = [];
        if (typeof numbers.rows === 'object' && !Array.isArray(numbers.rows)) {
            // Converter objeto para array
            rowsArray = Object.keys(numbers.rows).map(key => ({
                letter: key,
                numbers: numbers.rows[key].numbers || [],
                powerball: numbers.rows[key].powerball || 0
            }));
            console.log('🔄 Convertido objeto rows para array:', rowsArray);
        } else if (Array.isArray(numbers.rows)) {
            rowsArray = numbers.rows;
        }

        if (rowsArray.length === 0) {
            console.error('❌ Nenhuma fileira encontrada nos dados');
            this.showError('Nenhuma fileira de números foi detectada.');
            return;
        }

        this.displayMultipleRows({ rows: rowsArray, totalRows: rowsArray.length });
        this.numbersModal.classList.remove('hidden');
        console.log('✅ Modal exibido com sucesso');
    }

    displayMultipleRows(numbers) {
        const existingDisplay = document.getElementById('multiple-rows-display');
        if (!existingDisplay) {
            console.error('❌ Elemento multiple-rows-display não encontrado');
            return;
        }

        let html = `<div class="powerball-ticket-layout">`;
        html += `<div class="numbers-matrix">`;
        
        numbers.rows.forEach((row, index) => {
            const rowLetter = row.letter || String.fromCharCode(65 + index); // A, B, C, D, E
            
            html += `
                <div class="number-row" data-row="${rowLetter}">
                    <div class="row-label">${rowLetter}</div>
                    <div class="main-numbers">
            `;
            
            // Números principais (5 números)
            if (row.numbers && Array.isArray(row.numbers)) {
                row.numbers.forEach((num, numIndex) => {
                    html += `<input type="number" class="editable-number" value="${num}" min="1" max="69" data-row="${rowLetter}" data-position="${numIndex}">`;
                });
            }
            
            html += `
                    </div>
                    <div class="powerball-section">
                        <span class="pb-label">PB</span>
                        <input type="number" class="editable-powerball" value="${row.powerball || ''}" min="1" max="26" data-row="${rowLetter}">
                    </div>
                </div>
            `;
        });
        
        html += `</div>`; // Fechar numbers-matrix
        
        // Informações adicionais
        if (numbers.totalRows > 1) {
            html += `<div class="ticket-info">Detectadas ${numbers.totalRows} fileiras</div>`;
        }
        
        html += `</div>`; // Fechar powerball-ticket-layout
        
        existingDisplay.innerHTML = html;
        
        // Adicionar validação aos inputs criados dinamicamente
        const editableNumbers = existingDisplay.querySelectorAll('.editable-number');
        const editablePowerballs = existingDisplay.querySelectorAll('.editable-powerball');
        
        editableNumbers.forEach(input => {
            input.addEventListener('input', (e) => this.validateMainNumber(e.target));
        });
        
        editablePowerballs.forEach(input => {
            input.addEventListener('input', (e) => this.validatePowerballNumber(e.target));
        });
    }

    closeNumbersModal() {
        this.numbersModal.classList.add('hidden');
    }

    checkNumbers() {
        // Coletar números dos inputs
        const numbers = [];
        this.numberInputs.forEach(input => {
            const value = parseInt(input.value);
            if (value >= 1 && value <= 69) {
                numbers.push(value);
            }
        });
        
        const powerball = parseInt(this.powerballInput.value);
        const state = this.stateSelect.value;
        
        if (numbers.length === 5 && powerball >= 1 && powerball <= 26 && state) {
            this.showResults(numbers, powerball, state);
        } else {
            alert('Por favor, preencha todos os números corretamente e selecione um estado.');
        }
    }

    showResults(numbers, powerball, state) {
        this.closeNumbersModal();
        
        const resultsContent = document.getElementById('resultsContent');
        resultsContent.innerHTML = `
            <div class="results-summary">
                <h3>Seus Números:</h3>
                <div class="numbers-display">
                    <span class="main-numbers">${numbers.join(' - ')}</span>
                    <span class="powerball-display">PB: ${powerball}</span>
                </div>
                <p><strong>Estado:</strong> ${state}</p>
                <p class="success-message">✅ Números verificados com sucesso!</p>
            </div>
        `;
        
        this.resultsModal.classList.remove('hidden');
    }

    closeResultsModal() {
        this.resultsModal.classList.add('hidden');
        // Reset do formulário
        this.numberInputs.forEach(input => input.value = '');
        this.powerballInput.value = '';
        this.stateSelect.value = '';
    }

    validateMainNumber(input) {
        const value = parseInt(input.value);
        if (value < 1 || value > 69) {
            input.style.borderColor = '#FF6B6B';
        } else {
            input.style.borderColor = '#4CAF50';
        }
    }

    validatePowerballNumber(input) {
        const value = parseInt(input.value);
        if (value < 1 || value > 26) {
            input.style.borderColor = '#FF6B6B';
        } else {
            input.style.borderColor = '#4CAF50';
        }
    }

    showLoading() {
        const scanText = document.getElementById('scanText');
        if (scanText) scanText.style.display = 'none';
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.remove('hidden');
        }
    }

    hideLoading() {
        const scanText = document.getElementById('scanText');
        if (scanText) scanText.style.display = 'inline';
        if (this.loadingSpinner) {
            this.loadingSpinner.classList.add('hidden');
        }
    }

    showError(message) {
        alert(message); // Usando alert temporariamente
        this.hideLoading();
    }

    hideError() {
        // Método mantido para compatibilidade
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Lottery Scanner...');
    console.log('🔍 DEBUG - Verificando elementos antes da inicialização:');
    console.log('- previewImage existe no DOM:', !!document.getElementById('previewImage'));
    console.log('- previewContainer existe no DOM:', !!document.getElementById('previewContainer'));
    
    // Pequeno delay para garantir que todos os elementos estejam disponíveis
    setTimeout(() => {
        console.log('🔍 DEBUG - Verificando elementos após delay:');
        console.log('- previewImage existe no DOM:', !!document.getElementById('previewImage'));
        console.log('- previewContainer existe no DOM:', !!document.getElementById('previewContainer'));
        new LotteryScanner();
    }, 100);
});