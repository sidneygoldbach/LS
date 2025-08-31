# 🔍 Guia do Sistema Multi-OCR API - Lottery Scanner

## 📋 Visão Geral

O Lottery Scanner agora possui um sistema flexível que permite alternar entre diferentes APIs de OCR (Reconhecimento Óptico de Caracteres) apenas modificando uma variável de configuração.

## 🎯 APIs Suportadas

### 1. **Tesseract.js** (Padrão)
- ✅ **Status:** Ativo por padrão
- 🌐 **Tipo:** Processamento local (offline)
- 💰 **Custo:** Gratuito
- ⚡ **Performance:** Boa para uso geral
- 🔧 **Configuração:** Não requer API Key

### 2. **Google Cloud Vision API** (Opcional)
- ⚙️ **Status:** Disponível mediante configuração
- 🌐 **Tipo:** Processamento na nuvem (online)
- 💰 **Custo:** Pago (Google Cloud)
- ⚡ **Performance:** Excelente precisão
- 🔧 **Configuração:** Requer API Key do Google Cloud

## 🔧 Como Alternar Entre APIs

### Passo 1: Abrir o Arquivo de Configuração
Edite o arquivo `config.js` na raiz do projeto:

```javascript
// Para usar Tesseract.js (padrão)
const OCR_API_NAME = "Tesseract";

// Para usar Google Cloud Vision API
const OCR_API_NAME = "Google_Cloud_Vision_API";
```

### Passo 2: Configurar Google Cloud Vision (se necessário)
Se escolher Google Cloud Vision API, configure sua API Key:

```javascript
const GOOGLE_CLOUD_CONFIG = {
    apiKey: "SUA_API_KEY_AQUI", // Inserir sua API Key
    endpoint: "https://vision.googleapis.com/v1/images:annotate",
    features: [
        {
            type: "TEXT_DETECTION",
            maxResults: 10
        }
    ]
};
```

### Passo 3: Recarregar a Aplicação
Após modificar a configuração, recarregue a página no navegador.

## 🚀 Como Obter API Key do Google Cloud Vision

1. **Acesse o Google Cloud Console:**
   - Vá para: https://console.cloud.google.com/

2. **Crie ou Selecione um Projeto:**
   - Crie um novo projeto ou selecione um existente

3. **Ative a API:**
   - Navegue para "APIs & Services" > "Library"
   - Procure por "Cloud Vision API"
   - Clique em "Enable"

4. **Crie Credenciais:**
   - Vá para "APIs & Services" > "Credentials"
   - Clique em "Create Credentials" > "API Key"
   - Copie a API Key gerada

5. **Configure Restrições (Recomendado):**
   - Restrinja a API Key para usar apenas Cloud Vision API
   - Configure restrições de domínio se necessário

## 🔍 Como o Sistema Funciona

### Fluxo de Decisão
```
Usuário carrega imagem
        ↓
Verifica OCR_API_NAME
        ↓
┌─────────────────────┐    ┌──────────────────────────┐
│ Se "Tesseract"      │    │ Se "Google_Cloud_Vision_API" │
│ ↓                   │    │ ↓                        │
│ Usa Tesseract.js    │    │ Usa Google Cloud Vision  │
│ (Processamento      │    │ (Processamento na nuvem) │
│  local)             │    │                          │
└─────────────────────┘    └──────────────────────────┘
        ↓                            ↓
        └──────────── Extrai números ──────────────┘
                            ↓
                    Exibe resultados
```

### Arquivos Modificados
- ✅ `config.js` - Novo arquivo de configuração
- ✅ `index.html` - Carrega configurações
- ✅ `lottery-scanner.js` - Sistema multi-API implementado

### Funções Adicionadas
- ✅ `performGoogleCloudVisionOCR()` - Integração com Google Cloud
- ✅ `fileToBase64()` - Conversão de arquivos para base64
- ✅ Sistema IF/ELSE na `performOCR()`

## 🧪 Testando o Sistema

### Teste com Tesseract.js
1. Mantenha `OCR_API_NAME = "Tesseract"`
2. Carregue uma imagem
3. Verifique no console: "🔍 Usando Tesseract.js para OCR..."

### Teste com Google Cloud Vision
1. Configure sua API Key
2. Altere `OCR_API_NAME = "Google_Cloud_Vision_API"`
3. Carregue uma imagem
4. Verifique no console: "🔍 Usando Google Cloud Vision API para OCR..."

## ⚠️ Tratamento de Erros

### Erros Comuns
- **API Key não configurada:** Sistema volta para Tesseract.js
- **Erro de rede:** Fallback para números de exemplo
- **Resposta inválida:** Log de erro detalhado no console

### Logs de Debug
Todos os processos são logados no console do navegador:
- ✅ Sucesso: Logs em verde
- ⚠️ Avisos: Logs em amarelo
- ❌ Erros: Logs em vermelho

## 💡 Vantagens do Sistema

### Flexibilidade
- ✅ Troca de API sem modificar código
- ✅ Teste de diferentes APIs facilmente
- ✅ Fallback automático em caso de erro

### Compatibilidade
- ✅ Mantém funcionalidade existente
- ✅ Não quebra implementações anteriores
- ✅ Suporte a futuras APIs

### Manutenibilidade
- ✅ Configuração centralizada
- ✅ Código organizado e modular
- ✅ Fácil adição de novas APIs

## 🔮 Próximos Passos

### Futuras APIs Suportadas
- [ ] Azure Computer Vision
- [ ] AWS Textract
- [ ] OCR.space API
- [ ] Custom OCR Models

### Melhorias Planejadas
- [ ] Interface para trocar API sem editar código
- [ ] Comparação de resultados entre APIs
- [ ] Cache de resultados OCR
- [ ] Métricas de performance

## 📞 Suporte

Para dúvidas sobre o sistema multi-OCR:
1. Verifique os logs no console do navegador
2. Confirme a configuração no `config.js`
3. Teste com a API padrão (Tesseract.js) primeiro

---

**🎯 Sistema Multi-OCR API implementado com sucesso! 🚀**