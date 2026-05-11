'use strict';

const displayResult     = document.getElementById('result');
const displayExpression = document.getElementById('expression');
const allButtons        = document.querySelectorAll('.btn');


let currentInput   = '0';   
let previousInput  = '';    
let operator       = null;  
let justEvaluated  = false; 
let expressionStr  = '';   



function updateDisplay() {

  if (currentInput.length > 10) {
    displayResult.classList.add('small');
  } else {
    displayResult.classList.remove('small');
  }
  displayResult.textContent     = formatNumber(currentInput);
  displayExpression.textContent = expressionStr || '\u00a0'; 
}


function pulseResult() {
  displayResult.classList.remove('pulse');
  void displayResult.offsetWidth; 
  displayResult.classList.add('pulse');
}


function formatNumber(str) {
  if (str === 'Error') return 'Error';
  const n = parseFloat(str);
  if (isNaN(n)) return str;


  if (str.endsWith('.')) return str;


  const formatted = parseFloat(n.toPrecision(10)).toString();
  return formatted;
}


function mapOperator(op) {
  switch (op) {
    case '÷': return '/';
    case '×': return '*';
    case '−': return '-';
    case '+': return '+';
    default:  return op;
  }
}


function calculate(a, op, b) {
  const numA = parseFloat(a);
  const numB = parseFloat(b);
  switch (op) {
    case '÷': return numB === 0 ? 'Error' : String(numA / numB);
    case '×': return String(numA * numB);
    case '−': return String(numA - numB);
    case '+': return String(numA + numB);
    default:  return b;
  }
}



function handleNumber(value) {
  if (justEvaluated) {
   
    currentInput   = value;
    expressionStr  = '';
    justEvaluated  = false;
    clearActiveOp();
  } else if (currentInput === '0') {
    currentInput = value;
  } else {
    if (currentInput.length >= 12) return; 
    currentInput += value;
  }
  updateDisplay();
}

function handleDecimal() {
  if (justEvaluated) {
    currentInput  = '0.';
    expressionStr = '';
    justEvaluated = false;
    clearActiveOp();
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

function handleOperator(op) {
  justEvaluated = false;

  if (operator && previousInput !== '') {
    
    const result = calculate(previousInput, operator, currentInput);
    currentInput  = result;
    previousInput = result;
  } else {
    previousInput = currentInput;
  }

  operator     = op;
  expressionStr = formatNumber(previousInput) + ' ' + op;
  currentInput = '0';  


  clearActiveOp();
  allButtons.forEach(btn => {
    if (btn.dataset.action === 'operator' && btn.dataset.value === op) {
      btn.classList.add('active-op');
    }
  });

  updateDisplay();
}

function handleEquals() {
  if (!operator || previousInput === '') return;

  const a = previousInput;
  const b = currentInput;
  const result = calculate(a, operator, b);

  expressionStr = formatNumber(a) + ' ' + operator + ' ' + formatNumber(b) + ' =';
  currentInput  = result;
  previousInput = '';
  operator      = null;
  justEvaluated = true;

  clearActiveOp();
  pulseResult();
  updateDisplay();
}

function handleClear() {
  currentInput  = '0';
  previousInput = '';
  operator      = null;
  expressionStr = '';
  justEvaluated = false;
  clearActiveOp();
  updateDisplay();
}

function handleSign() {
  if (currentInput === '0' || currentInput === 'Error') return;
  currentInput = currentInput.startsWith('-')
    ? currentInput.slice(1)
    : '-' + currentInput;
  updateDisplay();
}

function handlePercent() {
  if (currentInput === 'Error') return;
  const n = parseFloat(currentInput);
  currentInput = String(n / 100);
  updateDisplay();
}

function clearActiveOp() {
  allButtons.forEach(btn => btn.classList.remove('active-op'));
}



allButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    const value  = btn.dataset.value;

    switch (action) {
      case 'number':   handleNumber(value);   break;
      case 'decimal':  handleDecimal();        break;
      case 'operator': handleOperator(value);  break;
      case 'equals':   handleEquals();         break;
      case 'clear':    handleClear();          break;
      case 'sign':     handleSign();           break;
      case 'percent':  handlePercent();        break;
    }
  });
});


document.addEventListener('keydown', e => {
  const k = e.key;

  if (k >= '0' && k <= '9') { handleNumber(k); return; }
  if (k === '.')             { handleDecimal();  return; }
  if (k === 'Enter' || k === '=') { handleEquals(); return; }
  if (k === 'Escape' || k === 'c' || k === 'C') { handleClear(); return; }
  if (k === '%')  { handlePercent(); return; }
  if (k === '+')  { handleOperator('+'); return; }
  if (k === '-')  { handleOperator('−'); return; }
  if (k === '*')  { handleOperator('×'); return; }
  if (k === '/')  { e.preventDefault(); handleOperator('÷'); return; }
  if (k === 'Backspace') {
    if (currentInput.length > 1 && currentInput !== 'Error') {
      currentInput = currentInput.slice(0, -1);
    } else {
      currentInput = '0';
    }
    updateDisplay();
  }
});


updateDisplay();
