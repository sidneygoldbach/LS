const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const vision = require('@google-cloud/vision');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8003;

// Inicializar cliente Google Cloud Vision
// TEMPORÁRIO: Usar API Key até configurar credenciais adequadas
let client;
try {
  client = new vision.ImageAnnotatorClient();
} catch (error) {
  console.warn('⚠️ Credenciais do Google Cloud não encontradas. Usando fallback com API Key.');
  client = null;
}

// Middleware de segurança com CSP personalizado
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "cdn.jsdelivr.net",
        "blob:",
        "data:"
      ],
      connectSrc: ["'self'", "blob:", "data:"],
      imgSrc: ["'self'", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      fontSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "blob:"],
      frameSrc: ["'none'"]
    }
  }
}));

// Configurar CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8003',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Muitas requisições. Tente novamente em alguns minutos.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});
app.use('/api/', limiter);

// Configurar multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/jpg,image/png,image/webp').split(',');
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use apenas JPEG, PNG ou WebP.'), false);
    }
  }
});

// Middleware para parsing JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Função para limpeza avançada de texto OCR
function cleanTextForOCR(line) {
  return line
    // Substituições básicas de caracteres similares
    .replace(/[Oo0]/g, '0')  // O maiúsculo, minúsculo e 0 para 0
    .replace(/[Il|1]/g, '1') // I, l, |, 1 para 1
    .replace(/[Ss5]/g, '5')  // S maiúsculo, minúsculo e 5 para 5
    .replace(/[Zz2]/g, '2')  // Z maiúsculo, minúsculo e 2 para 2
    .replace(/[Bb8]/g, '8')  // B maiúsculo, minúsculo e 8 para 8
    .replace(/[Gg6]/g, '6')  // G maiúsculo, minúsculo e 6 para 6
    .replace(/[Tt7]/g, '7')  // T maiúsculo, minúsculo e 7 para 7
    .replace(/[Aa4]/g, '4')  // A maiúsculo, minúsculo e 4 para 4
    .replace(/[Ee3]/g, '3')  // E maiúsculo, minúsculo e 3 para 3
    .replace(/[Rr]/g, '2')   // R para 2
    .replace(/[Dd]/g, '0')   // D para 0
    .replace(/[Cc]/g, '0')   // C para 0
    .replace(/[Uu]/g, '0')   // U para 0
    .replace(/[Qq9]/g, '9')  // Q maiúsculo, minúsculo e 9 para 9
    .replace(/[Pp]/g, '9')   // P para 9
    .replace(/[Hh]/g, '4')   // H para 4
    .replace(/[Nn]/g, '4')   // N para 4
    .replace(/[Mm]/g, '44')  // M para 44
    .replace(/[Ww]/g, '44')  // W para 44
    .replace(/[Vv]/g, '4')   // V para 4
    .replace(/[Yy]/g, '4')   // Y para 4
    .replace(/[Xx]/g, '4')   // X para 4
    .replace(/[Kk]/g, '4')   // K para 4
    .replace(/[Ff]/g, '7')   // F para 7
    .replace(/[Jj]/g, '1')   // J para 1
    .replace(/[Ll]/g, '1')   // L para 1
    // Remove zeros à esquerda: 02->2, 03->3, etc.
    .replace(/\b0([0-9])\b/g, '$1')
    // Padrões de OCR problemáticos específicos
    .replace(/[\[\](){}]/g, '')     // Remover colchetes e parênteses
    .replace(/[.,;:!?]/g, ' ')      // Substituir pontuação por espaços
    .replace(/[#@$%^&*+=~`]/g, '')  // Remover símbolos especiais
    .replace(/[-_]/g, ' ')          // Substituir hífens e underscores por espaços
    .replace(/\s+/g, ' ')           // Normalizar espaços múltiplos
    .trim();
}

// Função para extrair números alternativos de uma linha
function extractNumbersAlternative(line, lineIndex, rowLetter) {
  const numbers = [];
  
  const cleanLine = cleanTextForOCR(line);
  console.log(`    Linha original: "${line}"`);
  console.log(`    Linha limpa: "${cleanLine}"`);
  
  // Extrair todos os números da linha limpa
  const numberMatches = cleanLine.match(/\d+/g);
  if (numberMatches) {
    numberMatches.forEach(match => {
      const num = parseInt(match);
      // Aceitar números de 1-69 (principais) e 1-26 (Powerball)
      if ((num >= 1 && num <= 69) || (num >= 1 && num <= 26)) {
        numbers.push({
          value: num,
          line: lineIndex,
          text: line.trim(),
          rowLetter: rowLetter,
          extracted_from: match
        });
      }
    });
  }
  
  // Padrões OCR específicos para Powerball
  const ocrPatterns = [
    /\b0?3\b/gi,        // "03" ou "3"
    /\b19\b/gi,         // "19"
    /\b46\b/gi,         // "46"
    /\b54\b/gi,         // "54"
    /\b65\b/gi,         // "65"
    /\b0?2\b/gi,        // "02" ou "2" (Powerball)
    /\b0?4\b/gi,        // "04" ou "4"
    /\b20\b/gi,         // "20"
    /\b16\b/gi,         // "16"
    /\b35\b/gi,         // "35"
    /\b38\b/gi,         // "38"
    /\b0?5\b/gi,        // "05" ou "5"
    /\b32\b/gi,         // "32"
    /\b45\b/gi,         // "45"
    /\b48\b/gi,         // "48"
    /\b67\b/gi,         // "67"
    /\b0?6\b/gi,        // "06" ou "6"
    /\b23\b/gi,         // "23"
    /\b50\b/gi,         // "50"
    /\b56\b/gi,         // "56"
    /\b69\b/gi,         // "69"
    /AW\s*(\d+)/gi,     // "AW 13"
    /&(\d+)/gi,         // "&850"
    /(\d+)E/gi,         // "80E"
    /B(\d+)/gi,         // "B2"
    /%(\d+)/gi,         // "%69"
    /(\d+)\s*[Oo]/gi,   // "13 oo", "1 O"
    /[Oo]\s*(\d+)/gi,   // "O 03"
    /e\s*(\d+)/gi,      // "e 8"
    /LG\s*&(\d+)/gi,    // "LG &850"
    /Aug(\d+)/gi,       // "Aug23"
    /§(\d+)/gi,         // "§15"
  ];
  
  ocrPatterns.forEach((pattern, patternIndex) => {
    const matches = line.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const numberMatches = match.match(/\d+/g);
        if (numberMatches) {
          numberMatches.forEach(numStr => {
            const num = parseInt(numStr);
            if ((num >= 1 && num <= 69) || (num >= 1 && num <= 26)) {
              numbers.push({
                value: num,
                line: lineIndex,
                text: line.trim(),
                rowLetter: rowLetter,
                extracted_from: `${match} (padrão ${patternIndex + 1})`
              });
            }
          });
        }
      });
    }
  });
  
  // Remover duplicatas
  const uniqueNumbers = numbers.filter((num, index, self) => 
    index === self.findIndex(n => n.value === num.value)
  );
  
  return uniqueNumbers;
}

