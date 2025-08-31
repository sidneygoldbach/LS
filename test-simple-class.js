// Teste simples de definição de classe
console.log('🧪 Iniciando teste de classe simples...');

class SimpleTest {
    constructor() {
        console.log('✅ SimpleTest constructor executado');
        this.name = 'SimpleTest';
    }
    
    test() {
        console.log('✅ Método test() executado');
        return 'OK';
    }
}

console.log('🧪 Classe SimpleTest definida');
console.log('🧪 Tentando criar instância...');

try {
    const instance = new SimpleTest();
    console.log('✅ Instância criada com sucesso:', instance);
    console.log('✅ Teste do método:', instance.test());
    window.simpleTest = instance;
    console.log('✅ Instância armazenada em window.simpleTest');
} catch (error) {
    console.error('❌ Erro ao criar instância:', error);
    console.error('❌ Stack trace:', error.stack);
}

console.log('🧪 Teste de classe simples concluído');

// Verificar se LotteryScanner existe
setTimeout(() => {
    console.log('🔍 Verificando LotteryScanner após 500ms...');
    console.log('🔍 typeof LotteryScanner:', typeof LotteryScanner);
    console.log('🔍 window.LotteryScanner:', window.LotteryScanner);
}, 500);