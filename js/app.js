// ===================== DOM REFS =====================
const tabs = document.querySelectorAll(".tab");
const inputValor = document.getElementById("valor");
const visualArea = document.getElementById("visual-area");
const tipoActual = document.getElementById("tipo-actual");
const sizeValue = document.getElementById("size-value");
const lastAction = document.getElementById("last-action");
const descTipo = document.getElementById("desc-tipo");
const visualTitle = document.getElementById("visual-title");
const visualSubtitle = document.getElementById("visual-subtitle");
const legendContent = document.getElementById("legend-content");
const toast = document.getElementById("toast");

const btnInsertar = document.getElementById("btn-insertar");
const btnEliminar = document.getElementById("btn-eliminar");
const btnLimpiar = document.getElementById("btn-limpiar");
const toggleThemeBtn = document.getElementById("toggle-theme");

const codeStructure = document.getElementById("code-structure");
const codeAction = document.getElementById("code-action");
const pseudocodeLines = document.getElementById("pseudocode-lines");
const codeSubtitle = document.getElementById("code-subtitle");

const btnPaso = document.getElementById("btn-paso");
const modoPaso = document.getElementById("modo-paso");

// ===================== STATE =====================
let tipo = "lista";
let estructura = [];
let ultimoInsertado = null;
let operacionActual = "espera";
let enProcesoPaso = false;

// ÁRBOL BST
let treeRoot = null;
class TNode {
  constructor(v) { this.val = v; this.left = null; this.right = null; }
}
function treeInsert(root, v) {
  if (!root) return new TNode(v);
  if (v < root.val) root.left = treeInsert(root.left, v);
  else if (v > root.val) root.right = treeInsert(root.right, v);
  return root;
}
function treeDelete(root, v) {
  if (!root) return null;
  if (v < root.val) { root.left = treeDelete(root.left, v); }
  else if (v > root.val) { root.right = treeDelete(root.right, v); }
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let succ = root.right;
    while (succ.left) succ = succ.left;
    root.val = succ.val;
    root.right = treeDelete(root.right, succ.val);
  }
  return root;
}
function treeSearch(root, v) {
  if (!root) return null;
  if (root.val === v) return root;
  return v < root.val ? treeSearch(root.left, v) : treeSearch(root.right, v);
}
function treeInorder(root, arr = []) {
  if (!root) return arr;
  treeInorder(root.left, arr);
  arr.push(root.val);
  treeInorder(root.right, arr);
  return arr;
}

// GRAFO
let graphNodes = {}, graphEdges = [], graphDirected = false;

// JUEGO
let gameIdx = 0, gameScore = 0, gameCorrect = 0, gameWrong = 0;
let gameAnswered = false, gameOrder = [];

// ===================== TEXTOS LINEALES =====================
const textos = {
  lista: { nombre: "Lista", titulo: "Visualización de Lista Enlazada", subtitulo: "Los nodos se muestran conectados secuencialmente", descripcion: "Estructura lineal con nodos enlazados" },
  pila:  { nombre: "Pila",  titulo: "Visualización de Pila",           subtitulo: "LIFO: el último en entrar es el primero en salir",  descripcion: "Estructura LIFO" },
  cola:  { nombre: "Cola",  titulo: "Visualización de Cola",           subtitulo: "FIFO: el primero en entrar es el primero en salir", descripcion: "Estructura FIFO" }
};

const pseudocodigos = {
  lista: {
    espera:   { subtitulo: "Operación pendiente sobre lista enlazada", lineas: ["crear lista vacía","esperar operación del usuario","mostrar nodos enlazados en pantalla"], activa: -1 },
    insertar: { subtitulo: "Inserción al final de la lista enlazada",  lineas: ["nuevo ← crear nodo(valor)","si lista está vacía entonces","    cabeza ← nuevo","si no","    recorrer hasta el último nodo","    último.siguiente ← nuevo","nuevo.siguiente ← NULL"], activa: 5 },
    eliminar: { subtitulo: "Eliminación del último nodo de la lista",  lineas: ["si lista está vacía entonces","    terminar","si solo existe un nodo entonces","    cabeza ← NULL","si no","    recorrer hasta el penúltimo nodo","    penúltimo.siguiente ← NULL"], activa: 6 },
    limpiar:  { subtitulo: "Reinicio completo de la lista",            lineas: ["mientras la lista tenga nodos","    eliminar referencia al siguiente nodo","vaciar lista","mostrar estructura vacía"], activa: 2 }
  },
  pila: {
    espera:   { subtitulo: "Operación pendiente sobre pila",  lineas: ["crear pila vacía","esperar operación del usuario","mostrar elementos de abajo hacia arriba"], activa: -1 },
    insertar: { subtitulo: "Operación PUSH en pila",          lineas: ["nuevo ← valor","insertar nuevo en el tope","actualizar referencia del tope","mostrar pila actualizada"], activa: 1 },
    eliminar: { subtitulo: "Operación POP en pila",           lineas: ["si pila está vacía entonces","    terminar","eliminar elemento del tope","actualizar nuevo tope","mostrar pila actualizada"], activa: 2 },
    limpiar:  { subtitulo: "Reinicio completo de la pila",    lineas: ["mientras la pila tenga elementos","    desapilar elemento","vaciar pila","mostrar estructura vacía"], activa: 2 }
  },
  cola: {
    espera:   { subtitulo: "Operación pendiente sobre cola",  lineas: ["crear cola vacía","esperar operación del usuario","mostrar frente y final"], activa: -1 },
    insertar: { subtitulo: "Operación ENQUEUE en cola",       lineas: ["nuevo ← valor","insertar nuevo al final","actualizar puntero final","mostrar cola actualizada"], activa: 1 },
    eliminar: { subtitulo: "Operación DEQUEUE en cola",       lineas: ["si cola está vacía entonces","    terminar","eliminar elemento del frente","mover frente al siguiente nodo","mostrar cola actualizada"], activa: 2 },
    limpiar:  { subtitulo: "Reinicio completo de la cola",    lineas: ["mientras la cola tenga elementos","    desencolar elemento","vaciar cola","mostrar estructura vacía"], activa: 2 }
  }
};

// ===================== PSEUDOCODIGOS ÁRBOL / GRAFO =====================
const treePseudos = {
  espera:   { accion: "En espera",  lineas: ["// Árbol BST listo","esperar operación del usuario"] },
  insertar: { accion: "Insertar",   lineas: ["si árbol vacío → raíz ← nuevo nodo","si valor < raíz → ir al subárbol izquierdo","si valor > raíz → ir al subárbol derecho","repetir hasta encontrar posición NULL","insertar nuevo nodo en esa posición"] },
  eliminar: { accion: "Eliminar",   lineas: ["buscar nodo con el valor dado","si es hoja → eliminarlo directamente","si tiene un hijo → sustituir por ese hijo","si tiene dos hijos → hallar sucesor inorden","reemplazar valor y eliminar sucesor"] },
  buscar:   { accion: "Buscar",     lineas: ["comenzar en la raíz","si valor == nodo → encontrado","si valor < nodo → ir a la izquierda","si valor > nodo → ir a la derecha","si nodo == NULL → no encontrado"] },
  inorden:  { accion: "Inorden",    lineas: ["recorrer subárbol izquierdo","visitar nodo actual","recorrer subárbol derecho","resultado: nodos en orden ascendente"] }
};

const graphPseudos = {
  espera:        { accion: "En espera",     lineas: ["// Grafo listo","esperar operación del usuario"] },
  agregar_nodo:  { accion: "Agregar nodo",  lineas: ["crear nodo con la etiqueta dada","agregar al conjunto de vértices","actualizar disposición visual"] },
  agregar_arista:{ accion: "Agregar arista",lineas: ["verificar que ambos nodos existen","crear arista (origen, destino, peso)","agregar a la lista de aristas","re-dibujar grafo"] },
  bfs: { accion: "BFS", lineas: ["encolar nodo inicial","mientras cola no esté vacía","    desencolar nodo actual","    marcar como visitado","    encolar vecinos no visitados","mostrar orden de visita"] },
  dfs: { accion: "DFS", lineas: ["apilar nodo inicial","mientras pila no esté vacía","    desapilar nodo actual","    si no visitado → marcar visitado","    apilar vecinos no visitados","mostrar orden de visita"] }
};

