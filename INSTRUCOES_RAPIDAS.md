# 🚀 Instruções Rápidas - Lottery Scanner

## ⚡ Restaurar e Continuar Desenvolvimento

### 1️⃣ Recuperar Versão Perfeita
```bash
# Ir para o diretório do projeto
cd /Volumes/SDXC_1TB_250822/Users/sidneygoldbach/Downloads/Trae/AI

# Recuperar versão perfeita
git checkout v1.0-PERFEITA

# Verificar se está correto
git log --oneline -1
# Deve mostrar: 8f7e10e (HEAD, tag: v1.0-PERFEITA) VERSÃO PERFEITA...
```

### 2️⃣ Iniciar Servidor
```bash
# Iniciar servidor de desenvolvimento
python3 -m http.server 8002

# Acessar no navegador
open http://localhost:8002/
```

### 3️⃣ Verificar Funcionamento
- ✅ Botões "Carregar Arquivo" e "Usar Câmera" visíveis
- ✅ Upload de imagem funciona
- ✅ OCR detecta números
- ✅ Sem erros no console

---

## 💾 Sistema de Backup

### Criar Backup Completo
```bash
# Executar script de backup
./backup_projeto.sh backup

# Ou usar menu interativo
./backup_projeto.sh
```

### Listar Backups Existentes
```bash
./backup_projeto.sh listar
```

### Verificar Status Atual
```bash
./backup_projeto.sh status
```

---

## 📁 Arquivos Importantes

| Arquivo | Descrição |
|---------|----------|
| `lottery-scanner.js` | ⚠️ **CRÍTICO** - Lógica principal |
| `lottery-scanner.css` | Estilos da interface |
| `index.html` | Estrutura HTML |
| `HISTORICO_DESENVOLVIMENTO.md` | 📚 Documentação completa |
| `backup_projeto.sh` | 💾 Sistema de backup |

---

## 🔧 Comandos Úteis

### Git
```bash
# Ver todas as tags
git tag -l

# Ver histórico
git log --oneline -10

# Verificar status
git status

# Voltar para versão perfeita
git checkout v1.0-PERFEITA
```

### Servidor
```bash
# Iniciar na porta 8002 (principal)
python3 -m http.server 8002

# Iniciar na porta 8001 (alternativo)
python3 -m http.server 8001

# Parar servidor: Ctrl+C
```

---

## ⚠️ IMPORTANTE

### ❌ NÃO FAZER
- Merge com outras branches antigas
- Modificar `lottery-scanner.js` sem backup
- Usar versões diferentes da v1.0-PERFEITA

### ✅ SEMPRE FAZER
- Backup antes de modificações
- Testar após mudanças
- Consultar `HISTORICO_DESENVOLVIMENTO.md`
- Usar tag `v1.0-PERFEITA` como referência

---

## 🆘 Solução de Problemas

### Erro "forEach"
- ✅ **JÁ RESOLVIDO** na v1.0-PERFEITA
- Se aparecer: `git checkout v1.0-PERFEITA`

### Servidor não inicia
```bash
# Verificar se porta está ocupada
lsof -i :8002

# Usar porta alternativa
python3 -m http.server 8001
```

### Arquivos não encontrados
```bash
# Verificar se está no diretório correto
pwd
# Deve mostrar: /Volumes/SDXC_1TB_250822/Users/sidneygoldbach/Downloads/Trae/AI

# Listar arquivos
ls -la
```

---

## 📞 Informações de Contexto

**Versão de Referência:** v1.0-PERFEITA (8f7e10e)  
**Data:** 31/08/2025  
**Status:** ✅ FUNCIONAL E TESTADO  
**URL Principal:** http://localhost:8002/  

> 💡 **Dica:** Sempre consulte `HISTORICO_DESENVOLVIMENTO.md` para contexto completo!