function average(values) {
  if (!values || values.length === 0) {
    return 0;
  }
  let total = 0;
  for (let i = 0; i < values.length; i += 1) {
    total += values[i];
  }
  return total / values.length;
}

function median(values) {
  if (!values || values.length === 0) {
    return 0;
  }
  const sortedValues = [...values].sort((a, b) => a - b);
  const half = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2) {
    return sortedValues[half];
  }

  return (sortedValues[half - 1] + sortedValues[half]) / 2;
}

function quartile(values, percentile) {
  if (!values || values.length === 0) {
    return 0;
  }
  const sortedValues = [...values].sort((a, b) => a - b);
  const pos = (sortedValues.length - 1) * percentile;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sortedValues[base + 1] !== undefined) {
    return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  }

  return sortedValues[base];
}

function jitter(values) {
  if (!values || values.length < 2) {
    return 0;
  }
  let jitters = [];
  for (let i = 0; i < values.length - 1; i += 1) {
    jitters.push(Math.abs(values[i] - values[i + 1]));
  }
  return average(jitters);
}

function min(values) {
  if (!values || values.length === 0) {
    return 0;
  }
  return Math.min(...values);
}

function max(values) {
  if (!values || values.length === 0) {
    return 0;
  }
  return Math.max(...values);
}

module.exports = {
  average,
  median,
  quartile,
  jitter,
  min,
  max,
};
