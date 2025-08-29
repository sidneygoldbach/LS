# 🎰 Lottery Scanner - Escaneador de Cartões Lotéricos

## 📱 Sobre o Aplicativo

O **Lottery Scanner** é um aplicativo web progressivo (PWA) que permite escanear cartões de loteria usando a câmera do dispositivo e comparar os números com os resultados mais recentes do Powerball.

## ✨ Funcionalidades

- 📸 **Captura de Imagem**: Use a câmera do seu dispositivo para fotografar cartões de loteria
- 🔍 **OCR Inteligente**: Reconhecimento automático de números usando Tesseract.js
- ✏️ **Edição Manual**: Corrija os números reconhecidos se necessário
- 🏛️ **Seleção de Estado**: Escolha entre todos os estados americanos participantes
- 🎯 **Verificação Automática**: Compare seus números com os resultados do Powerball
- 📊 **Resultados Detalhados**: Veja quais números você acertou
- 📱 **PWA**: Instalável como aplicativo nativo
- 🌐 **Facebook Ready**: Otimizado para funcionar no Facebook

## 🚀 Como Usar

### 1. Escaneamento
1. Clique no botão **"SCAN"** na tela principal
2. Permita o acesso à câmera quando solicitado
3. Fotografe seu cartão de loteria
4. Aguarde o processamento OCR

### 2. Verificação
1. Revise os números reconhecidos no modal
2. Edite manualmente se necessário
3. Selecione seu estado
4. Clique em **"CHECK THE NUMBERS"**

### 3. Resultados
1. Veja a comparação entre seus números e os sorteados
2. Números acertados são destacados em verde
3. Clique em **"FINISH"** para voltar ao início

## 🛠️ Instalação

### Servidor Web Local
```bash
# Navegue até o diretório do projeto
cd /caminho/para/lottery-scanner

# Inicie um servidor local
python3 -m http.server 8000
# ou
npx serve .

# Acesse http://localhost:8000/lottery-scanner.html
```

### Hospedagem Web
1. Faça upload de todos os arquivos para seu servidor web
2. Certifique-se de que o servidor suporte HTTPS (necessário para câmera)
3. Acesse `https://seu-dominio.com/lottery-scanner.html`

### Facebook Integration
1. Configure as meta tags Open Graph no HTML
2. Teste com o [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
3. Compartilhe o link no Facebook

## 📁 Estrutura de Arquivos

```
lottery-scanner/
├── lottery-scanner.html      # Página principal
├── lottery-scanner.css       # Estilos
├── lottery-scanner.js        # Lógica principal
├── lottery-scanner-sw.js     # Service Worker (PWA)
├── manifest.json             # Manifesto PWA
└── LOTTERY_SCANNER_README.md # Este arquivo
```

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura e semântica
- **CSS3**: Estilos modernos e responsivos
- **JavaScript ES6+**: Lógica da aplicação
- **Tesseract.js**: OCR para reconhecimento de texto
- **PWA**: Service Worker e Manifest
- **Camera API**: Acesso à câmera do dispositivo
- **Fetch API**: Requisições HTTP

## 🎯 Compatibilidade

### Navegadores Suportados
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Chrome Mobile
- ✅ Safari Mobile

### Recursos Necessários
- 📷 Câmera do dispositivo
- 🌐 Conexão com internet
- 🔒 HTTPS (para acesso à câmera)

## 🔒 Privacidade e Segurança

- ✅ Nenhuma imagem é enviada para servidores externos
- ✅ OCR processado localmente no dispositivo
- ✅ Dados não são armazenados permanentemente
- ✅ Compatível com GDPR

## 🎮 Números de Exemplo

Para testar o aplicativo sem um cartão real:
- **Números Principais**: 7, 14, 21, 35, 42
- **Powerball**: 15
- **Estado**: Qualquer estado americano

## 🐛 Solução de Problemas

### Câmera não funciona
- Verifique se está usando HTTPS
- Permita acesso à câmera no navegador
- Teste em um navegador diferente

### OCR não reconhece números
- Certifique-se de que a imagem está nítida
- Boa iluminação é essencial
- Edite manualmente os números se necessário

### Erro na API do Powerball
- O app usa dados simulados como fallback
- Verifique sua conexão com internet
- Alguns navegadores podem bloquear requisições CORS

## 🚀 Melhorias Futuras

- [ ] Integração com banco de dados PostgreSQL
- [ ] Histórico de jogos
- [ ] Notificações push
- [ ] Suporte a outras loterias
- [ ] Análise estatística
- [ ] Compartilhamento social

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a seção de solução de problemas
2. Teste em diferentes navegadores
3. Certifique-se de que todos os arquivos estão no servidor

## 📄 Licença

Este projeto é de código aberto e pode ser usado livremente para fins educacionais e comerciais.

---

**🎰 Boa sorte com seus números! 🍀**