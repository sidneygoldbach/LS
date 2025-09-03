// Script de teste para verificar definição da classe
console.log('🧪 TESTE: Script iniciado');

// Verificar se a classe existe (execução única)
if (typeof LotteryScanner !== 'undefined') {
    console.log('🧪 TESTE: ✅ Classe LotteryScanner ENCONTRADA!');
    console.log('🧪 TESTE: Tipo:', typeof LotteryScanner);
} else {
    console.log('🧪 TESTE: ❌ Classe LotteryScanner ainda não definida');
    
    // Aguardar um pouco e verificar novamente (apenas uma vez)
    setTimeout(() => {
        if (typeof LotteryScanner !== 'undefined') {
            console.log('🧪 TESTE: ✅ Classe LotteryScanner ENCONTRADA após delay!');
            console.log('🧪 TESTE: Tipo:', typeof LotteryScanner);
        } else {
            console.log('🧪 TESTE: ❌ Classe LotteryScanner ainda não definida após delay');
        }
    }, 1000);
}

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