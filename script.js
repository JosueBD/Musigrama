// === ESTRUCTURA DE DATOS JSON ===
const MUSIGRAMA_DATA = {
    "titulo": "Musigrama",
    "ancho_tablero": 20,
    "alto_tablero": 20,
    "palabras": [
        // Las pistas y coordenadas están definidas aquí
        { "id": 1, "respuesta": "PENTAGRAMA", "pista": "1. Conjunto de cinco líneas donde se escriben las notas.", "direccion": "horizontal", "inicio_x": 12, "inicio_y": 1, "numero_visual": 1 },
        { "id": 2, "respuesta": "NEGRA", "pista": "2. Figura musical que dura un tiempo (4/4)", "direccion": "vertical", "inicio_x": 14, "inicio_y": 1, "numero_visual": 2 },
        { "id": 3, "respuesta": "BEMOL", "pista": "3. Signo que baja la nota medio tono", "direccion": "vertical", "inicio_x": 5, "inicio_y": 3, "numero_visual": 3 },
        { "id": 4, "respuesta": "METRONOMO", "pista": "4. Aparato utilizado para marcar el pulso y la velocidad", "direccion": "vertical", "inicio_x": 16, "inicio_y": 3, "numero_visual": 4 },
        { "id": 5, "respuesta": "SOL", "pista": "5. Clave que se ubica en la segunda línea del pentagrama", "direccion": "vertical", "inicio_x": 15, "inicio_y": 4, "numero_visual": 5 },
        { "id": 6, "respuesta": "REDONDA", "pista": "6. Figura musical que dura cuatro tiempos (4/4)", "direccion": "horizontal", "inicio_x": 12, "inicio_y": 4, "numero_visual": 6 },
        { "id": 7, "respuesta": "SEMITONO", "pista": "7. La distancia mínima entre dos notas en la música occidental", "direccion": "horizontal", "inicio_x": 4, "inicio_y": 7, "numero_visual": 7 },
        { "id": 8, "respuesta": "INTERVALO", "pista": "8. Distancia de altura que hay entre dos notas musicales", "direccion": "vertical", "inicio_x": 11, "inicio_y": 7, "numero_visual": 8 },
        { "id": 9, "respuesta": "FA", "pista": "9. Nota que se encuentra entre Mi y Sol", "direccion": "vertical", "inicio_x": 13, "inicio_y": 7, "numero_visual": 9 },
        { "id": 10, "respuesta": "BECUADRO", "pista": "10. Signo que anula el efecto de un sostenido o un bemol", "direccion": "horizontal", "inicio_x": 7, "inicio_y": 10, "numero_visual": 10 },
        { "id": 11, "respuesta": "SILENCIO", "pista": "11. Símbolo que indica la ausencia de sonido", "direccion": "vertical", "inicio_x": 3, "inicio_y": 11, "numero_visual": 11 },
        { "id": 12, "respuesta": "FA", "pista": "12. Clave utilizada generalmente para instrumentos graves", "direccion": "horizontal", "inicio_x": 5, "inicio_y": 13, "numero_visual": 12 },
        { "id": 13, "respuesta": "ESCALA", "pista": "13. Sucesión ordenada de notas consecutivas", "direccion": "vertical", "inicio_x": 4, "inicio_y": 13, "numero_visual": 13 },
        { "id": 14, "respuesta": "SOSTENIDO", "pista": "14. Signo que eleva la nota medio tono", "direccion": "horizontal", "inicio_x": 3, "inicio_y": 15, "numero_visual": 14 },
        { "id": 15, "respuesta": "BARRA", "pista": "15. La línea vertical que separa un compás de otro", "direccion": "horizontal", "inicio_x": 0, "inicio_y": 17, "numero_visual": 15 }
    ]
};

const gridContainer = document.getElementById('crossword-grid');
const horizontalCluesDiv = document.getElementById('horizontal-clues');
const verticalCluesDiv = document.getElementById('vertical-clues');

// Mapa de estado interno: guarda (x, y) -> {letra_correcta, pistas_que_cruzan}
const boardMap = new Map(); 

// --- FUNCIONES DE INICIALIZACIÓN ---

function initMusigrama() {
    buildBoardMap();
    renderGrid();
    renderClues();
    addInputListeners();
}

// 1. Construye el mapa interno (qué letra va en cada coordenada)
function buildBoardMap() {
    MUSIGRAMA_DATA.palabras.forEach(palabra => {
        // Normaliza la respuesta (quita tildes) para la validación del usuario
        const respuesta = palabra.respuesta.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        for (let i = 0; i < respuesta.length; i++) {
            let x = palabra.inicio_x;
            let y = palabra.inicio_y;

            if (palabra.direccion === 'horizontal') {
                x += i;
            } else { // vertical
                y += i;
            }

            const key = `${x},${y}`;
            const letter = respuesta[i];
            
            if (boardMap.has(key)) {
                // Es un cruce
                const cellData = boardMap.get(key);
                cellData.clues.push(palabra.numero_visual);
            } else {
                // Celda nueva
                boardMap.set(key, { letter, clues: [palabra.numero_visual] });
            }
        }
    });
}

