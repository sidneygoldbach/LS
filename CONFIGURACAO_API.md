# 🔧 Configuração da API de IA

## ⚠️ IMPORTANTE: Configuração Obrigatória

Para que o aplicativo funcione corretamente, você **DEVE** configurar uma chave de API válida.

## 📋 Passos para Configuração

### 1. Escolha um Provedor de IA

O aplicativo suporta os seguintes provedores:

- **OpenAI GPT** (Recomendado)
- **Google Gemini**
- **Claude (Anthropic)**
- **API Local** (Ollama, LM Studio, etc.)

### 2. Obtenha sua Chave de API

#### OpenAI (Recomendado)
1. Acesse: https://platform.openai.com/api-keys
2. Faça login ou crie uma conta
3. Clique em "Create new secret key"
4. Copie a chave gerada

#### Google Gemini
1. Acesse: https://makersuite.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Create API Key"
4. Copie a chave gerada

#### Claude (Anthropic)
1. Acesse: https://console.anthropic.com/
2. Faça login ou crie uma conta
3. Vá para "API Keys"
4. Crie uma nova chave

### 3. Configure o Arquivo ai-config.js

1. Abra o arquivo `ai-config.js`
2. Localize a linha:
   ```javascript
   this.apiKey = 'YOUR_API_KEY_HERE';
   ```
3. Substitua `'YOUR_API_KEY_HERE'` pela sua chave real:
   ```javascript
   this.apiKey = 'sk-sua-chave-aqui';
   ```
4. Se necessário, altere o provedor:
   ```javascript
   this.provider = 'openai'; // ou 'gemini', 'claude', 'local'
   ```
5. Salve o arquivo

### 4. Teste o Aplicativo

1. Recarregue a página do aplicativo
2. Faça uma pergunta por voz ou texto
3. Verifique se a resposta da IA aparece corretamente

## 🚨 Problemas Comuns

### "Desculpe, houve um problema com a conexão da IA"
- **Causa**: Chave de API não configurada ou inválida
- **Solução**: Verifique se você inseriu a chave correta no arquivo `ai-config.js`

### Erro 401 (Unauthorized)
- **Causa**: Chave de API inválida ou expirada
- **Solução**: Gere uma nova chave de API

### Erro 429 (Rate Limit)
- **Causa**: Muitas requisições em pouco tempo
- **Solução**: Aguarde alguns minutos antes de tentar novamente

### Erro 403 (Forbidden)
- **Causa**: Conta sem créditos ou sem acesso à API
- **Solução**: Verifique sua conta no provedor de IA

## 💡 Dicas

- **Segurança**: Nunca compartilhe sua chave de API publicamente
- **Custos**: Monitore o uso da API para evitar custos inesperados
- **Backup**: Mantenha uma cópia segura da sua chave de API
- **Teste**: Use o provedor gratuito (Gemini) para testes iniciais

## 🆓 Opções Gratuitas

- **Google Gemini**: Oferece uso gratuito limitado
- **APIs Locais**: Use modelos como Ollama (totalmente gratuito)

---

**Após configurar a API, o aplicativo estará pronto para uso! 🚀**