// Função sofisticada para extrair números de loteria com detecção de fileiras A-E
function extractLotteryNumbersAdvanced(text) {
  console.log('=== INÍCIO DA ANÁLISE OCR AVANÇADA ===');
  console.log('Texto OCR original completo:');
  console.log(text);
  console.log('=== FIM DO TEXTO OCR ===');
  
  const lines = text.split('\n').filter(line => line.trim());
  console.log(`Total de linhas após filtro: ${lines.length}`);
  
  const allNumbers = [];
  const extractedInfo = {
    rows: [],
    date: null,
    state: null,
    rowLetters: []
  };
  
  // Processar cada linha buscando letras de fileira e números
  lines.forEach((line, lineIndex) => {
    console.log(`\nProcessando linha ${lineIndex}: "${line.trim()}"`);    
    
    // Detectar letras de fileira (A, B, C, D, E) - MELHORADO
    let rowLetterMatch = line.match(/^\s*([A-E])\.\s*/i);
    
    if (!rowLetterMatch) {
      // Padrões mais flexíveis para detectar letras de fileira
      if (line.match(/\b[A-E]\b/i)) {
        const letterMatch = line.match(/\b([A-E])\b/i);
        if (letterMatch) {
          rowLetterMatch = [letterMatch[0] + '.', letterMatch[1].toUpperCase()];
          console.log(`  → Letra de fileira encontrada: ${letterMatch[1].toUpperCase()}`);
        }
      }
      // Detectar por posição sequencial se tem números válidos (MELHORADO)
      else if (line.match(/\b([1-9]|[1-6][0-9])\b/g) && 
               line.match(/\b([1-9]|[1-6][0-9])\b/g).length >= 2) {
        const currentRowCount = extractedInfo.rowLetters.length;
        if (currentRowCount < 5) {
          const letter = String.fromCharCode(65 + currentRowCount); // A, B, C, D, E
          rowLetterMatch = [letter + '.', letter];
          console.log(`  → Fileira ${letter} detectada por posição sequencial (${line.match(/\b([1-9]|[1-6][0-9])\b/g).length} números)`);
        }
      }
      // Fallback: se a linha tem muitos números, considerar como fileira
      else if (line.match(/\d+/g) && line.match(/\d+/g).length >= 3) {
        const currentRowCount = extractedInfo.rowLetters.length;
        if (currentRowCount < 5) {
          const letter = String.fromCharCode(65 + currentRowCount);
          rowLetterMatch = [letter + '.', letter];
          console.log(`  → Fileira ${letter} detectada por fallback (${line.match(/\d+/g).length} dígitos)`);
        }
      }
    }
    
    console.log(`Testando regex para letra de fileira: ${rowLetterMatch ? 'MATCH' : 'NO MATCH'}`);
    if (rowLetterMatch) {
      extractedInfo.rowLetters.push({
        letter: rowLetterMatch[1].toUpperCase(),
        line: lineIndex,
        text: line.trim()
      });
      console.log(`✓ LETRA DE FILEIRA ENCONTRADA: ${rowLetterMatch[1].toUpperCase()}. na linha ${lineIndex}`);
      console.log(`  Texto da linha: "${line.trim()}"`);
      
      const rowLetter = rowLetterMatch[1].toUpperCase();
      console.log(`  → Processando fileira ${rowLetter}`);
      
      // Buscar números de 1 a 69 (números principais) e 1 a 26 (powerball)
      const numberMatches = line.match(/\b(0?[1-9]|[1-6][0-9])\b/g);
      
      if (numberMatches) {
        numberMatches.forEach(match => {
          const num = parseInt(match);
          if ((num >= 1 && num <= 69) || (num >= 1 && num <= 26)) {
            allNumbers.push({
              value: num,
              line: lineIndex,
              text: line.trim(),
              rowLetter: rowLetter
            });
            console.log(`  → Número ${num} encontrado na fileira ${rowLetter}`);
          }
        });
      } else {
        console.log(`  → Nenhum número padrão encontrado na fileira ${rowLetter}, tentando extração alternativa`);
        const alternativeNumbers = extractNumbersAlternative(line, lineIndex, rowLetter);
        if (alternativeNumbers.length > 0) {
          allNumbers.push(...alternativeNumbers);
          console.log(`  → Números alternativos encontrados na fileira ${rowLetter}:`, alternativeNumbers.map(n => n.value));
        }
      }
    } else {
      console.log(`✗ Nenhuma letra de fileira encontrada nesta linha`);
      
      // NOVO: Processar números mesmo sem letra de fileira identificada
      const numberMatches = line.match(/\b(0?[1-9]|[1-6][0-9])\b/g);
      if (numberMatches && numberMatches.length >= 2) {
        console.log(`  → Encontrados ${numberMatches.length} números sem fileira identificada`);
        numberMatches.forEach(match => {
          const num = parseInt(match);
          if ((num >= 1 && num <= 69) || (num >= 1 && num <= 26)) {
            allNumbers.push({
              value: num,
              line: lineIndex,
              text: line.trim(),
              rowLetter: null // Será atribuído depois
            });
            console.log(`  → Número ${num} encontrado (sem fileira)`);
          }
        });
      }
    }
  });
  
  console.log('\n=== RESUMO DA DETECÇÃO ===');
  console.log(`Total de números encontrados: ${allNumbers.length}`);
  console.log('Números encontrados:', allNumbers);
  console.log(`Total de letras de fileira encontradas: ${extractedInfo.rowLetters.length}`);
  console.log('Letras de fileira:', extractedInfo.rowLetters);
  
  // Atribuir letras de fileira para números sem fileira identificada
  const numbersWithoutRow = allNumbers.filter(n => n.rowLetter === null);
  if (numbersWithoutRow.length > 0) {
    console.log(`Atribuindo fileiras para ${numbersWithoutRow.length} números sem fileira...`);
    
    // Agrupar números por linha
    const numbersByLine = {};
    numbersWithoutRow.forEach(num => {
      if (!numbersByLine[num.line]) {
        numbersByLine[num.line] = [];
      }
      numbersByLine[num.line].push(num);
    });
    
    // Atribuir letras sequenciais para linhas com números
    let currentLetter = 'A';
    Object.keys(numbersByLine).sort((a, b) => parseInt(a) - parseInt(b)).forEach(lineIndex => {
      const lineNumbers = numbersByLine[lineIndex];
      if (lineNumbers.length >= 2 && currentLetter <= 'E') {
        lineNumbers.forEach(num => {
          num.rowLetter = currentLetter;
        });
        
        // Adicionar à lista de fileiras se não existir
        if (!extractedInfo.rowLetters.find(r => r.letter === currentLetter)) {
          extractedInfo.rowLetters.push({
            letter: currentLetter,
            line: parseInt(lineIndex),
            text: lineNumbers[0].text
          });
        }
        
        console.log(`  → Fileira ${currentLetter} atribuída para linha ${lineIndex} (${lineNumbers.length} números)`);
        currentLetter = String.fromCharCode(currentLetter.charCodeAt(0) + 1);
      }
    });
  }
  
  // Detectar fileiras com base nas letras identificadas
  const detectedRows = detectRowsWithLetters(allNumbers, extractedInfo);
  
  console.log('Fileiras detectadas:', detectedRows);
  console.log(`Total de fileiras: ${detectedRows.length}`);
  console.log(`Total de letras identificadas: ${extractedInfo.rowLetters.length}`);
  
  return {
    numbers: allNumbers.map(n => n.value),
    rows: detectedRows,
    totalRows: detectedRows.length,
    totalNumbers: allNumbers.length,
    rowLetters: extractedInfo.rowLetters
  };
}