// ===================== PREGUNTAS DEL JUEGO =====================
const QUESTIONS = [
  { q:"¿Cuál es la característica principal de una Pila (Stack)?", opts:["FIFO: el primero en entrar sale primero","LIFO: el último en entrar sale primero","Los elementos se acceden por índice","Los nodos están enlazados aleatoriamente"], correct:1, ex:"Una pila es LIFO (Last In, First Out). Piensa en una pila de platos: solo puedes tomar el del tope." },
  { q:"¿Qué operación de la Pila agrega un elemento al tope?", opts:["ENQUEUE","DEQUEUE","PUSH","PEEK"], correct:2, ex:"PUSH inserta un elemento en el tope de la pila. POP lo elimina." },
  { q:"¿Qué estructura usa una Cola (Queue)?", opts:["LIFO","FIFO","Random Access","Circular"], correct:1, ex:"Cola es FIFO (First In, First Out). Como una fila de personas en el banco." },
  { q:"En un árbol BST, ¿dónde se colocan los nodos menores al raíz?", opts:["A la derecha","Siempre al centro","A la izquierda","En el nivel más profundo"], correct:2, ex:"En un BST, los nodos con valor menor van al subárbol izquierdo, y los mayores al derecho." },
  { q:"¿Cuál es la complejidad promedio de búsqueda en un BST balanceado?", opts:["O(n)","O(n²)","O(log n)","O(1)"], correct:2, ex:"En un BST balanceado, la búsqueda es O(log n) porque en cada nivel se descarta la mitad del árbol." },
  { q:"¿Qué significa que un grafo sea 'dirigido'?", opts:["Tiene exactamente un camino entre nodos","Las aristas tienen una dirección específica","Todos los nodos están conectados entre sí","Las aristas tienen pesos numéricos"], correct:1, ex:"En un grafo dirigido, las aristas tienen dirección: puedes ir de A→B pero no necesariamente de B→A." },
  { q:"¿Qué recorrido de grafo usa una Cola (Queue)?", opts:["DFS — Depth First Search","BFS — Breadth First Search","Inorden","Postorden"], correct:1, ex:"BFS usa una cola para explorar todos los vecinos de un nodo antes de ir más profundo." },
  { q:"¿Cuál es la operación DEQUEUE en una Cola?", opts:["Agregar al final","Eliminar del frente","Agregar al frente","Ver el último elemento"], correct:1, ex:"DEQUEUE elimina y retorna el elemento del frente de la cola (el que entró primero)." },
  { q:"En una Lista Enlazada simple, el último nodo apunta a:", opts:["El primer nodo","Sí mismo","NULL","El nodo del medio"], correct:2, ex:"En una lista enlazada simple, el puntero del último nodo es NULL, indicando el fin de la lista." },
  { q:"¿Qué recorrido de árbol visita: izquierda → raíz → derecha?", opts:["Preorden","Postorden","Inorden","BFS"], correct:2, ex:"El recorrido Inorden en un BST produce los elementos en orden ascendente." },
  { q:"¿Cuál estructura de datos usarías para implementar 'deshacer' en un editor de texto?", opts:["Cola","Grafo","Árbol BST","Pila"], correct:3, ex:"Pila: cada acción se apila (PUSH). Al deshacer, se saca la última acción (POP). LIFO es perfecto." },
  { q:"¿Cuántos hijos puede tener un nodo en un árbol binario?", opts:["Exactamente 2","Entre 0 y 2","Entre 0 y infinito","Exactamente 1"], correct:1, ex:"En un árbol binario, cada nodo puede tener 0 (hoja), 1 o 2 hijos como máximo." },
  { q:"¿Cuál es la complejidad de PUSH y POP en una Pila?", opts:["O(n)","O(log n)","O(n²)","O(1)"], correct:3, ex:"PUSH y POP en una pila son O(1) porque siempre operan sobre el tope, sin recorrer la estructura." },
  { q:"¿Qué estructura usaría un SO para manejar la cola de impresión?", opts:["Pila","Lista Enlazada Simple","Cola","Árbol BST"], correct:2, ex:"Una Cola (FIFO) es perfecta: los documentos se imprimen en el orden en que fueron enviados." },
  { q:"¿Cuál es la diferencia entre un grafo y un árbol?", opts:["Los árboles tienen más nodos","Un árbol es un grafo sin ciclos con un nodo raíz","Los grafos son siempre dirigidos","Un árbol no tiene aristas"], correct:1, ex:"Un árbol es un caso especial de grafo: acíclico, conectado, con exactamente un nodo raíz." }
];

// ===================== UTILIDADES =====================
function esperar(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function mostrarToast(mensaje) {
  if (!toast) return;
  toast.textContent = mensaje;
  toast.classList.remove("show");
  void toast.offsetWidth;
  toast.classList.add("show");
}

function setVista(tipoActivo) {
  document.getElementById("view-lineal").style.display = ["lista","pila","cola"].includes(tipoActivo) ? "" : "none";
  document.getElementById("view-arbol").style.display  = tipoActivo === "arbol"  ? "" : "none";
  document.getElementById("view-grafo").style.display  = tipoActivo === "grafo"  ? "" : "none";
  document.getElementById("view-juego").style.display  = tipoActivo === "juego"  ? "" : "none";
  document.getElementById("view-desafio").style.display    = tipoActivo === "desafio"    ? "" : "none";
  document.getElementById("view-evaluacion").style.display = tipoActivo === "evaluacion" ? "" : "none";
}

// ===================== TABS =====================
tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    tipo = tab.dataset.type;
    setVista(tipo);

    if (["lista","pila","cola"].includes(tipo)) {
      estructura = [];
      ultimoInsertado = null;
      operacionActual = "espera";
      tipoActual.textContent = textos[tipo].nombre;
      lastAction.textContent = "Cambio de estructura";
      actualizarTextos();
      actualizarPseudocodigo();
      animarArea();
      render();
    } else if (tipo === "arbol") {
      tipoActual.textContent = "Árbol BST";
      actualizarInfoPanel();
    } else if (tipo === "grafo") {
      tipoActual.textContent = "Grafo";
      actualizarInfoPanel();
    } else if (tipo === "juego") {
      tipoActual.textContent = "Juego";
      startGame();
    } else if (tipo === "desafio") {
      tipoActual.textContent = "Desafíos";
      initDesafios();
    } else if (tipo === "evaluacion") {
      tipoActual.textContent = "Evaluación";
      initEvaluacion();
    }
    mostrarToast(`Ahora estás en: ${tab.textContent.trim()}`);
  });
});

// ===================== LISTA / PILA / COLA =====================
btnInsertar.addEventListener("click", insertar);
btnEliminar.addEventListener("click", eliminar);
btnLimpiar.addEventListener("click", limpiar);
btnPaso.addEventListener("click", ejecutarPasoAPaso);
inputValor.addEventListener("keydown", e => { if (e.key === "Enter") insertar(); });

function resaltarLineaPseudocodigo(indice) {
  pseudocodeLines.querySelectorAll("li").forEach((li, i) => {
    li.classList.toggle("active", i === indice);
  });
}

async function ejecutarPasoAPaso() {
  if (enProcesoPaso) return;
  const accion = modoPaso.value;

  if (accion === "insertar") {
    const valor = inputValor.value.trim();
    if (valor === "") { mostrarToast("Ingrese un número para insertar"); return; }
    enProcesoPaso = true;
    btnPaso.disabled = true; btnInsertar.disabled = true; btnEliminar.disabled = true;
    operacionActual = "insertar"; actualizarPseudocodigo();
    lastAction.textContent = "Paso 1: creando nodo"; mostrarToast("Paso 1: creando nodo");
    resaltarLineaPseudocodigo(0); await esperar(900);
    if (estructura.length === 0) {
      lastAction.textContent = "Paso 2: lista vacía"; mostrarToast("Paso 2: estructura vacía");
      resaltarLineaPseudocodigo(1); await esperar(900);
      lastAction.textContent = "Paso 3: nuevo nodo = cabeza"; mostrarToast("Paso 3: nodo es la cabeza");
      resaltarLineaPseudocodigo(2); await esperar(900);
    } else {
      lastAction.textContent = "Paso 2: recorriendo al final"; mostrarToast("Paso 2: recorriendo al último nodo");
      resaltarLineaPseudocodigo(4); await esperar(1000);
      lastAction.textContent = "Paso 3: enlazando nodo"; mostrarToast("Paso 3: enlazando nuevo nodo");
      resaltarLineaPseudocodigo(5); await esperar(1000);
    }
    estructura.push(valor); ultimoInsertado = valor; inputValor.value = "";
    animarArea(); render();
    lastAction.textContent = `Insertado: ${valor}`; mostrarToast(`Inserción completada: ${valor}`);
    resaltarLineaPseudocodigo(6); await esperar(700);
    btnPaso.disabled = false; btnInsertar.disabled = false; btnEliminar.disabled = false;
    enProcesoPaso = false;
    return;
  }

  if (accion === "eliminar") {
    if (estructura.length === 0) { mostrarToast("La estructura está vacía"); return; }
    enProcesoPaso = true;
    btnPaso.disabled = true; btnInsertar.disabled = true; btnEliminar.disabled = true;
    operacionActual = "eliminar"; actualizarPseudocodigo();
    lastAction.textContent = "Paso 1: verificando"; mostrarToast("Paso 1: verificando estructura");
    resaltarLineaPseudocodigo(0); await esperar(900);
    if (tipo === "lista") {
      if (estructura.length === 1) {
        resaltarLineaPseudocodigo(2); await esperar(900);
        resaltarLineaPseudocodigo(3); await esperar(900);
      } else {
        resaltarLineaPseudocodigo(5); await esperar(1000);
        resaltarLineaPseudocodigo(6); await esperar(1000);
      }
    } else {
      resaltarLineaPseudocodigo(2); await esperar(900);
    }
    let eliminado = tipo === "pila" ? estructura.pop() : tipo === "cola" ? estructura.shift() : estructura.pop();
    ultimoInsertado = null; animarArea(); render();
    lastAction.textContent = `Eliminado: ${eliminado}`; mostrarToast(`Eliminación completada: ${eliminado}`);
    await esperar(700);
    btnPaso.disabled = false; btnInsertar.disabled = false; btnEliminar.disabled = false;
    enProcesoPaso = false;
  }
}

function actualizarPseudocodigo() {
  if (!textos[tipo]) return; // la pestaña actual no es lista/pila/cola
  const bloque = pseudocodigos[tipo][operacionActual] || pseudocodigos[tipo].espera;
  codeStructure.textContent = textos[tipo].nombre;
  codeAction.textContent = operacionActual === "espera" ? "En espera" : operacionActual.charAt(0).toUpperCase() + operacionActual.slice(1);
  codeSubtitle.textContent = bloque.subtitulo;
  pseudocodeLines.innerHTML = "";
  bloque.lineas.forEach((linea, index) => {
    const li = document.createElement("li");
    li.textContent = linea;
    li.classList.add("dim");
    if (index === bloque.activa) li.classList.add("active");
    pseudocodeLines.appendChild(li);
  });
}

function actualizarTextos() {
  if (!textos[tipo]) return; // la pestaña actual no es lista/pila/cola
  actualizarInfoPanel();
  tipoActual.textContent = textos[tipo].nombre;
  visualTitle.textContent = textos[tipo].titulo;
  visualSubtitle.textContent = textos[tipo].subtitulo;
  descTipo.textContent = textos[tipo].descripcion;
  actualizarLeyenda();
}

function actualizarLeyenda() {
  if (tipo === "lista") {
    legendContent.innerHTML = `<div class="legend-item"><span class="legend-dot dot-node"></span><span>Nodo</span></div><div class="legend-item"><span class="legend-dot dot-special"></span><span>Cabeza / Cola</span></div>`;
  } else if (tipo === "pila") {
    legendContent.innerHTML = `<div class="legend-item"><span class="legend-dot dot-node"></span><span>Elemento</span></div><div class="legend-item"><span class="legend-dot dot-special"></span><span>Tope</span></div>`;
  } else {
    legendContent.innerHTML = `<div class="legend-item"><span class="legend-dot dot-node"></span><span>Elemento</span></div><div class="legend-item"><span class="legend-dot dot-special"></span><span>Frente / Final</span></div>`;
  }
}

function insertar() {
  if (!textos[tipo]) return; // la pestaña actual no es lista/pila/cola
  const valor = inputValor.value.trim();
  if (valor === "") return;
  estructura.push(valor);
  ultimoInsertado = valor;
  operacionActual = "insertar";
  actualizarPseudocodigo();
  lastAction.textContent = `Insertado: ${valor}`;
  inputValor.value = "";
  animarArea(); render();
  mostrarToast(`Se insertó ${valor}`);
}

