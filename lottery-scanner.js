// Lottery Scanner - Versão Limpa usando APENAS Trae AI OCR
// Remove todas as configurações antigas e pós-processamentos

class LotteryScanner {
    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.scannedNumbers = null;
    }

    initializeElements() {
        // Elementos principais
        this.fileInput = document.getElementById('file-input');
        this.uploadButton = document.getElementById('upload-button');
        this.previewContainer = document.getElementById('preview-container');
        this.previewImage = document.getElementById('preview-image');
        this.loadingDiv = document.getElementById('loading');
        this.errorDiv = document.getElementById('error');
        this.numbersModal = document.getElementById('numbers-modal');
        this.closeModalButton = document.getElementById('close-modal');
        
        // Inputs de números
        this.numberInputs = [
            document.getElementById('number1'),
            document.getElementById('number2'),
            document.getElementById('number3'),
            document.getElementById('number4'),
            document.getElementById('number5')
        ];
        this.powerballInput = document.getElementById('powerball');
    }

    setupEventListeners() {
        this.uploadButton.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleImageSelect(e));
        this.closeModalButton.addEventListener('click', () => this.closeNumbersModal());
        
        // Fechar modal clicando fora
        this.numbersModal.addEventListener('click', (e) => {
            if (e.target === this.numbersModal) {
                this.closeNumbersModal();
            }
        });
    }

    async handleImageSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        console.log('🖼️ Imagem selecionada:', file.name);
        
        try {
            this.showLoading();
            this.hideError();
            
            // Mostrar preview da imagem
            const imageUrl = URL.createObjectURL(file);
            this.previewImage.src = imageUrl;
            this.previewContainer.classList.remove('hidden');
            
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
        this.loadingDiv.classList.remove('hidden');
    }

    hideLoading() {
        this.loadingDiv.classList.add('hidden');
    }

    showError(message) {
        this.errorDiv.textContent = message;
        this.errorDiv.classList.remove('hidden');
    }

    hideError() {
        this.errorDiv.classList.add('hidden');
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Lottery Scanner Limpo...');
    new LotteryScanner();
});