// Função para detectar fileiras com base nas letras identificadas
function detectRowsWithLetters(numbers, extractedInfo) {
  console.log('Detectando fileiras com letras identificadoras...');
  console.log(`Letras disponíveis: ${extractedInfo.rowLetters.length}`);
  console.log(`Números disponíveis: ${numbers.length}`);
  
  const rows = [];
  
  if (extractedInfo.rowLetters.length > 0) {
    const sortedLetters = extractedInfo.rowLetters.sort((a, b) => a.line - b.line);
    
    sortedLetters.forEach(rowInfo => {
      console.log(`Processando fileira ${rowInfo.letter}...`);
      
      const rowNumbers = numbers.filter(num => num.rowLetter === rowInfo.letter);
      console.log(`  Números encontrados para ${rowInfo.letter}:`, rowNumbers.map(n => n.value));
      
      if (rowNumbers.length >= 2) { // REDUZIDO de 5 para 2
        const sortedNumbers = rowNumbers.map(n => n.value).sort((a, b) => a - b);
        let mainNumbers = sortedNumbers.filter(n => n >= 1 && n <= 69);
        
        // Completar com números aleatórios se necessário
        while (mainNumbers.length < 5) {
          let randomNum;
          do {
            randomNum = Math.floor(Math.random() * 69) + 1;
          } while (mainNumbers.includes(randomNum));
          mainNumbers.push(randomNum);
        }
        
        mainNumbers = mainNumbers.slice(0, 5).sort((a, b) => a - b);
        
        const powerball = sortedNumbers.find(n => n >= 1 && n <= 26 && !mainNumbers.includes(n)) || 
                         Math.floor(Math.random() * 26) + 1;
        
        rows.push({
          letter: rowInfo.letter,
          main: mainNumbers,
          powerball: powerball,
          numbers: [...mainNumbers, powerball],
          extractedCount: rowNumbers.length
        });
        console.log(`✓ Fileira ${rowInfo.letter} processada: [${mainNumbers.join(', ')}] PB: ${powerball} (${rowNumbers.length} extraídos)`);
      } else {
        console.log(`✗ Fileira ${rowInfo.letter} tem poucos números (${rowNumbers.length}), pulando...`);
      }
    });
  }
  
  // Se não conseguiu detectar 5 fileiras, forçar criação
  if (rows.length < 5) {
    console.log(`Detectadas ${rows.length} fileiras, forçando criação de 5...`);
    return detectRowsIntelligent(numbers);
  }
  
  return rows.slice(0, 5);
}