function eliminar() {
  if (estructura.length === 0) { mostrarToast("La estructura está vacía"); return; }

  // Para lista enlazada: buscar el valor específico ingresado
  if (tipo === "lista") {
    const valorBuscado = inputValor.value.trim();
    if (valorBuscado !== "") {
      const idx = estructura.indexOf(valorBuscado);
      if (idx === -1) {
        mostrarToast(`⚠️ El valor "${valorBuscado}" no está en la lista`);
        animarArea();
        return;
      }
      // Animar el nodo encontrado antes de eliminar
      const nodos = visualArea.querySelectorAll(".node-box");
      if (nodos[idx]) nodos[idx].classList.add("node-remove");
      setTimeout(() => {
        estructura.splice(idx, 1);
        inputValor.value = "";
        ultimoInsertado = null;
        operacionActual = "eliminar";
        actualizarPseudocodigo();
        lastAction.textContent = `Eliminado: ${valorBuscado}`;
        animarArea(); render();
        mostrarToast(`✓ Se eliminó el nodo con valor ${valorBuscado}`);
      }, 260);
      return;
    }
  }

  // Para pila, cola y lista sin valor especificado: eliminar el elemento natural
  const selector = tipo === "lista" ? ".node-box" : ".node-stack, .node-queue";
  const nodos = visualArea.querySelectorAll(selector);
  if (nodos.length > 0) {
    const indice = tipo === "cola" ? 0 : nodos.length - 1;
    const nodoObjetivo = nodos[indice];
    if (nodoObjetivo) nodoObjetivo.classList.add("node-remove");
  }
  setTimeout(() => {
    let eliminado = tipo === "pila" ? estructura.pop() : tipo === "cola" ? estructura.shift() : estructura.pop();
    ultimoInsertado = null;
    operacionActual = "eliminar";
    actualizarPseudocodigo();
    lastAction.textContent = `Eliminado: ${eliminado}`;
    animarArea(); render();
    mostrarToast(`Se eliminó ${eliminado}`);
  }, 260);
}

function limpiar() {
  if (estructura.length === 0) { mostrarToast("No hay elementos para limpiar"); return; }
  visualArea.classList.add("updating");
  setTimeout(() => {
    estructura = []; ultimoInsertado = null; operacionActual = "limpiar";
    lastAction.textContent = "Estructura reiniciada";
    actualizarPseudocodigo(); render(); mostrarToast("Estructura limpiada");
    visualArea.classList.remove("updating");
  }, 180);
}

function animarArea() {
  visualArea.classList.add("updating");
  setTimeout(() => visualArea.classList.remove("updating"), 220);
}

function renderLista() {
  const wrapper = document.createElement("div");
  wrapper.className = "list-wrapper";
  estructura.forEach((valor, index) => {
    const group = document.createElement("div"); group.className = "linked-node";
    const content = document.createElement("div"); content.className = "linked-node-content";
    const nodeBox = document.createElement("div"); nodeBox.className = "node-box";
    if (index === 0 || index === estructura.length - 1) nodeBox.classList.add("special");
    const dataBox = document.createElement("div"); dataBox.className = "node-data"; dataBox.textContent = valor;
    const pointerBox = document.createElement("div"); pointerBox.className = "node-pointer"; pointerBox.textContent = "↗";
    nodeBox.appendChild(dataBox); nodeBox.appendChild(pointerBox);
    content.appendChild(nodeBox);
    if (estructura.length === 1) { const tag = document.createElement("div"); tag.className = "node-tag"; tag.textContent = "Cabeza / Cola"; content.appendChild(tag); }
    else if (index === 0) { const tag = document.createElement("div"); tag.className = "node-tag"; tag.textContent = "Cabeza"; content.appendChild(tag); }
    else if (index === estructura.length - 1) { const tag = document.createElement("div"); tag.className = "node-tag"; tag.textContent = "Cola"; content.appendChild(tag); }
    group.appendChild(content); wrapper.appendChild(group);
    const arrow = document.createElement("div"); arrow.className = "link-arrow"; arrow.innerHTML = "→"; wrapper.appendChild(arrow);
    if (index === estructura.length - 1) { const nullBox = document.createElement("div"); nullBox.className = "link-null"; nullBox.textContent = "NULL"; wrapper.appendChild(nullBox); }
  });
  visualArea.innerHTML = ""; visualArea.appendChild(wrapper);
}

function renderPila() {
  const wrapper = document.createElement("div"); wrapper.className = "stack-wrapper";
  [...estructura].reverse().forEach((valor, index) => {
    const node = document.createElement("div"); node.className = "node-stack node-enter"; node.textContent = valor;
    if (index === 0) {
      node.classList.add("top");
      const label = document.createElement("span"); label.className = "stack-label"; label.textContent = "Tope"; node.appendChild(label);
    }
    wrapper.appendChild(node);
  });
  visualArea.innerHTML = ""; visualArea.appendChild(wrapper);
}

function renderCola() {
  const wrapper = document.createElement("div"); wrapper.className = "queue-wrapper";
  estructura.forEach((valor, index) => {
    const node = document.createElement("div"); node.className = "node-queue node-enter"; node.textContent = valor;
    if (estructura.length === 1) { node.classList.add("front","rear"); const tag = document.createElement("span"); tag.className = "queue-tag"; tag.textContent = "Frente / Final"; node.appendChild(tag); }
    else if (index === 0) { node.classList.add("front"); const tag = document.createElement("span"); tag.className = "queue-tag"; tag.textContent = "Frente"; node.appendChild(tag); }
    else if (index === estructura.length - 1) { node.classList.add("rear"); const tag = document.createElement("span"); tag.className = "queue-tag"; tag.textContent = "Final"; node.appendChild(tag); }
    wrapper.appendChild(node);
    if (index < estructura.length - 1) { const arrow = document.createElement("div"); arrow.className = "arrow"; arrow.innerHTML = "→"; wrapper.appendChild(arrow); }
  });
  visualArea.innerHTML = ""; visualArea.appendChild(wrapper);
}

function resaltarUltimoInsertado() {
  if (!ultimoInsertado) return;
  const nodos = tipo === "lista" ? visualArea.querySelectorAll(".node-box") : visualArea.querySelectorAll(".node-stack, .node-queue");
  if (!nodos.length) return;
  const nodoObjetivo = nodos[nodos.length - 1];
  if (nodoObjetivo) {
    nodoObjetivo.classList.add("node-highlight");
    setTimeout(() => nodoObjetivo.classList.remove("node-highlight"), 700);
  }
}

function render() {
  sizeValue.textContent = estructura.length;
  if (estructura.length === 0) {
    visualArea.classList.add("empty");
    visualArea.innerHTML = `<div class="empty-state"><div class="empty-icon">∅</div><p>La estructura está vacía</p></div>`;
    return;
  }
  visualArea.classList.remove("empty");
  if (tipo === "lista") renderLista();
  else if (tipo === "pila") renderPila();
  else renderCola();
  resaltarUltimoInsertado();
}

// ===================== ÁRBOL BST =====================
function renderTreePseudo(action) {
  const p = treePseudos[action] || treePseudos.espera;
  document.getElementById("tree-code-action").textContent = p.accion;
  const ol = document.getElementById("tree-pseudocode");
  ol.innerHTML = "";
  p.lineas.forEach(l => { const li = document.createElement("li"); li.textContent = l; ol.appendChild(li); });
}

function renderTree(highlightVal = null, mode = "highlight") {
  const area = document.getElementById("tree-area");
  if (!treeRoot) {
    area.innerHTML = `<div class="empty-state"><div class="empty-icon">🌳</div><p>El árbol está vacío</p></div>`;
    return;
  }
  const W = Math.min(area.offsetWidth || 680, 680), H = 350;
  const nodeR = 24, nodes = [], edges = [];
  function layout(node, x, y, gap) {
    if (!node) return;
    nodes.push({ val: node.val, x, y, hl: node.val === highlightVal });
    if (node.left)  { edges.push({ x1:x, y1:y, x2:x-gap, y2:y+70 }); layout(node.left,  x-gap, y+70, gap/2); }
    if (node.right) { edges.push({ x1:x, y1:y, x2:x+gap, y2:y+70 }); layout(node.right, x+gap, y+70, gap/2); }
  }
  layout(treeRoot, W/2, 40, W/4);
  let svg = `<svg class="ds-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;
  edges.forEach(e => { svg += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" class="tree-edge"/>`; });
  nodes.forEach(n => {
    let cls = "tree-node-circle";
    if (n.hl && mode === "highlight") cls += " highlight";
    if (n.hl && mode === "found")     cls += " newnode";
    svg += `<circle cx="${n.x}" cy="${n.y}" r="${nodeR}" class="${cls}"/>`;
    svg += `<text x="${n.x}" y="${n.y}" class="tree-label">${n.val}</text>`;
  });
  svg += "</svg>";
  area.innerHTML = svg;
}

document.getElementById("tree-insert").addEventListener("click", () => {
  const v = parseInt(document.getElementById("tree-val").value);
  if (isNaN(v)) { mostrarToast("Ingrese un número válido"); return; }
  treeRoot = treeInsert(treeRoot, v);
  document.getElementById("tree-val").value = "";
  renderTreePseudo("insertar"); renderTree(); mostrarToast(`Insertado en árbol: ${v}`);
});
document.getElementById("tree-delete").addEventListener("click", () => {
  const v = parseInt(document.getElementById("tree-val").value);
  if (isNaN(v)) { mostrarToast("Ingrese un número válido"); return; }
  if (!treeSearch(treeRoot, v)) { mostrarToast(`${v} no está en el árbol`); return; }
  treeRoot = treeDelete(treeRoot, v);
  document.getElementById("tree-val").value = "";
  renderTreePseudo("eliminar"); renderTree(); mostrarToast(`Eliminado del árbol: ${v}`);
});
document.getElementById("tree-search").addEventListener("click", () => {
  const v = parseInt(document.getElementById("tree-val").value);
  if (isNaN(v)) { mostrarToast("Ingrese un número"); return; }
  const found = treeSearch(treeRoot, v);
  renderTreePseudo("buscar"); renderTree(v, found ? "found" : "notfound");
  mostrarToast(found ? `✓ Encontrado: ${v}` : `✗ ${v} no está en el árbol`);
});
document.getElementById("tree-clear").addEventListener("click", () => {
  treeRoot = null; renderTreePseudo("espera"); renderTree(); mostrarToast("Árbol limpiado");
});
document.getElementById("tree-traverse").addEventListener("click", async () => {
  if (!treeRoot) { mostrarToast("El árbol está vacío"); return; }
  const order = treeInorder(treeRoot, []);
  renderTreePseudo("inorden");
  mostrarToast(`Inorden: ${order.join(" → ")}`);
  for (const val of order) {
    renderTree(val, "highlight");
    await esperar(700);
  }
  renderTree();
});

