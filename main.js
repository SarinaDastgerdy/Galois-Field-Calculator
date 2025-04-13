// Highlight the selected operation button
function toggleBold(button) {
    document.querySelectorAll('button').forEach(btn => {
        if (btn !== button) {
            btn.classList.remove('bold');
        }
    });
    button.classList.toggle('bold');
}

// Show and hide content sections based on selected operation
function showGCD() {
    gcdContent.classList.remove('hidden');
    multiplicationContent.classList.add('hidden');
}

function showMultiplication() {
    gcdContent.classList.add('hidden');
    multiplicationContent.classList.remove('hidden');
}

// Button and section references
const gcdButton = document.getElementById('gcdButton');
const multiplicationButton = document.getElementById('multiplicationButton');
const gcdContent = document.getElementById('gcdContent');
const multiplicationContent = document.getElementById('multiplicationContent');

// Toggle views on button click
gcdButton.addEventListener('click', showGCD);
multiplicationButton.addEventListener('click', showMultiplication);

// Remove leading zeros from a polynomial array
function removeLeadingZeros(array) {
    let i = 0;
    while (i < array.length && array[i] === 0) {
        i++;
    }
    return array.slice(i);
}

// GCD operation in GF(2) using the Euclidean algorithm
function gcd() {
    try {
        const polynomial1 = parsePolynomialToNumber(document.getElementById('gcdInput1').value);
        const polynomial2 = parsePolynomialToNumber(document.getElementById('gcdInput2').value);

        let dividend = polynomial1;
        let divisor = polynomial2;

        // Check which polynomial is larger
        if (dividend.length < divisor.length || 
            (dividend.length === divisor.length && dividend.some((val, i) => val < divisor[i]))) {
            [dividend, divisor] = [divisor, dividend];
        }

        let { remainder } = divideArraysMod(dividend, divisor, 2);
        remainder = removeLeadingZeros(remainder);
        // Perform division until the remainder is 0 or 1
        while (remainder.length !== 1 && remainder.length !== 0) {
            previousRemainder = remainder;
            const temp = divideArraysMod(divisor, remainder, 2);
            remainder = removeLeadingZeros(temp.remainder);
            divisor = removeLeadingZeros(temp.divisor || divisor);
            if (remainder.length === 0) {
                divisor = previousRemainder;
            }
        }

        const result = remainder[0] === 1 ? '1' : parseNumberToPolynomial(divisor);
        document.getElementById('gcdResult').innerText = 'Result: ' + result;

    } catch(e){
        alert(e.message);
    }
}

// Polynomial addition mod a modulus polynomial
function sumModulus() {
    try {
        const polynomial1 = parsePolynomialToNumber(document.getElementById('polynomialInput1').value);
        const polynomial2 = parsePolynomialToNumber(document.getElementById('polynomialInput2').value);
        const modulus = parsePolynomialToNumber(document.getElementById('modulusInput').value);

        const addition = addPolynomialsMod(polynomial1, polynomial2, 2);
        const { remainder } = divideArraysMod(addition, modulus, 2);
        const result = parseNumberToPolynomial(remainder);

        document.getElementById('result').innerText = 'Result: ' + result;

    } catch (e) {
        alert(e.message);
    }
}

// Polynomial multiplication mod a modulus polynomial
function multiplyModulus() {
    try {
        const polynomial1 = parsePolynomialToNumber(document.getElementById('polynomialInput1').value);
        const polynomial2 = parsePolynomialToNumber(document.getElementById('polynomialInput2').value);
        const modulus = parsePolynomialToNumber(document.getElementById('modulusInput').value);

        const res = multiplyPolynomialsMod(polynomial1, polynomial2, 2);
        const { remainder } = divideArraysMod(res, modulus, 2);
        const result = parseNumberToPolynomial(remainder);

        document.getElementById('result').innerText = 'Result: ' + result;

    } catch (e) {
        alert(e.message);
    }
}