// 2. Dibuja la cuadrícula vacía en el HTML
function renderGrid() {
    gridContainer.style.gridTemplateColumns = `repeat(${MUSIGRAMA_DATA.ancho_tablero}, var(--cell-size))`;
    gridContainer.style.gridTemplateRows = `repeat(${MUSIGRAMA_DATA.alto_tablero}, var(--cell-size))`;

    for (let y = 0; y < MUSIGRAMA_DATA.alto_tablero; y++) {
        for (let x = 0; x < MUSIGRAMA_DATA.ancho_tablero; x++) {
            const key = `${x},${y}`;
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';

            if (boardMap.has(key)) {
                // Es una celda activa (blanca)
                const data = boardMap.get(key);

                const input = document.createElement('input');
                input.maxLength = 1;
                input.type = 'text';
                input.dataset.correctLetter = data.letter; // Guarda la respuesta correcta

                cellElement.appendChild(input);

                // Coloca el número de pista si la celda es un inicio de palabra
                const isStartOfClue = MUSIGRAMA_DATA.palabras.some(p => 
                    p.inicio_x === x && p.inicio_y === y
                );

                if (isStartOfClue) {
                    const numberSpan = document.createElement('span');
                    numberSpan.className = 'clue-number';
                    // Encuentra el número de pista más pequeño en esa coordenada
                    numberSpan.textContent = data.clues.sort((a, b) => a - b)[0]; 
                    cellElement.appendChild(numberSpan);
                }

            } else {
                // Es una casilla negra
                cellElement.classList.add('empty');
            }
            gridContainer.appendChild(cellElement);
        }
    }
}

// 3. Muestra las pistas en el panel lateral
function renderClues() {
    const horizontales = MUSIGRAMA_DATA.palabras.filter(p => p.direccion === 'horizontal');
    const verticales = MUSIGRAMA_DATA.palabras.filter(p => p.direccion === 'vertical');

    const createClueList = (arr, container) => {
        const ul = document.createElement('ul');
        ul.style.listStyleType = 'none';
        ul.style.paddingLeft = '0';
        arr.forEach(p => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${p.numero_visual}.</strong> ${p.pista.substring(p.pista.indexOf('.') + 1).trim()}`;
            ul.appendChild(li);
        });
        container.appendChild(ul);
    };
    
    // Limpia y añade las listas de pistas
    horizontalCluesDiv.innerHTML = '<h2>Horizontales</h2>';
    verticalCluesDiv.innerHTML = '<h2>Verticales</h2>';
    
    createClueList(horizontales.sort((a, b) => a.numero_visual - b.numero_visual), horizontalCluesDiv);
    createClueList(verticales.sort((a, b) => a.numero_visual - b.numero_visual), verticalCluesDiv);
}

// --- LÓGICA DEL JUEGO ---

// 4. Maneja la entrada de las letras
function addInputListeners() {
    gridContainer.addEventListener('input', (event) => {
        const input = event.target;
        if (input.tagName !== 'INPUT') return;

        let letter = input.value.toUpperCase();
        
        // Normaliza el input (quita tildes)
        letter = letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        
        input.value = letter; // Muestra la letra normalizada
        
        const correctLetter = input.dataset.correctLetter;

        if (letter.length === 1) {
            // Validación visual: Verde si es correcto, Rojo si es incorrecto
            if (letter === correctLetter) {
                input.style.color = 'green';
                checkVictory(); // Revisa si ya se completó todo
            } else {
                input.style.color = 'red';
            }
            // Mueve el foco al siguiente input (mejora la experiencia de usuario)
            focusNextCell(input);
        } else if (letter.length === 0) {
            input.style.color = 'var(--main-color)'; // Vuelve al color por defecto si se borra
        }
    });
}

// Mueve el foco al siguiente campo de texto
function focusNextCell(currentInput) {
    const inputs = Array.from(gridContainer.querySelectorAll('input'));
    const currentIndex = inputs.indexOf(currentInput);
    if (currentIndex > -1 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus();
    }
}

// Chequea si el usuario ha completado todo el crucigrama
function checkVictory() {
    const allInputs = gridContainer.querySelectorAll('input');
    let completed = true;
    allInputs.forEach(input => {
        if (input.value !== input.dataset.correctLetter) {
            completed = false;
        }
    });
    
    if (completed) {
        // Usa setTimeout para asegurar que la última letra se dibuje antes del mensaje
        setTimeout(() => {
            alert('🎉 ¡Felicidades! Has completado el Musigrama.');
        }, 100);
    }
}

// Inicia la aplicación cuando la página se carga
document.addEventListener('DOMContentLoaded', initMusigrama);