// ===================== GRAFO =====================
function renderGraphPseudo(action) {
  const p = graphPseudos[action] || graphPseudos.espera;
  document.getElementById("graph-code-action").textContent = p.accion;
  const ol = document.getElementById("graph-pseudocode");
  ol.innerHTML = "";
  p.lineas.forEach(l => { const li = document.createElement("li"); li.textContent = l; ol.appendChild(li); });
}

function layoutGraphNodes() {
  const keys = Object.keys(graphNodes);
  const area = document.getElementById("graph-area");
  const W = Math.min(area.offsetWidth || 660, 660), H = 360;
  const cx = W/2, cy = H/2, r = Math.min(cx, cy) - 60;
  keys.forEach((k, i) => {
    const angle = (2 * Math.PI * i / keys.length) - Math.PI / 2;
    graphNodes[k] = { x: Math.round(cx + r * Math.cos(angle)), y: Math.round(cy + r * Math.sin(angle)) };
  });
}

function renderGraph(visited = [], current = null) {
  const area = document.getElementById("graph-area");
  const keys = Object.keys(graphNodes);
  if (!keys.length) {
    area.innerHTML = `<div class="empty-state"><div class="empty-icon">🔗</div><p>Agrega nodos y aristas</p></div>`;
    return;
  }
  layoutGraphNodes();
  const W = Math.min(area.offsetWidth || 660, 660), H = 360;
  let svg = `<svg class="ds-svg" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
    <path d="M0,0 L0,6 L8,3 z" fill="#94a3b8"/>
  </marker></defs>`;
  graphEdges.forEach(e => {
    const from = graphNodes[e.from], to = graphNodes[e.to];
    if (!from || !to) return;
    const mx = (from.x + to.x) / 2, my = (from.y + to.y) / 2;
    const cls = `graph-edge${graphDirected ? " directed" : ""}`;
    svg += `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" class="${cls}" ${graphDirected ? 'marker-end="url(#arrow)"' : ""}/>`;
    if (e.weight && e.weight !== 1) svg += `<text x="${mx}" y="${my - 6}" class="edge-weight">${e.weight}</text>`;
  });
  keys.forEach(k => {
    const n = graphNodes[k];
    let cls = "graph-node-circle";
    if (k === current) cls += " current";
    else if (visited.includes(k)) cls += " visited";
    svg += `<circle cx="${n.x}" cy="${n.y}" r="22" class="${cls}"/>`;
    svg += `<text x="${n.x}" y="${n.y}" class="graph-node-label">${k}</text>`;
  });
  svg += "</svg>";
  area.innerHTML = svg;
}

document.getElementById("g-add-node").addEventListener("click", () => {
  const lbl = document.getElementById("g-node").value.trim().toUpperCase();
  if (!lbl) { mostrarToast("Ingrese etiqueta del nodo"); return; }
  if (graphNodes[lbl]) { mostrarToast(`Nodo ${lbl} ya existe`); return; }
  graphNodes[lbl] = { x: 0, y: 0 };
  layoutGraphNodes();
  document.getElementById("g-node").value = "";
  renderGraphPseudo("agregar_nodo"); renderGraph(); mostrarToast(`Nodo ${lbl} agregado`);
});

document.getElementById("g-add-edge").addEventListener("click", () => {
  const from = document.getElementById("g-from").value.trim().toUpperCase();
  const to   = document.getElementById("g-to").value.trim().toUpperCase();
  const w    = parseFloat(document.getElementById("g-weight").value) || 1;
  if (!from || !to) { mostrarToast("Ingrese nodos de origen y destino"); return; }
  if (!graphNodes[from] || !graphNodes[to]) { mostrarToast("Uno o ambos nodos no existen"); return; }
  graphEdges.push({ from, to, weight: w });
  document.getElementById("g-from").value = "";
  document.getElementById("g-to").value = "";
  document.getElementById("g-weight").value = "";
  renderGraphPseudo("agregar_arista"); renderGraph(); mostrarToast(`Arista ${from}→${to} agregada`);
});

document.getElementById("g-directed").addEventListener("change", e => { graphDirected = e.target.checked; renderGraph(); });

document.getElementById("g-clear").addEventListener("click", () => {
  graphNodes = {}; graphEdges = [];
  renderGraphPseudo("espera"); renderGraph(); mostrarToast("Grafo limpiado");
});

document.getElementById("g-bfs").addEventListener("click", async () => {
  const keys = Object.keys(graphNodes);
  if (!keys.length) { mostrarToast("El grafo está vacío"); return; }
  const start = keys[0], visited = new Set(), queue = [start], order = [];
  visited.add(start);
  while (queue.length) {
    const cur = queue.shift(); order.push(cur);
    const neighbors = graphEdges
      .filter(e => e.from === cur || (!graphDirected && e.to === cur))
      .map(e => e.from === cur ? e.to : e.from);
    for (const n of neighbors) { if (!visited.has(n)) { visited.add(n); queue.push(n); } }
  }
  renderGraphPseudo("bfs"); mostrarToast(`BFS desde ${start}: ${order.join(" → ")}`);
  for (let i = 0; i <= order.length; i++) {
    await esperar(700);
    renderGraph(order.slice(0, i), i < order.length ? order[i] : null);
  }
});

document.getElementById("g-dfs").addEventListener("click", async () => {
  const keys = Object.keys(graphNodes);
  if (!keys.length) { mostrarToast("El grafo está vacío"); return; }
  const start = keys[0], visited = new Set(), stack = [start], order = [];
  while (stack.length) {
    const cur = stack.pop();
    if (visited.has(cur)) continue;
    visited.add(cur); order.push(cur);
    const neighbors = graphEdges
      .filter(e => e.from === cur || (!graphDirected && e.to === cur))
      .map(e => e.from === cur ? e.to : e.from);
    for (const n of [...neighbors].reverse()) { if (!visited.has(n)) stack.push(n); }
  }
  renderGraphPseudo("dfs"); mostrarToast(`DFS desde ${start}: ${order.join(" → ")}`);
  for (let i = 0; i <= order.length; i++) {
    await esperar(700);
    renderGraph(order.slice(0, i), i < order.length ? order[i] : null);
  }
});

// ===================== JUEGO =====================
function startGame() {
  gameIdx = 0; gameScore = 0; gameCorrect = 0; gameWrong = 0; gameAnswered = false;
  gameOrder = [...Array(QUESTIONS.length).keys()].sort(() => Math.random() - 0.5);
  document.getElementById("game-playing").style.display = "";
  document.getElementById("game-result").style.display = "none";
  updateGameStats(); loadQuestion();
}

function loadQuestion() {
  if (gameIdx >= QUESTIONS.length) { showResult(); return; }
  const q = QUESTIONS[gameOrder[gameIdx]];
  gameAnswered = false;
  document.getElementById("q-text").textContent = q.q;
  const opts = document.getElementById("q-options");
  opts.innerHTML = "";
  q.opts.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn"; btn.textContent = opt; btn.type = "button";
    btn.addEventListener("click", () => answerQuestion(i, q.correct, q.ex));
    opts.appendChild(btn);
  });
  document.getElementById("q-feedback").className = "feedback-box";
  document.getElementById("q-feedback").textContent = "";
  document.getElementById("btn-next").style.display = "none";
  document.getElementById("g-progress").style.width = `${(gameIdx / QUESTIONS.length) * 100}%`;
  document.getElementById("g-qnum").textContent = `${gameIdx + 1} / ${QUESTIONS.length}`;
}

function answerQuestion(chosen, correct, ex) {
  if (gameAnswered) return;
  gameAnswered = true;
  const btns = document.getElementById("q-options").querySelectorAll(".option-btn");
  btns.forEach(b => b.disabled = true);
  btns[correct].classList.add("correct");
  const fb = document.getElementById("q-feedback");
  if (chosen === correct) {
    btns[chosen].classList.add("correct");
    gameScore += 10; gameCorrect++;
    fb.className = "feedback-box show ok";
    fb.textContent = `✓ ¡Correcto! +10 pts — ${ex}`;
    mostrarToast("¡Correcto! +10 puntos");
  } else {
    btns[chosen].classList.add("wrong");
    gameWrong++;
    fb.className = "feedback-box show fail";
    fb.textContent = `✗ Incorrecto. ${ex}`;
    { const qq = QUESTIONS[gameOrder[gameIdx]];
      tutorBoton(fb, { tipo:"quiz", pregunta:qq.q, opciones:qq.opts, elegida:qq.opts[chosen], correcta:qq.opts[correct], explicacion:ex }); }
    mostrarToast("Incorrecto");
  }
  updateGameStats();
  document.getElementById("btn-next").style.display = "";
}

document.getElementById("btn-next").addEventListener("click", () => { gameIdx++; loadQuestion(); });
document.getElementById("btn-restart").addEventListener("click", startGame);

function updateGameStats() {
  document.getElementById("g-score").textContent = `Puntos: ${gameScore}`;
  document.getElementById("g-correct").textContent = `✓ ${gameCorrect}`;
  document.getElementById("g-wrong").textContent = `✗ ${gameWrong}`;
}

function showResult() {
  document.getElementById("game-playing").style.display = "none";
  document.getElementById("game-result").style.display = "";
  document.getElementById("g-progress").style.width = "100%";
  const pct = Math.round(gameScore / (QUESTIONS.length * 10) * 100);
  document.getElementById("r-score").textContent = `${gameScore} / ${QUESTIONS.length * 10} pts (${pct}%)`;
  let emoji, msg;
  if (pct >= 90)      { emoji = "🏆"; msg = "¡Excelente! Dominas las estructuras de datos."; }
  else if (pct >= 70) { emoji = "🎯"; msg = "¡Muy bien! Sólido conocimiento, sigue practicando."; }
  else if (pct >= 50) { emoji = "📚"; msg = "¡Buen intento! Repasa los temas y vuelve a intentarlo."; }
  else                { emoji = "💪"; msg = "¡No te rindas! Usa el visualizador para practicar más."; }
  document.getElementById("r-emoji").textContent = emoji;
  document.getElementById("r-msg").textContent = msg;
}

