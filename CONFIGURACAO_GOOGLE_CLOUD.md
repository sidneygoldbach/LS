# Configuração Google Cloud Vision API - Migração Segura

## 🔐 Configuração das Credenciais

### 1. Criar Service Account no Google Cloud Console

1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Selecione seu projeto ou crie um novo
3. Vá para **IAM & Admin** > **Service Accounts**
4. Clique em **Create Service Account**
5. Preencha:
   - **Name**: `lottery-scanner-vision`
   - **Description**: `Service account para Lottery Scanner OCR`
6. Clique em **Create and Continue**

### 2. Configurar Permissões

1. Na seção **Grant this service account access to project**:
   - Adicione a role: `Cloud Vision AI Service Agent`
   - Ou use: `Editor` (menos restritivo)
2. Clique em **Continue** e depois **Done**

### 3. Gerar Chave JSON

1. Na lista de Service Accounts, clique no email da conta criada
2. Vá para a aba **Keys**
3. Clique em **Add Key** > **Create new key**
4. Selecione **JSON** e clique em **Create**
5. O arquivo será baixado automaticamente

### 4. Configurar no Projeto

1. Renomeie o arquivo baixado para `google-cloud-credentials.json`
2. Mova o arquivo para a pasta raiz do projeto:
   ```bash
   mv ~/Downloads/seu-projeto-xxxxx.json ./google-cloud-credentials.json
   ```
3. **IMPORTANTE**: Nunca commite este arquivo no Git!

### 5. Habilitar a API

1. No Google Cloud Console, vá para **APIs & Services** > **Library**
2. Procure por "Cloud Vision API"
3. Clique em **Enable**

## 🚀 Executar o Servidor

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

## 🔧 Variáveis de Ambiente

Edite o arquivo `.env` conforme necessário:

```env
# Porta do servidor
PORT=3000

# Caminho para credenciais (relativo ao projeto)
GOOGLE_APPLICATION_CREDENTIALS=./google-cloud-credentials.json

# CORS (URL do front-end)
CORS_ORIGIN=http://localhost:8003
```

## 🛡️ Segurança

### Arquivos que NUNCA devem ser commitados:
- `google-cloud-credentials.json`
- `.env` (se contiver dados sensíveis)

### Verificar .gitignore:
```gitignore
# Credenciais Google Cloud
google-cloud-credentials.json
*.json
!google-cloud-credentials.example.json

# Variáveis de ambiente
.env
.env.local
.env.production

# Node.js
node_modules/
npm-debug.log*
```

## 🧪 Testar Configuração

1. Inicie o servidor:
   ```bash
   npm start
   ```

2. Teste o endpoint de saúde:
   ```bash
   curl http://localhost:3000/api/health
   ```

3. Teste o processamento de imagem:
   ```bash
   curl -X POST -F "image=@sua-imagem.jpg" http://localhost:3000/api/processar-imagem
   ```

## ❌ Problemas Comuns

### Erro: "Could not load the default credentials"
- Verifique se o arquivo `google-cloud-credentials.json` existe
- Confirme o caminho no `.env`
- Verifique as permissões do arquivo

### Erro: "Permission denied"
- Verifique se a Cloud Vision API está habilitada
- Confirme as roles do Service Account
- Verifique se o projeto está correto

### Erro: "Quota exceeded"
- Verifique os limites da API no Google Cloud Console
- Configure billing se necessário

## 📊 Monitoramento

Para monitorar o uso da API:
1. Google Cloud Console > **APIs & Services** > **Dashboard**
2. Selecione "Cloud Vision API"
3. Visualize métricas de uso e erros