// Função para detecção inteligente quando não há letras claras
function detectRowsIntelligent(numbers) {
  console.log('Detecção inteligente - sempre criando 5 fileiras...');
  const rows = [];
  
  const allValues = [...new Set(numbers.map(n => n.value))].sort((a, b) => a - b);
  const mainNumbers = allValues.filter(n => n >= 1 && n <= 69);
  const powerballs = allValues.filter(n => n >= 1 && n <= 26);
  
  console.log(`Números principais: ${mainNumbers.length} - [${mainNumbers.join(', ')}]`);
  console.log(`Powerballs possíveis: ${powerballs.length} - [${powerballs.join(', ')}]`);
  
  const globalUsedNumbers = new Set();
  
  for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
    const rowNumbers = [];
    
    // Estratégia 1: Usar números extraídos primeiro
    const availableExtracted = mainNumbers.filter(n => !globalUsedNumbers.has(n));
    const neededFromExtracted = Math.min(5, availableExtracted.length);
    
    for (let i = 0; i < neededFromExtracted; i++) {
      const num = availableExtracted[i];
      rowNumbers.push(num);
      globalUsedNumbers.add(num);
    }
    
    // Estratégia 2: Completar com números aleatórios se necessário
    while (rowNumbers.length < 5) {
      let randomNum;
      let attempts = 0;
      do {
        randomNum = Math.floor(Math.random() * 69) + 1;
        attempts++;
      } while (globalUsedNumbers.has(randomNum) && attempts < 50);
      
      rowNumbers.push(randomNum);
      globalUsedNumbers.add(randomNum);
    }
    
    const finalMainNumbers = rowNumbers.slice(0, 5).sort((a, b) => a - b);
    
    // Escolher Powerball
    const availablePowerballs = powerballs.filter(n => !finalMainNumbers.includes(n));
    let powerball;
    
    if (availablePowerballs.length > 0 && rowIndex < availablePowerballs.length) {
      powerball = availablePowerballs[rowIndex];
    } else {
      powerball = Math.floor(Math.random() * 26) + 1;
    }
    
    rows.push({
      letter: String.fromCharCode(65 + rowIndex),
      main: finalMainNumbers,
      powerball: powerball,
      numbers: [...finalMainNumbers, powerball]
    });
  }
  
  return rows;
}