// ===================== MODO OSCURO =====================
function setTheme(mode) {
  if (mode === "dark") document.body.setAttribute("data-theme", "dark");
  else document.body.removeAttribute("data-theme");
  localStorage.setItem("theme", mode);
}

const savedTheme = localStorage.getItem("theme");
if (savedTheme) {
  setTheme(savedTheme);
} else {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
}

if (toggleThemeBtn) {
  toggleThemeBtn.addEventListener("click", () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    setTheme(isDark ? "light" : "dark");
  });
}

// ===================== INIT =====================

// ===================== MODO DESAFÍOS =====================

// ── Banco de desafíos ────────────────────────────────────
const DESAFIOS = {
  basico: [
    {
      id: "b1", tipo: "lista", titulo: "Primera lista enlazada",
      desc: "Construye una lista enlazada simple con tres nodos.",
      objetivo: "Inserta los valores 10, 20 y 30 en la lista enlazada.",
      pts: 50,
      pasos: [
        { texto: "Insertar el valor 10", check: s => s.includes("10") },
        { texto: "Insertar el valor 20", check: s => s.includes("20") },
        { texto: "Insertar el valor 30", check: s => s.includes("30") },
        { texto: "La lista debe tener exactamente 3 nodos", check: s => s.length === 3 },
      ]
    },
    {
      id: "b2", tipo: "pila", titulo: "Mi primera pila",
      desc: "Una pila sigue el principio LIFO. El último en entrar es el primero en salir.",
      objetivo: "Inserta 5, luego 15, luego 25. El tope debe ser 25.",
      pts: 50,
      pasos: [
        { texto: "Insertar el valor 5 (base de la pila)", check: s => s.includes("5") },
        { texto: "Insertar el valor 15", check: s => s.includes("15") },
        { texto: "Insertar el valor 25 (debe quedar en el tope)", check: s => s.length > 0 && s[s.length-1] === "25" },
        { texto: "La pila debe tener 3 elementos", check: s => s.length === 3 },
      ]
    },
    {
      id: "b3", tipo: "cola", titulo: "Construye una cola",
      desc: "Una cola sigue FIFO. El primero en entrar es el primero en salir.",
      objetivo: "Forma una cola con los valores 100, 200 y 300 en ese orden.",
      pts: 50,
      pasos: [
        { texto: "100 debe estar al frente (entró primero)", check: s => s[0] === "100" },
        { texto: "200 en posición media", check: s => s[1] === "200" },
        { texto: "300 al final (rear)", check: s => s.length > 0 && s[s.length-1] === "300" },
        { texto: "La cola debe tener 3 elementos", check: s => s.length === 3 },
      ]
    },
  ],
  intermedio: [
    {
      id: "i1", tipo: "lista", titulo: "Lista con operación de eliminación",
      desc: "Las listas enlazadas permiten insertar y eliminar nodos.",
      objetivo: "Inserta 1, 2, 3, 4. Luego elimina hasta que solo queden 1 y 2.",
      pts: 100,
      pasos: [
        { texto: "Insertar al menos 4 valores", check: (_,h) => h.insertCount >= 4 },
        { texto: "Eliminar nodos hasta que solo queden 2", check: s => s.length === 2 },
        { texto: "El primer valor insertado debe ser la cabeza", check: (s,h) => s[0] === h.firstInserted },
      ]
    },
    {
      id: "i2", tipo: "pila", titulo: "Push y Pop alternado",
      desc: "Practica el ciclo push-pop de una pila.",
      objetivo: "Haz push de 3 elementos, luego pop de 1. Deben quedar 2 elementos.",
      pts: 100,
      pasos: [
        { texto: "Haber hecho push de al menos 3 veces", check: (_,h) => h.insertCount >= 3 },
        { texto: "Haber hecho pop al menos 1 vez", check: (_,h) => h.deleteCount >= 1 },
        { texto: "La pila debe tener exactamente 2 elementos", check: s => s.length === 2 },
      ]
    },
    {
      id: "i3", tipo: "cola", titulo: "Cola con rotación",
      desc: "Simula el uso de una cola con enqueue y dequeue.",
      objetivo: "Inserta 4 elementos, luego saca 2. Deben quedar exactamente 2.",
      pts: 100,
      pasos: [
        { texto: "Haber hecho enqueue al menos 4 veces", check: (_,h) => h.insertCount >= 4 },
        { texto: "Haber hecho dequeue al menos 2 veces", check: (_,h) => h.deleteCount >= 2 },
        { texto: "La cola debe tener exactamente 2 elementos", check: s => s.length === 2 },
      ]
    },
  ],
  avanzado: [
    {
      id: "a1", tipo: "lista", titulo: "Lista de 5 nodos exactos",
      desc: "Precisión ante todo. La lista debe tener exactamente 5 nodos específicos.",
      objetivo: "Construye una lista con los valores: 7, 14, 21, 28, 35 (en ese orden).",
      pts: 200,
      pasos: [
        { texto: "7 debe ser la cabeza (primer elemento)", check: s => s[0] === "7" },
        { texto: "Segundo elemento: 14", check: s => s[1] === "14" },
        { texto: "Tercer elemento: 21", check: s => s[2] === "21" },
        { texto: "Cuarto elemento: 28", check: s => s[3] === "28" },
        { texto: "35 debe ser la cola (último elemento)", check: s => s[4] === "35" },
        { texto: "La lista debe tener exactamente 5 nodos", check: s => s.length === 5 },
      ]
    },
    {
      id: "a2", tipo: "pila", titulo: "Pila de secuencia par",
      desc: "Construye una pila con los primeros 5 números pares mayores que cero.",
      objetivo: "La pila debe contener 2, 4, 6, 8 y 10. El tope debe ser 10.",
      pts: 200,
      pasos: [
        { texto: "La pila debe tener exactamente 5 elementos", check: s => s.length === 5 },
        { texto: "Todos deben ser números pares", check: s => s.every(v => parseInt(v) % 2 === 0) },
        { texto: "El tope debe ser 10", check: s => s.length > 0 && s[s.length-1] === "10" },
        { texto: "La base debe ser 2", check: s => s[0] === "2" },
      ]
    },
    {
      id: "a3", tipo: "cola", titulo: "Cola inversa",
      desc: "Construye una cola con números del 5 al 1 (mayor a menor) y luego extrae 2.",
      objetivo: "Inserta 5, 4, 3, 2, 1. Luego elimina 2 elementos. Deben quedar 3, 2, 1.",
      pts: 200,
      pasos: [
        { texto: "Haber insertado exactamente 5 elementos", check: (_,h) => h.insertCount === 5 },
        { texto: "Haber eliminado exactamente 2 elementos", check: (_,h) => h.deleteCount === 2 },
        { texto: "Deben quedar exactamente 3 elementos", check: s => s.length === 3 },
        { texto: "El frente debe ser 3 (el 5 y 4 ya salieron)", check: s => s[0] === "3" },
        { texto: "El final debe ser 1", check: s => s.length > 0 && s[s.length-1] === "1" },
      ]
    },
  ]
};

// ── Estado del modo desafíos ──────────────────────────────
let chNivel = "basico";
let chActivo = null;
let chEstructura = [];
let chHistory = { insertCount: 0, deleteCount: 0, firstInserted: null };
let chDone = JSON.parse(localStorage.getItem("ch_done") || "{}");
let chPuntosTotales = parseInt(localStorage.getItem("ch_pts") || "0");
let chRacha = parseInt(localStorage.getItem("ch_streak") || "0");

function saveChallengeProgress() {
  localStorage.setItem("ch_done", JSON.stringify(chDone));
  localStorage.setItem("ch_pts", chPuntosTotales);
  localStorage.setItem("ch_streak", chRacha);
}

// ── Renderizar tarjetas de desafíos ──────────────────────
function renderChallengeCards() {
  const container = document.getElementById("ch-cards");
  const lista = DESAFIOS[chNivel];
  document.getElementById("ch-total-done").textContent = Object.keys(chDone).length;
  document.getElementById("ch-total-pts").textContent = chPuntosTotales;
  document.getElementById("ch-streak").textContent = chRacha;
  container.innerHTML = "";
  lista.forEach(d => {
    const done = chDone[d.id];
    const card = document.createElement("div");
    card.className = "ch-card" + (done ? " ch-done" : "");
    card.innerHTML = `
      <div class="ch-card-top">
        <span class="ch-card-icon">${d.tipo === "lista" ? "🔗" : d.tipo === "pila" ? "📚" : "🚶"}</span>
        <span class="ch-card-pts">${done ? "✅ +"+d.pts+" pts" : d.pts+" pts"}</span>
      </div>
      <div class="ch-card-title">${d.titulo}</div>
      <div class="ch-card-desc">${d.desc}</div>
      <button class="btn ${done ? "btn-dark" : "btn-primary"} ch-card-btn" data-id="${d.id}" type="button">
        ${done ? "Repetir" : "Iniciar desafío"}
      </button>`;
    card.querySelector(".ch-card-btn").addEventListener("click", () => iniciarDesafio(d));
    container.appendChild(card);
  });
}

// ── Iniciar un desafío ───────────────────────────────────
function iniciarDesafio(desafio) {
  chActivo = desafio;
  chEstructura = [];
  chHistory = { insertCount: 0, deleteCount: 0, firstInserted: null };

  document.getElementById("ch-selector").style.display = "none";
  document.getElementById("ch-arena").style.display = "";
  document.getElementById("ch-result").style.display = "none";

  const badges = { basico:"🟢 Básico", intermedio:"🟡 Intermedio", avanzado:"🔴 Avanzado" };
  document.getElementById("ch-lvl-badge").textContent = badges[chNivel];
  document.getElementById("ch-title").textContent = desafio.titulo;
  document.getElementById("ch-desc").textContent = desafio.desc;
  document.getElementById("ch-objective").textContent = desafio.objetivo;

  // Controles según el tipo
  const ctrl = document.getElementById("ch-controls");
  const lbl = { lista: ["Insertar nodo", "Eliminar último", "Limpiar"], pila: ["Push (apilar)", "Pop (desapilar)", "Limpiar"], cola: ["Enqueue (encolar)", "Dequeue (desencolar)", "Limpiar"] };
  const nombres = lbl[desafio.tipo];
  ctrl.innerHTML = `
    <div class="ch-ctrl-row">
      <input type="number" id="ch-input" placeholder="Ingrese un valor" class="ch-input" />
      <button class="btn btn-primary" id="ch-btn-insert" type="button">${nombres[0]}</button>
      <button class="btn btn-warning" id="ch-btn-delete" type="button">${nombres[1]}</button>
      <button class="btn btn-dark" id="ch-btn-clear" type="button">${nombres[2]}</button>
    </div>
    <div id="ch-toast-local" class="ch-mini-toast"></div>`;

  document.getElementById("ch-btn-insert").addEventListener("click", chInsertar);
  document.getElementById("ch-btn-delete").addEventListener("click", chEliminar);
  document.getElementById("ch-btn-clear").addEventListener("click", () => {
    chEstructura = [];
    chHistory = { insertCount: 0, deleteCount: 0, firstInserted: null };
    renderChVisual(); updateChProgress();
    showChToast("Estructura limpiada");
  });
  document.getElementById("ch-input").addEventListener("keydown", e => { if (e.key === "Enter") chInsertar(); });

  renderChVisual();
  updateChProgress();
}

