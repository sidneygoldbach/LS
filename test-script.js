// Script de teste para verificar definição da classe
console.log('🧪 TESTE: Script iniciado');

// Verificar imediatamente se a classe existe
setInterval(() => {
    if (typeof LotteryScanner !== 'undefined') {
        console.log('🧪 TESTE: ✅ Classe LotteryScanner ENCONTRADA!');
        console.log('🧪 TESTE: Tipo:', typeof LotteryScanner);
        console.log('🧪 TESTE: Classe:', LotteryScanner);
        clearInterval(this);
    } else {
        console.log('🧪 TESTE: ❌ Classe LotteryScanner ainda não definida');
    }
}, 200);

// Verificar se o script principal está sendo carregado
document.addEventListener('DOMContentLoaded', () => {
    console.log('🧪 TESTE: DOM carregado');
    
    // Verificar se o script principal existe no DOM
    const scripts = document.querySelectorAll('script[src]');
    console.log('🧪 TESTE: Scripts encontrados:');
    scripts.forEach((script, index) => {
        console.log(`  ${index + 1}. ${script.src}`);
    });
});