// Convert a binary array back to polynomial string format
function parseNumberToPolynomial(polynomialArray) {
    let result = '';
    let startIndex = polynomialArray.findIndex(val => val === 1);

    if (startIndex === -1) return '0';

    for (let i = startIndex; i < polynomialArray.length; i++) {
        if (polynomialArray[i] === 1) {
            if (result !== '') result += ' + ';
            result += (i === polynomialArray.length - 1) ? '1' : `x^${polynomialArray.length - i - 1}`;
        }
    }
    return result;
}

// Polynomial division with remainder in GF(mod)
function divideArraysMod(dividendArray, divisorArray, mod) {
    dividendArray = dividendArray.map(e => e % mod);
    divisorArray = divisorArray.map(e => e % mod);

    let quotient = [];
    let remainder = dividendArray.slice();

    const isSmaller = remainder.length < divisorArray.length ||
        (remainder.length === divisorArray.length && remainder.some((val, i) => val < divisorArray[i]));

    if (isSmaller) {
        quotient.push(0);
    } else {
        for (let k = 0; k <= dividendArray.length - divisorArray.length; k++) {
            let tempDividend = remainder.slice(0, divisorArray.length);
            let tempQuotient = remainder[0] < divisorArray[0] ? 0 : 1;

            for (let i = 0; i < divisorArray.length; i++) {
                remainder[i] = (tempDividend[i] - (tempQuotient ? divisorArray[i] : 0) + mod) % mod;
            }

            const firstNonZero = remainder.findIndex(val => val !== 0);
            if (firstNonZero !== -1) remainder = remainder.slice(1);

            quotient.push(tempQuotient);
        }
    }

    return { quotient, remainder };
}

// Multiply two polynomials under GF(mod)
function multiplyPolynomialsMod(p1, p2, mod) {
    let result = [];

    for (let i = p1.length - 1; i >= 0; i--) {
        let temp = new Array(p1.length - 1 - i).fill(0);
        for (let j = p2.length - 1; j >= 0; j--) {
            temp.push((p1[i] * p2[j]) % mod);
        }
        result = addPolynomialsMod(temp.reverse(), result, mod);
    }

    return result;
}

// Add two polynomials under GF(mod)
function addPolynomialsMod(p1, p2, mod) {
    const maxLength = Math.max(p1.length, p2.length);
    while (p1.length < maxLength) p1.unshift(0);
    while (p2.length < maxLength) p2.unshift(0);

    return p1.map((val, i) => (val + p2[i]) % mod);
}

// Validate polynomial input format and descending order
function isValidPolynomialInput(input) {
    const trimmed = input.trim();
    const pattern = /^(\s*(x(\^\d+)?|1)\s*)(\+\s*(x(\^\d+)?|1)\s*)*$/;

    if (!pattern.test(trimmed)) return false;

    const powers = trimmed.split('+').map(term => {
        term = term.trim();
        if (term === '1') return 0;
        if (term === 'x') return 1;
        const match = term.match(/x\^(\d+)/);
        return match ? parseInt(match[1]) : null;
    });

    for (let i = 0; i < powers.length - 1; i++) {
        if (powers[i] === null || powers[i] <= powers[i + 1]) {
            return false;
        }
    }

    return true;
}

// Convert a valid polynomial string to binary array representation
function parsePolynomialToNumber(polynomial) {
    if (!isValidPolynomialInput(polynomial)) {
        throw new Error("Invalid polynomial input. Ensure format is like 'x^5 + x^3 + x + 1' in descending order.");
    }

    const terms = polynomial.split('+').map(term => term.trim());
    const powers = [];

    terms.forEach(term => {
        if (term === '1') powers.push(0);
        else if (term === 'x') powers.push(1);
        else {
            const match = term.match(/x\^(\d+)/);
            if (match) powers.push(parseInt(match[1]));
        }
    });

    const maxPower = powers[0];
    const coefficients = new Array(maxPower + 1).fill(0);
    powers.forEach(power => {
        coefficients[maxPower - power] = 1;
    });

    return coefficients;
}