function showChToast(msg) {
  const t = document.getElementById("ch-toast-local");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2000);
}

function chInsertar() {
  const input = document.getElementById("ch-input");
  const val = input.value.trim();
  if (!val) { showChToast("Ingresa un valor"); return; }
  chEstructura.push(val);
  if (!chHistory.firstInserted) chHistory.firstInserted = val;
  chHistory.insertCount++;
  input.value = "";
  renderChVisual(); updateChProgress();
  showChToast(`✓ ${val} insertado`);
}

function chEliminar() {
  if (!chEstructura.length) { showChToast("La estructura está vacía"); return; }
  const tipo = chActivo.tipo;
  const eliminado = tipo === "cola" ? chEstructura.shift() : chEstructura.pop();
  chHistory.deleteCount++;
  renderChVisual(); updateChProgress();
  showChToast(`Eliminado: ${eliminado}`);
}

// ── Render visual dentro del arena ──────────────────────
function renderChVisual() {
  const area = document.getElementById("ch-visual");
  if (!chEstructura.length) {
    area.innerHTML = `<div class="empty-state"><div class="empty-icon">∅</div><p>La estructura está vacía</p></div>`;
    return;
  }
  const tipo = chActivo.tipo;
  if (tipo === "lista") {
    let html = '<div class="list-wrapper">';
    chEstructura.forEach((v, i) => {
      const special = i === 0 || i === chEstructura.length - 1;
      html += `<div class="linked-node"><div class="linked-node-content">
        <div class="node-box ${special ? "special" : ""}">
          <div class="node-data">${v}</div><div class="node-pointer">↗</div>
        </div>
        ${chEstructura.length === 1 ? '<div class="node-tag">Cabeza / Cola</div>' : i === 0 ? '<div class="node-tag">Cabeza</div>' : i === chEstructura.length-1 ? '<div class="node-tag">Cola</div>' : ''}
      </div></div><div class="link-arrow">→</div>`;
      if (i === chEstructura.length-1) html += '<div class="link-null">NULL</div>';
    });
    html += '</div>';
    area.innerHTML = html;
  } else if (tipo === "pila") {
    let html = '<div class="stack-wrapper">';
    [...chEstructura].reverse().forEach((v, i) => {
      html += `<div class="node-stack node-enter${i === 0 ? " top" : ""}">${v}${i === 0 ? '<span class="stack-label">Tope</span>' : ""}</div>`;
    });
    html += '</div>';
    area.innerHTML = html;
  } else {
    let html = '<div class="queue-wrapper">';
    chEstructura.forEach((v, i) => {
      const isF = i === 0, isR = i === chEstructura.length - 1;
      html += `<div class="node-queue node-enter${chEstructura.length===1 ? " front rear" : isF ? " front" : isR ? " rear" : ""}">${v}
        ${chEstructura.length===1 ? '<span class="queue-tag">Frente/Final</span>' : isF ? '<span class="queue-tag">Frente</span>' : isR ? '<span class="queue-tag">Final</span>' : ''}
      </div>${i < chEstructura.length-1 ? '<div class="arrow">→</div>' : ''}`;
    });
    html += '</div>';
    area.innerHTML = html;
  }
}

// ── Actualizar checklist de progreso ────────────────────
function updateChProgress() {
  if (!chActivo) return;
  const list = document.getElementById("ch-steps-list");
  const checkList = document.getElementById("ch-check-list");
  list.innerHTML = ""; checkList.innerHTML = "";
  let done = 0;
  chActivo.pasos.forEach(paso => {
    const ok = paso.check(chEstructura, chHistory);
    if (ok) done++;
    const item = document.createElement("div");
    item.className = "ch-step-item" + (ok ? " ok" : "");
    item.innerHTML = `<span class="ch-step-icon">${ok ? "✅" : "⬜"}</span><span>${paso.texto}</span>`;
    list.appendChild(item);
    const ci = document.createElement("div");
    ci.className = "ch-check-item" + (ok ? " ok" : "");
    ci.innerHTML = `<span>${ok ? "✅" : "⬜"}</span><span>${paso.texto}</span>`;
    checkList.appendChild(ci);
  });
  const pct = Math.round(done / chActivo.pasos.length * 100);
  document.getElementById("ch-progress-fill").style.width = pct + "%";
}

// ── Validar solución ────────────────────────────────────
document.getElementById("ch-validate").addEventListener("click", () => {
  if (!chActivo) return;
  let done = 0;
  chActivo.pasos.forEach(p => { if (p.check(chEstructura, chHistory)) done++; });
  const total = chActivo.pasos.length;
  const pct = Math.round(done / total * 100);
  const result = document.getElementById("ch-result");
  result.style.display = "";
  if (done === total) {
    const yaHecho = chDone[chActivo.id];
    if (!yaHecho) {
      chDone[chActivo.id] = true;
      chPuntosTotales += chActivo.pts;
      chRacha++;
      saveChallengeProgress();
    }
    document.getElementById("ch-result-emoji").textContent = "🎉";
    document.getElementById("ch-result-msg").textContent = "¡Desafío completado correctamente!";
    document.getElementById("ch-result-pts").textContent = `+${chActivo.pts} puntos · Racha: ${chRacha} 🔥`;
    result.className = "ch-result-box show ok";
    mostrarToast("🎉 ¡Desafío completado!");
  } else {
    chRacha = 0; saveChallengeProgress();
    document.getElementById("ch-result-emoji").textContent = "💡";
    document.getElementById("ch-result-msg").textContent = `Completaste ${done} de ${total} pasos (${pct}%). ¡Revisa los pasos pendientes!`;
    document.getElementById("ch-result-pts").textContent = `Racha: 0 🔥 — Inténtalo de nuevo`;
    result.className = "ch-result-box show fail";
    tutorBoton(result, { tipo:"desafio", estructura:chActivo.tipo, titulo:chActivo.titulo, objetivo:chActivo.objetivo,
      estado:chEstructura, pendientes:chActivo.pasos.filter(p => !p.check(chEstructura, chHistory)).map(p => p.texto) });
    mostrarToast(`${done}/${total} pasos completados`);
  }
});

// ── Siguiente / Reintentar ──────────────────────────────
document.getElementById("ch-next-btn").addEventListener("click", () => {
  const lista = DESAFIOS[chNivel];
  const idx = lista.findIndex(d => d.id === chActivo.id);
  const next = lista[idx + 1];
  if (next) iniciarDesafio(next);
  else {
    // Volver al selector si era el último
    document.getElementById("ch-arena").style.display = "none";
    document.getElementById("ch-selector").style.display = "";
    renderChallengeCards();
  }
});

document.getElementById("ch-retry-btn").addEventListener("click", () => iniciarDesafio(chActivo));
document.getElementById("ch-back").addEventListener("click", () => {
  document.getElementById("ch-arena").style.display = "none";
  document.getElementById("ch-selector").style.display = "";
  renderChallengeCards();
});

// ── Tabs de nivel ────────────────────────────────────────
document.querySelectorAll(".ch-lvl-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".ch-lvl-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    chNivel = btn.dataset.level;
    renderChallengeCards();
  });
});

// ── Activar modo desafíos desde el tab ───────────────────
// (se llama desde el sistema de tabs existente)

// ════════════════════════════════════════════════════════
// PANEL INFORMATIVO — descripción, usos y ejemplo real
// ════════════════════════════════════════════════════════

