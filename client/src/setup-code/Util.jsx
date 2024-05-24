
const NUM_CHANNELS = 7;

const getLetterValue = (letter) => {
    return letter.toUpperCase().charCodeAt(0) - 64;
};

const getColor = (value) => {
  if (value === 0) return 'black';
  const colors = [
      'white', 'red', 'green', 'blue', 'yellow', 'orange',
      'purple', 'cyan', 'magenta', 'lime', 'pink',
      'teal', 'lavender', 'brown', 'beige', 'maroon', 
      'mint', 'olive', 'apricot', 'navy', 'grey'
  ];
  return colors[value % colors.length];
};

function weightedRandomInt(maxVal, k) {
    let population = Array.from({ length: maxVal }, (_, i) => i + 1);
    let weights;
    if (k > NUM_CHANNELS) {
      weights = population.map(i => i ** 2);
    } else {
      weights = population.slice(); 
    }
    const index = weightedChoice(population, weights);
    return population[index];
  }
  
  function weightedChoice(population, weights) {
    const total = weights.reduce((acc, w) => acc + w, 0);
    const threshold = Math.random() * total;
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += weights[i];
      if (sum >= threshold) {
        return i;
      }
    }
  }

  // Generate a partition of k with distinct parts
  function generateStrictPartition(k) {
    let parts = new Set();
    let iters = 0;
    while (Array.from(parts).reduce((acc, val) => acc + val, 0) < k) {
      const part = weightedRandomInt(Math.min(NUM_CHANNELS, k - Array.from(parts).reduce((acc, val) => acc + val, 0)), k);
      parts.add(part);
      iters++;
      if (iters > 100) {
        return generateStrictPartition(k);
      }
    }
    return parts;
  }

  export { getLetterValue, generateStrictPartition, getColor };
