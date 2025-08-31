// Configuração Geral - Lottery Scanner
// Arquivo de configuração para APIs e funcionalidades

// ===== CONFIGURAÇÃO DE OCR API =====
// Valores possíveis:
// - "Tesseract" (API atual em uso)
// - "Google_Cloud_Vision_API" (nova API a ser implementada)
const OCR_API_NAME = "Tesseract";

// ===== CONFIGURAÇÕES GOOGLE CLOUD VISION API =====
// Configurações para quando OCR_API_NAME = "Google_Cloud_Vision_API"
const GOOGLE_CLOUD_CONFIG = {
    apiKey: "", // Inserir sua API Key aqui
    endpoint: "https://vision.googleapis.com/v1/images:annotate",
    features: [
        {
            type: "TEXT_DETECTION",
            maxResults: 10
        }
    ]
};

// ===== CONFIGURAÇÕES TESSERACT =====
// Configurações para quando OCR_API_NAME = "Tesseract"
const TESSERACT_CONFIG = {
    language: 'eng',
    logger: m => console.log(m)
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = {
        OCR_API_NAME,
        GOOGLE_CLOUD_CONFIG,
        TESSERACT_CONFIG
    };
} else {
    // Browser
    window.CONFIG = {
        OCR_API_NAME,
        GOOGLE_CLOUD_CONFIG,
        TESSERACT_CONFIG
    };
}