const INFO_ESTRUCTURAS = {
  lista: {
    icono: "🔗",
    nombre: "Lista Enlazada Simple",
    badge: "Estructura lineal dinámica",
    descripcion: "Una lista enlazada es una colección de nodos donde cada nodo almacena un dato y un puntero al siguiente nodo. A diferencia de un arreglo, los elementos no están contiguos en memoria — cada nodo puede estar en cualquier parte y se conecta al siguiente mediante su puntero.",
    usos: [
      "Implementar pilas y colas dinámicamente",
      "Gestionar listas de reproducción de música (siguiente canción)",
      "Historial de navegación en un navegador web",
      "Administración de memoria dinámica en sistemas operativos",
      "Implementar el deshacer/rehacer en editores de texto"
    ],
    ejemplo: "🎵 En Spotify, cada canción en tu lista de reproducción es un nodo. La aplicación guarda un puntero a la \"siguiente\" canción, lo que permite avanzar o agregar canciones en cualquier posición sin reorganizar toda la lista."
  },
  pila: {
    icono: "📚",
    nombre: "Pila (Stack)",
    badge: "LIFO — Last In, First Out",
    descripcion: "Una pila es una estructura donde el último elemento en entrar es el primero en salir (LIFO). Solo se puede acceder al elemento del tope — los demás quedan \"apilados\" debajo y no son accesibles directamente hasta que se retira lo que está encima.",
    usos: [
      "Función de deshacer (Ctrl+Z) en cualquier aplicación",
      "Llamadas a funciones y recursividad en lenguajes de programación",
      "Evaluar expresiones matemáticas y paréntesis balanceados",
      "Historial de páginas visitadas (botón Atrás del navegador)",
      "Gestión de memoria en la ejecución de programas (call stack)"
    ],
    ejemplo: "↩️ En VS Code o Word, cada vez que escribes algo se apila una acción. Al presionar Ctrl+Z, se saca (POP) la última acción del tope y se deshace. No puedes deshacer algo del \"medio\" — siempre desde el último cambio."
  },
  cola: {
    icono: "🚶",
    nombre: "Cola (Queue)",
    badge: "FIFO — First In, First Out",
    descripcion: "Una cola es una estructura donde el primer elemento en entrar es el primero en salir (FIFO). Los elementos entran por el final (rear) y salen por el frente (front), igual que una fila de personas esperando ser atendidas.",
    usos: [
      "Cola de impresión: los documentos se imprimen en el orden en que llegan",
      "Solicitudes de servidores web (los usuarios se atienden en orden de llegada)",
      "Sistemas de mensajería y colas de tareas (RabbitMQ, Kafka)",
      "BFS (Búsqueda en Anchura) en grafos usa una cola internamente",
      "Manejo de interrupciones en sistemas operativos"
    ],
    ejemplo: "🖨️ Cuando varios estudiantes mandan documentos a imprimir, la impresora los pone en una cola. El primer documento enviado es el primero en imprimirse — sin importar quién lo envió, el orden de llegada determina el orden de atención."
  },
  arbol: {
    icono: "🌳",
    nombre: "Árbol Binario de Búsqueda (BST)",
    badge: "Estructura jerárquica no lineal",
    descripcion: "Un BST es un árbol donde cada nodo tiene a lo sumo dos hijos. La propiedad clave es que todos los valores menores al nodo están en su subárbol izquierdo y los mayores en el derecho. Esta propiedad permite búsquedas eficientes en O(log n) para árboles balanceados.",
    usos: [
      "Búsqueda eficiente en grandes volúmenes de datos ordenados",
      "Implementación de diccionarios y mapas (como en Java TreeMap)",
      "Sistemas de archivos jerárquicos (carpetas y subcarpetas)",
      "Autocompletado en motores de búsqueda y editores de código",
      "Bases de datos usan variantes (B-Trees) para indexar registros"
    ],
    ejemplo: "📚 Un diccionario digital usa un BST: si buscas 'mango', el sistema compara con la raíz. Si 'mango' es menor alfabéticamente, va a la izquierda; si es mayor, va a la derecha. Así reduce a la mitad las comparaciones en cada paso."
  },
  grafo: {
    icono: "🔮",
    nombre: "Grafo",
    badge: "Estructura no lineal de relaciones",
    descripcion: "Un grafo es un conjunto de nodos (vértices) conectados por aristas (edges). A diferencia de los árboles, no existe jerarquía ni raíz — cualquier nodo puede conectarse con cualquier otro. Los grafos pueden ser dirigidos (las conexiones tienen dirección) o no dirigidos.",
    usos: [
      "Redes sociales: cada persona es un nodo y las amistades son aristas",
      "Google Maps y GPS: las ciudades son nodos y las carreteras son aristas con peso (distancia)",
      "Internet: cada servidor/router es un nodo conectado a otros",
      "Recomendaciones de Netflix o Spotify (usuarios y contenidos relacionados)",
      "Detección de fraudes bancarios analizando redes de transacciones"
    ],
    ejemplo: "🗺️ En Google Maps, cada intersección es un nodo y cada calle es una arista con un peso (tiempo o distancia). BFS encuentra el camino con menos pasos y Dijkstra encuentra el más corto en tiempo — ambos usan grafos internamente."
  },
};

function actualizarInfoPanel() {
  // Cada vista (lineal, árbol, grafo) tiene su propia tarjeta de información
  // con los mismos IDs, así que se busca dentro de la vista visible.
  const root = Array.from(document.querySelectorAll('[id^="view-"]'))
    .find(v => v.style.display !== "none") || document;
  const el = (id) => root.querySelector("#" + id);

  const info = INFO_ESTRUCTURAS[tipo];
  const card = el("info-card");
  if (!info) {
    if (card) card.style.display = "none";
    return;
  }
  if (card) card.style.display = "";

  if (el("info-icon"))        el("info-icon").textContent        = info.icono;
  if (el("info-nombre"))      el("info-nombre").textContent      = info.nombre;
  if (el("info-tipo-badge"))  el("info-tipo-badge").textContent  = info.badge;
  if (el("info-descripcion")) el("info-descripcion").textContent = info.descripcion;
  if (el("info-ejemplo"))     el("info-ejemplo").textContent     = info.ejemplo;

  const usosList = el("info-usos");
  if (usosList) {
    usosList.innerHTML = "";
    info.usos.forEach(uso => {
      const li = document.createElement("li");
      li.textContent = uso;
      usosList.appendChild(li);
    });
  }
}

function initDesafios() {
  document.getElementById("ch-selector").style.display = "";
  document.getElementById("ch-arena").style.display = "none";
  renderChallengeCards();
}

// ════════════════════════════════════════════════════════
// MÓDULO DE EVALUACIÓN — Pretest / SUS / Postest
// ════════════════════════════════════════════════════════

// ── Preguntas pretest y postest (diferentes pero mismo tema) ──
const PRETEST_QS = [
  { q: "¿Cuál es el comportamiento de una Pila (Stack)?",
    opts: ["FIFO — el primero en entrar sale primero", "LIFO — el último en entrar sale primero", "Los elementos se acceden por índice", "Orden aleatorio"],
    correct: 1 },
  { q: "En una Lista Enlazada simple, ¿qué contiene cada nodo?",
    opts: ["Solo el dato", "El dato y un puntero al siguiente nodo", "El dato y su índice", "El dato y un puntero al anterior y al siguiente"],
    correct: 1 },
  { q: "¿Qué operación agrega un elemento al final de una Cola?",
    opts: ["Push", "Pop", "Enqueue", "Dequeue"],
    correct: 2 },
  { q: "En un Árbol BST, ¿los valores mayores que la raíz van a qué lado?",
    opts: ["Izquierda", "Derecha", "Arriba", "En cualquier lado"],
    correct: 1 },
  { q: "¿Qué recorrido de grafo usa una cola (Queue) internamente?",
    opts: ["DFS", "Inorden", "BFS", "Postorden"],
    correct: 2 },
];

const POSTEST_QS = [
  { q: "¿Qué operación elimina el elemento del tope de una Pila?",
    opts: ["Enqueue", "Dequeue", "Push", "Pop"],
    correct: 3 },
  { q: "En una Lista Enlazada, ¿el último nodo apunta a qué?",
    opts: ["Al primer nodo", "A sí mismo", "A NULL", "Al nodo anterior"],
    correct: 2 },
  { q: "¿Cuál es la complejidad de búsqueda en un BST balanceado?",
    opts: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
    correct: 2 },
  { q: "¿Qué recorrido de árbol produce los valores en orden ascendente?",
    opts: ["Preorden", "Postorden", "Inorden", "BFS"],
    correct: 2 },
  { q: "¿Cuál estructura usarías para implementar la función 'deshacer' en un editor?",
    opts: ["Cola", "Grafo", "Pila", "Árbol BST"],
    correct: 2 },
];

// ── Preguntas SUS (System Usability Scale — estándar académico) ──
const SUS_QS = [
  { q: "Creo que me gustaría usar esta aplicación frecuentemente.", positiva: true },
  { q: "Encontré la aplicación innecesariamente compleja.", positiva: false },
  { q: "Pensé que la aplicación fue fácil de usar.", positiva: true },
  { q: "Creo que necesitaría el apoyo de un experto para poder usar esta aplicación.", positiva: false },
  { q: "Las distintas funciones de esta aplicación estuvieron bien integradas.", positiva: true },
  { q: "Pensé que había demasiada inconsistencia en esta aplicación.", positiva: false },
  { q: "Imagino que la mayoría de personas aprendería a usar esta aplicación muy rápidamente.", positiva: true },
  { q: "Encontré la aplicación muy difícil de usar.", positiva: false },
  { q: "Me sentí muy seguro/a al usar la aplicación.", positiva: true },
  { q: "Necesité aprender muchas cosas antes de poder usar esta aplicación.", positiva: false },
];

const SUS_SCALE = ["1\nTotalmente\nen desacuerdo", "2", "3", "4", "5\nTotalmente\nde acuerdo"];

// ── Estado de la evaluación ──
let evalState = {
  carrera: "", anio: "", cursado: "",
  pretestAnswers: new Array(PRETEST_QS.length).fill(-1),
  postestAnswers: new Array(POSTEST_QS.length).fill(-1),
  susAnswers: new Array(SUS_QS.length).fill(-1),
  open1: "", open2: "", openYesno: "",
  pretestScore: 0, postestScore: 0, susScore: 0,
  startTime: null, endTime: null,
};