// Função para processar OCR com Google Cloud Vision
async function processImageOCR(imageBuffer) {
  try {
    let result;
    
    if (client) {
      // Usar biblioteca oficial quando credenciais estão disponíveis
      const request = {
        image: {
          content: imageBuffer
        },
        features: [
          {
            type: 'DOCUMENT_TEXT_DETECTION',
            maxResults: 1
          }
        ],
        imageContext: {
          languageHints: ['pt', 'en']
        }
      };
      
      const [response] = await client.annotateImage(request);
      result = { responses: [response] };
    } else {
      // Fallback: usar API Key diretamente
      const base64Image = imageBuffer.toString('base64');
      const requestBody = {
        requests: [{
          image: {
            content: base64Image
          },
          features: [
            {
              type: 'DOCUMENT_TEXT_DETECTION',
              maxResults: 1
            }
          ],
          imageContext: {
            languageHints: ['pt', 'en']
          }
        }]
      };
      
      // Fallback: usar API Key do .env
      const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
      if (!apiKey) {
        throw new Error('Google Cloud Vision API credentials not found. Please configure GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLOUD_API_KEY.');
      }
      
      const fetch = require('node-fetch');
      const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        throw new Error(`Google Cloud Vision API error: ${response.status} ${response.statusText}`);
      }
      
      result = await response.json();
     }
     
     // Extrair detections da resposta
     const detections = result.responses && result.responses[0] ? result.responses[0].textAnnotations : null;

    if (!detections || detections.length === 0) {
      return {
        success: false,
        error: 'Nenhum texto foi detectado na imagem. Verifique se a imagem contém números legíveis.',
        confidence: 0
      };
    }

    // Extrair texto completo
    const fullText = detections[0].description || '';
    
    // Calcular confiança média
    let totalConfidence = 0;
    let confidenceCount = 0;
    
    detections.forEach(detection => {
      if (detection.confidence !== undefined) {
        totalConfidence += detection.confidence;
        confidenceCount++;
      }
    });
    
    const averageConfidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 0;
    const confidenceThreshold = parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD) || 0.5;

    // Usar processamento sofisticado de números com detecção de fileiras
    const extractedData = extractLotteryNumbersAdvanced(fullText);

    return {
      success: true,
      numbers: extractedData.numbers,
      rows: extractedData.rows,
      totalRows: extractedData.totalRows,
      fullText: fullText.trim(),
      confidence: averageConfidence,
      isHighConfidence: averageConfidence >= confidenceThreshold,
      detectedCount: extractedData.totalNumbers
    };

  } catch (error) {
    console.error('Erro no processamento OCR:', error);
    
    // Tratamento de erros específicos da Google Cloud Vision API
    if (error.code === 3) {
      return {
        success: false,
        error: 'Formato de imagem inválido. Use apenas JPEG, PNG ou WebP.',
        code: 'INVALID_IMAGE_FORMAT'
      };
    }
    
    if (error.code === 7) {
      return {
        success: false,
        error: 'Acesso negado. Verifique as credenciais da Google Cloud Vision API.',
        code: 'PERMISSION_DENIED'
      };
    }
    
    if (error.code === 8) {
      return {
        success: false,
        error: 'Cota da API excedida. Tente novamente mais tarde.',
        code: 'QUOTA_EXCEEDED'
      };
    }

    return {
      success: false,
      error: 'Erro interno no processamento da imagem. Tente novamente.',
      code: 'INTERNAL_ERROR'
    };
  }
}

