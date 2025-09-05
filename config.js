// Configuração Geral - Lottery Scanner
// Arquivo de configuração para APIs e funcionalidades

// ===== CONFIGURAÇÃO DE OCR API =====
// Valores possíveis:
// - "Trae_AI_OCR" (API atual em uso)
// - "Google_Cloud_Vision_API" (nova API a ser implementada)
const OCR_API_NAME = "Trae_AI_OCR";

// ===== CONFIGURAÇÕES GOOGLE CLOUD VISION API =====
// Configurações para quando OCR_API_NAME = "Google_Cloud_Vision_API"
const GOOGLE_CLOUD_CONFIG = {
    // API Key movida para o backend por segurança - não expor no frontend
    endpoint: "https://vision.googleapis.com/v1/images:annotate",
    features: [
        {
            type: "DOCUMENT_TEXT_DETECTION",
            maxResults: 100
        },
        {
            type: "TEXT_DETECTION",
            maxResults: 50
        }
    ],
    languageHints: ["en"],
    imageContext: {
        languageHints: ["en"],
        textDetectionParams: {
            enableTextDetectionConfidenceScore: true,
            advancedOcrOptions: [
                "LEGACY_LAYOUT"
            ]
        },
        cropHintsParams: {
            aspectRatios: [0.8, 1.0, 1.2]
        }
    }
};

// ===== CONFIGURAÇÕES TRAE AI OCR =====
// Configurações para quando OCR_API_NAME = "Trae_AI_OCR"
const TRAE_AI_OCR_CONFIG = {
    simulateOCR: true,
    logger: m => console.log(m)
};

// Exportar configurações
if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = {
        OCR_API_NAME,
        GOOGLE_CLOUD_CONFIG,
        TRAE_AI_OCR_CONFIG
    };
} else {
    // Browser
    window.CONFIG = {
        OCR_API_NAME,
        GOOGLE_CLOUD_CONFIG,
        TRAE_AI_OCR_CONFIG
    };
}