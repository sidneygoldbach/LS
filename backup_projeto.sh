#!/bin/bash

# Script de Backup e Restauração - Lottery Scanner
# Versão: 1.0
# Data: 31/08/2025

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configurações
PROJETO_DIR="$(pwd)"
BACKUP_DIR="$HOME/LotteryScanner_Backups"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="lottery_scanner_backup_$DATE"
VERSAO_PERFEITA="v1.0-PERFEITA"

echo -e "${BLUE}=== Lottery Scanner - Sistema de Backup e Restauração ===${NC}"
echo -e "${BLUE}Projeto: $PROJETO_DIR${NC}"
echo -e "${BLUE}Backup Dir: $BACKUP_DIR${NC}"
echo ""

# Função para criar backup completo
criar_backup() {
    echo -e "${YELLOW}📦 Criando backup completo...${NC}"
    
    # Criar diretório de backup se não existir
    mkdir -p "$BACKUP_DIR"
    
    # Criar diretório específico do backup
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    mkdir -p "$BACKUP_PATH"
    
    echo -e "${BLUE}📁 Copiando arquivos do projeto...${NC}"
    
    # Copiar arquivos principais (excluir .git temporariamente)
    rsync -av --exclude='.git' "$PROJETO_DIR/" "$BACKUP_PATH/projeto/"
    
    # Backup do repositório Git
    echo -e "${BLUE}🔄 Fazendo backup do repositório Git...${NC}"
    git bundle create "$BACKUP_PATH/repositorio.bundle" --all
    
    # Salvar informações do Git
    echo -e "${BLUE}📝 Salvando informações do Git...${NC}"
    git log --oneline -10 > "$BACKUP_PATH/git_log.txt"
    git status > "$BACKUP_PATH/git_status.txt"
    git tag -l > "$BACKUP_PATH/git_tags.txt"
    git branch -a > "$BACKUP_PATH/git_branches.txt"
    
    # Salvar hash do commit atual
    git rev-parse HEAD > "$BACKUP_PATH/current_commit.txt"
    
    # Criar arquivo de informações do backup
    cat > "$BACKUP_PATH/backup_info.txt" << EOF
Lottery Scanner - Backup Completo
================================

Data do Backup: $(date)
Versão: $VERSAO_PERFEITA
Commit Hash: $(git rev-parse HEAD)
Branch Atual: $(git branch --show-current)
Diretório Original: $PROJETO_DIR

Arquivos Incluídos:
- Código fonte completo
- Repositório Git (bundle)
- Histórico de commits
- Tags e branches
- Documentação

Para restaurar:
1. Extrair arquivos
2. Executar: ./restaurar_backup.sh

Ou seguir instruções em HISTORICO_DESENVOLVIMENTO.md
EOF

    # Criar script de restauração
    cat > "$BACKUP_PATH/restaurar_backup.sh" << 'EOF'
#!/bin/bash

# Script de Restauração - Lottery Scanner

set -e

echo "🔄 Restaurando Lottery Scanner..."

# Verificar se estamos no diretório correto
if [ ! -f "backup_info.txt" ]; then
    echo "❌ Erro: Execute este script no diretório do backup"
    exit 1
fi

# Perguntar diretório de destino
read -p "📁 Digite o diretório onde restaurar o projeto (ou Enter para ./lottery_scanner_restaurado): " DESTINO
DESTINO=${DESTINO:-"./lottery_scanner_restaurado"}

# Criar diretório de destino
mkdir -p "$DESTINO"

echo "📦 Copiando arquivos..."
cp -r projeto/* "$DESTINO/"

echo "🔄 Restaurando repositório Git..."
cd "$DESTINO"
git clone ../repositorio.bundle .

echo "🏷️ Verificando versão perfeita..."
git checkout v1.0-PERFEITA

echo "✅ Restauração concluída!"
echo "📁 Projeto restaurado em: $DESTINO"
echo "🚀 Para iniciar: cd $DESTINO && python3 -m http.server 8002"
EOF

    chmod +x "$BACKUP_PATH/restaurar_backup.sh"
    
    # Comprimir backup
    echo -e "${BLUE}🗜️ Comprimindo backup...${NC}"
    cd "$BACKUP_DIR"
    tar -czf "$BACKUP_NAME.tar.gz" "$BACKUP_NAME"
    
    # Calcular tamanho
    TAMANHO=$(du -sh "$BACKUP_NAME.tar.gz" | cut -f1)
    
    echo -e "${GREEN}✅ Backup criado com sucesso!${NC}"
    echo -e "${GREEN}📁 Local: $BACKUP_DIR/$BACKUP_NAME.tar.gz${NC}"
    echo -e "${GREEN}📏 Tamanho: $TAMANHO${NC}"
    echo ""
    echo -e "${YELLOW}📋 Para restaurar em outro local:${NC}"
    echo -e "${YELLOW}1. Copiar o arquivo: $BACKUP_NAME.tar.gz${NC}"
    echo -e "${YELLOW}2. Extrair: tar -xzf $BACKUP_NAME.tar.gz${NC}"
    echo -e "${YELLOW}3. Executar: cd $BACKUP_NAME && ./restaurar_backup.sh${NC}"
}

# Função para listar backups
listar_backups() {
    echo -e "${YELLOW}📋 Backups disponíveis:${NC}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${RED}❌ Nenhum backup encontrado${NC}"
        return
    fi
    
    cd "$BACKUP_DIR"
    for backup in *.tar.gz; do
        if [ -f "$backup" ]; then
            TAMANHO=$(du -sh "$backup" | cut -f1)
            DATA=$(echo "$backup" | grep -o '[0-9]\{8\}_[0-9]\{6\}')
            DATA_FORMATADA=$(echo "$DATA" | sed 's/\([0-9]\{4\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)_\([0-9]\{2\}\)\([0-9]\{2\}\)\([0-9]\{2\}\)/\3\/\2\/\1 \4:\5:\6/')
            echo -e "${GREEN}📦 $backup${NC} - ${BLUE}$TAMANHO${NC} - ${YELLOW}$DATA_FORMATADA${NC}"
        fi
    done
}

# Função para verificar status atual
verificar_status() {
    echo -e "${YELLOW}🔍 Status atual do projeto:${NC}"
    echo -e "${BLUE}📁 Diretório: $PROJETO_DIR${NC}"
    
    if [ -d ".git" ]; then
        echo -e "${GREEN}✅ Repositório Git encontrado${NC}"
        echo -e "${BLUE}🏷️ Branch atual: $(git branch --show-current)${NC}"
        echo -e "${BLUE}📝 Último commit: $(git log --oneline -1)${NC}"
        
        if git tag -l | grep -q "$VERSAO_PERFEITA"; then
            echo -e "${GREEN}✅ Tag $VERSAO_PERFEITA encontrada${NC}"
        else
            echo -e "${RED}❌ Tag $VERSAO_PERFEITA não encontrada${NC}"
        fi
    else
        echo -e "${RED}❌ Repositório Git não encontrado${NC}"
    fi
    
    # Verificar arquivos principais
    ARQUIVOS=("index.html" "lottery-scanner.js" "lottery-scanner.css" "HISTORICO_DESENVOLVIMENTO.md")
    for arquivo in "${ARQUIVOS[@]}"; do
        if [ -f "$arquivo" ]; then
            echo -e "${GREEN}✅ $arquivo${NC}"
        else
            echo -e "${RED}❌ $arquivo (não encontrado)${NC}"
        fi
    done
}

# Menu principal
case "${1:-menu}" in
    "backup")
        criar_backup
        ;;
    "listar")
        listar_backups
        ;;
    "status")
        verificar_status
        ;;
    "menu")
        echo -e "${YELLOW}Escolha uma opção:${NC}"
        echo "1. Criar backup completo"
        echo "2. Listar backups existentes"
        echo "3. Verificar status atual"
        echo "4. Sair"
        echo ""
        read -p "Digite sua escolha (1-4): " escolha
        
        case $escolha in
            1) criar_backup ;;
            2) listar_backups ;;
            3) verificar_status ;;
            4) echo -e "${BLUE}👋 Até logo!${NC}" ;;
            *) echo -e "${RED}❌ Opção inválida${NC}" ;;
        esac
        ;;
    *)
        echo -e "${RED}❌ Uso: $0 [backup|listar|status|menu]${NC}"
        exit 1
        ;;
esac

echo ""