// ── Render preguntas de opción múltiple ──
function renderEvalQuestions(container, questions, answers, prefix) {
  container.innerHTML = "";
  questions.forEach((q, qi) => {
    const block = document.createElement("div");
    block.className = "eval-q-block";
    block.innerHTML = `<div class="eval-q-text"><span class="eval-q-num">${qi + 1}</span>${q.q}</div>`;
    const opts = document.createElement("div");
    opts.className = "eval-opts";
    q.opts.forEach((opt, oi) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "eval-opt-btn" + (answers[qi] === oi ? " selected" : "");
      btn.textContent = opt;
      btn.addEventListener("click", () => {
        answers[qi] = oi;
        opts.querySelectorAll(".eval-opt-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
      opts.appendChild(btn);
    });
    block.appendChild(opts);
    container.appendChild(block);
  });
}

// ── Render preguntas SUS ──
function renderSUS() {
  const container = document.getElementById("sus-questions");
  container.innerHTML = "";
  SUS_QS.forEach((q, qi) => {
    const block = document.createElement("div");
    block.className = "eval-q-block sus-block";
    block.innerHTML = `<div class="eval-q-text"><span class="eval-q-num">${qi + 1}</span>${q.q}</div>`;
    const scale = document.createElement("div");
    scale.className = "sus-scale-row";
    for (let v = 1; v <= 5; v++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sus-btn" + (evalState.susAnswers[qi] === v ? " selected" : "");
      btn.innerHTML = `<span class="sus-num">${v}</span>`;
      btn.addEventListener("click", () => {
        evalState.susAnswers[qi] = v;
        scale.querySelectorAll(".sus-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
      scale.appendChild(btn);
    }
    const labels = document.createElement("div");
    labels.className = "sus-scale-labels";
    labels.innerHTML = `<span>Totalmente en desacuerdo</span><span>Totalmente de acuerdo</span>`;
    block.appendChild(scale);
    block.appendChild(labels);
    container.appendChild(block);
  });
}

// ── Cálculo del puntaje SUS ──
function calcSUS(answers) {
  let sum = 0;
  SUS_QS.forEach((q, i) => {
    const v = answers[i];
    if (v < 1) return;
    sum += q.positiva ? (v - 1) : (5 - v);
  });
  return Math.round(sum * 2.5);
}

function susCategoryLabel(score) {
  if (score >= 90) return { label: "Excelente (A)", color: "#16a34a" };
  if (score >= 80) return { label: "Bueno (B)",     color: "#2563eb" };
  if (score >= 68) return { label: "Aceptable (C)", color: "#0d9488" };
  if (score >= 51) return { label: "Marginal (D)",  color: "#f59e0b" };
  return                   { label: "Inaceptable (F)", color: "#dc2626" };
}

// ── Calcular puntaje de test ──
function calcTestScore(answers, questions) {
  return answers.reduce((acc, a, i) => acc + (a === questions[i].correct ? 1 : 0), 0);
}

// ── Mostrar pantalla de evaluación ──
function showEvalScreen(id) {
  ["eval-welcome","eval-pretest","eval-use-app","eval-postest","eval-results"]
    .forEach(s => document.getElementById(s).style.display = s === id ? "" : "none");
}

// ── Inicializar evaluación ──
function initEvaluacion() {
  evalState = {
    carrera: "", anio: "", cursado: "",
    pretestAnswers: new Array(PRETEST_QS.length).fill(-1),
    postestAnswers: new Array(POSTEST_QS.length).fill(-1),
    susAnswers:     new Array(SUS_QS.length).fill(-1),
    open1: "", open2: "", openYesno: "",
    pretestScore: 0, postestScore: 0, susScore: 0,
    startTime: new Date().toISOString(), endTime: null,
  };
  showEvalScreen("eval-welcome");
  document.getElementById("eval-carrera").value = "";
  document.getElementById("eval-anio").value = "";
  document.getElementById("eval-cursado").value = "";
}

// ── Botón: Comenzar ──
document.getElementById("eval-start").addEventListener("click", () => {
  evalState.carrera = document.getElementById("eval-carrera").value;
  evalState.anio    = document.getElementById("eval-anio").value;
  evalState.cursado = document.getElementById("eval-cursado").value;
  if (!evalState.carrera || !evalState.anio || !evalState.cursado) {
    mostrarToast("Por favor completa todos los campos antes de continuar");
    return;
  }
  renderEvalQuestions(
    document.getElementById("pretest-questions"),
    PRETEST_QS, evalState.pretestAnswers, "pre"
  );
  showEvalScreen("eval-pretest");
});

// ── Botón: Guardar pretest ──
document.getElementById("pretest-submit").addEventListener("click", () => {
  const respondidas = evalState.pretestAnswers.filter(a => a >= 0).length;
  if (respondidas < PRETEST_QS.length) {
    mostrarToast(`Faltan ${PRETEST_QS.length - respondidas} preguntas por responder`);
    return;
  }
  evalState.pretestScore = calcTestScore(evalState.pretestAnswers, PRETEST_QS);
  showEvalScreen("eval-use-app");
  mostrarToast("✓ Pretest guardado. ¡Ahora explora la app!");
});

// ── Botón: Ir a explorar ──
document.getElementById("eval-goto-lista").addEventListener("click", () => {
  // Cambiar al tab de Lista para que explore
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  const listaTab = document.querySelector('.tab[data-type="lista"]');
  if (listaTab) { listaTab.classList.add("active"); tipo = "lista"; setVista("lista"); actualizarTextos(); actualizarPseudocodigo(); render(); }
  mostrarToast("Explora la app. Cuando termines vuelve al tab 📊 Evaluación");
});

// ── Botón: Continuar al postest ──
document.getElementById("eval-continue-postest").addEventListener("click", () => {
  renderEvalQuestions(
    document.getElementById("postest-questions"),
    POSTEST_QS, evalState.postestAnswers, "post"
  );
  renderSUS();
  showEvalScreen("eval-postest");
});

// ── Yes/No preguntas abiertas ──
document.getElementById("open-yesno").addEventListener("click", e => {
  const btn = e.target.closest(".yn-btn");
  if (!btn) return;
  document.querySelectorAll(".yn-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  evalState.openYesno = btn.dataset.val;
});

// ── Botón: Enviar evaluación ──
document.getElementById("postest-submit").addEventListener("click", () => {
  const postRespondidas = evalState.postestAnswers.filter(a => a >= 0).length;
  const susRespondidas  = evalState.susAnswers.filter(a => a >= 0).length;

  if (postRespondidas < POSTEST_QS.length) {
    mostrarToast(`Postest: faltan ${POSTEST_QS.length - postRespondidas} preguntas`); return;
  }
  if (susRespondidas < SUS_QS.length) {
    mostrarToast(`SUS: faltan ${SUS_QS.length - susRespondidas} respuestas`); return;
  }
  if (!evalState.openYesno) {
    mostrarToast("Por favor responde si usarías la app"); return;
  }

  evalState.open1     = document.getElementById("open-1").value.trim();
  evalState.open2     = document.getElementById("open-2").value.trim();
  evalState.endTime   = new Date().toISOString();
  evalState.postestScore = calcTestScore(evalState.postestAnswers, POSTEST_QS);
  evalState.susScore     = calcSUS(evalState.susAnswers);

  mostrarResultados();
});


// ── Enviar evaluación al servidor ────────────────────────
async function enviarAlServidor(payload) {
  const API_URL = 'api/guardar_evaluacion.php'; // ruta relativa: funciona en cualquier carpeta del servidor
  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.ok) {
      console.log('Evaluación guardada en servidor. ID:', data.id);
      return true;
    } else {
      console.warn('Error del servidor:', data.error);
      return false;
    }
  } catch (err) {
    console.warn('No se pudo conectar al servidor:', err.message);
    return false;
  }
}

// ── Mostrar resultados ──
async function mostrarResultados() {
  showEvalScreen("eval-results");

  const pre  = evalState.pretestScore;
  const post = evalState.postestScore;
  const total = PRETEST_QS.length;
  const mejora = post - pre;
  const sus  = evalState.susScore;
  const cat  = susCategoryLabel(sus);

  document.getElementById("r-pretest-score").textContent  = `${pre}/${total}`;
  document.getElementById("r-postest-score").textContent  = `${post}/${total}`;
  document.getElementById("r-mejora").textContent         = `${mejora >= 0 ? "+" : ""}${mejora}`;
  document.getElementById("r-sus-score").textContent      = sus;
  document.getElementById("r-sus-label").textContent      = cat.label;
  document.getElementById("r-sus-label").style.color      = cat.color;
  document.getElementById("r-sus-score").style.color      = cat.color;

  // Barra SUS
  const fill = document.getElementById("sus-bar-fill");
  const marker = document.getElementById("sus-bar-marker");
  if (fill)   { fill.style.width = sus + "%"; fill.style.background = cat.color; }
  if (marker) { marker.style.left = sus + "%"; }

  // Ícono de resultado
  const icon = document.getElementById("eval-result-icon");
  if (sus >= 80 && mejora >= 0) icon.textContent = "🏆";
  else if (sus >= 68) icon.textContent = "🎯";
  else icon.textContent = "📊";

  // Exportar datos
  const timestamp = new Date().toLocaleString("es-PA");
  const susRaw = evalState.susAnswers.map((v,i) => `SUS_${i+1}: ${v}`).join(", ");
  const exportText = [
    "═══════════════════════════════════",
    "DATOS DE EVALUACIÓN — Visual Data Structure",
    "JIC-Nacional 2026 | UTP Centro Regional de Colón",
    "═══════════════════════════════════",
    `Fecha/Hora: ${timestamp}`,
    `Carrera: ${evalState.carrera}`,
    `Año: ${evalState.anio}`,
    `¿Cursó Estructuras de Datos?: ${evalState.cursado}`,
    "───────────────────────────────────",
    `PRETEST: ${pre}/${total} (${Math.round(pre/total*100)}%)`,
    `POSTEST: ${post}/${total} (${Math.round(post/total*100)}%)`,
    `MEJORA: ${mejora >= 0 ? "+" : ""}${mejora} puntos`,
    "───────────────────────────────────",
    `PUNTAJE SUS: ${sus}/100 — ${cat.label}`,
    `Respuestas SUS: ${susRaw}`,
    "───────────────────────────────────",
    `¿Usaría la app?: ${evalState.openYesno}`,
    `Lo que más gustó: ${evalState.open1 || "(sin respuesta)"}`,
    `Qué mejoraría: ${evalState.open2 || "(sin respuesta)"}`,
    "═══════════════════════════════════",
  ].join("\n");

  document.getElementById("eval-export-text").value = exportText;

  // Guardar en localStorage para historial
  const historial = JSON.parse(localStorage.getItem("eval_historial") || "[]");
  historial.push({ timestamp, sus, pre, post, carrera: evalState.carrera, anio: evalState.anio });
  localStorage.setItem("eval_historial", JSON.stringify(historial));

  // Enviar al servidor
  const payload = {
    carrera:          evalState.carrera,
    anio:             evalState.anio,
    cursado:          evalState.cursado,
    pretest_score:    pre,
    postest_score:    post,
    mejora:           post - pre,
    total_preguntas:  PRETEST_QS.length,
    sus_score:        sus,
    sus_categoria:    cat.label,
    sus_respuestas:   evalState.susAnswers.join(','),
    open_gusto:       evalState.open1,
    open_mejora:      evalState.open2,
    usaria_app:       evalState.openYesno,
    tiempo_inicio:    evalState.startTime,
    tiempo_fin:       evalState.endTime,
  };

  const guardado = await enviarAlServidor(payload);
  const serverStatus = document.getElementById("eval-server-status");
  if (serverStatus) {
    serverStatus.style.display = "";
    serverStatus.textContent = guardado
      ? "✅ Datos guardados en el servidor correctamente"
      : "⚠️ Sin conexión — datos guardados localmente";
    serverStatus.style.color = guardado ? "#16a34a" : "#d97706";
  }
}

// ── Copiar datos ──
document.getElementById("eval-copy-btn").addEventListener("click", () => {
  const txt = document.getElementById("eval-export-text");
  const ok = () => mostrarToast("✓ Datos copiados al portapapeles");
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(txt.value).then(ok).catch(() => { txt.select(); document.execCommand("copy"); ok(); });
  } else {
    txt.select();
    document.execCommand("copy");
    ok();
  }
});

// ── Reiniciar ──
document.getElementById("eval-restart").addEventListener("click", initEvaluacion);

// ===================== INICIALIZACIÓN =====================
// Se ejecuta al final para que todas las constantes (INFO_ESTRUCTURAS, DESAFIOS, etc.)
// ya estén definidas antes del primer render.
actualizarTextos();
actualizarPseudocodigo();
render();