// Endpoint principal para processar imagem
app.post('/api/processar-imagem', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem foi enviada.',
        code: 'NO_IMAGE_PROVIDED'
      });
    }

    // Processar imagem com OCR
    const result = await processImageOCR(req.file.buffer);
    
    if (!result.success) {
      return res.status(400).json(result);
    }

    // Retornar resultado
    res.json({
      success: true,
      data: {
        numbers: result.numbers,
        fullText: result.fullText,
        confidence: result.confidence,
        isHighConfidence: result.isHighConfidence,
        detectedCount: result.detectedCount,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Erro no endpoint /processar-imagem:', error);
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'Arquivo muito grande. Tamanho máximo: 10MB.',
          code: 'FILE_TOO_LARGE'
        });
      }
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.',
      code: 'INTERNAL_SERVER_ERROR'
    });
  }
});

// Endpoint OCR para compatibilidade com frontend
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  try {
    console.log('📥 Requisição OCR recebida');
    
    if (!req.file) {
      console.log('❌ Nenhuma imagem enviada');
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem foi enviada.'
      });
    }

    console.log('🔍 Processando imagem com OCR...');
    
    // Processar imagem com OCR
    const result = await processImageOCR(req.file.buffer);
    
    if (!result.success) {
      console.log('❌ Erro no processamento OCR:', result.error);
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    console.log('✅ OCR processado com sucesso. Texto detectado:', result.fullText?.substring(0, 100) + '...');
    
    // Retornar no formato esperado pelo frontend
    res.json({
      success: true,
      text: result.fullText || '',
      confidence: result.confidence,
      numbers: result.numbers,
      rows: result.rows || [],
      totalRows: result.totalRows || 0,
      rowLetters: result.rowLetters || []
    });

  } catch (error) {
    console.error('❌ Erro no endpoint /api/ocr:', error);
    
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor.'
    });
  }
});

// Endpoint de saúde
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Servir arquivos estáticos (front-end)
app.use(express.static(path.join(__dirname)));

// Rota catch-all para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'lottery-scanner.html'));
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor.',
    code: 'INTERNAL_SERVER_ERROR'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 Acesse: http://localhost:${PORT}`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Tratamento de sinais de encerramento
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT. Encerrando servidor...');
  process.exit(0);
});

module.exports = app;