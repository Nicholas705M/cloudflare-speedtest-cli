const { scaleThreshold } = require("d3-scale"); // We will need to install d3-scale

// Define thresholds for classification based on common internet usage
const classificationThresholds = {
  packetLoss: scaleThreshold(
    [0.01, 0.05, 0.25, 0.5],
    ["great", "good", "average", "poor", "bad"]
  ), // Lower is better
  latency: scaleThreshold(
    [10, 20, 50, 100, 500],
    ["great", "good", "average", "poor", "bad"]
  ), // Lower is better (ms)
  jitter: scaleThreshold(
    [5, 10, 25, 50],
    ["great", "good", "average", "poor", "bad"]
  ), // Lower is better (ms)
  download: scaleThreshold(
    [10, 25, 50, 100],
    ["bad", "poor", "average", "good", "great"]
  ), // Higher is better (Mbps)
  upload: scaleThreshold(
    [5, 10, 25, 50],
    ["bad", "poor", "average", "good", "great"]
  ), // Higher is better (Mbps)
  // Add loadedLatencyIncrease if implemented later
};

/**
 * Classifies a single metric based on predefined thresholds.
 * @param {string} metricName - The name of the metric (e.g., 'download', 'latency').
 * @param {number} value - The value of the metric.
 * @returns {string} The classification (e.g., 'great', 'good', 'average', 'poor', 'bad').
 */
function classifyMetric(metricName, value) {
  const scale = classificationThresholds[metricName];
  if (scale) {
    return scale(value);
  }
  return "N/A";
}

/**
 * Provides an overall connection quality score based on multiple metrics.
 * This is a simplified example; real-world classification can be more complex.
 * @param {object} metrics - An object containing various speed test metrics.
 * @returns {object} An object with overall classification and individual metric classifications.
 */
function classifyConnection(metrics) {
  const classifications = {};
  let overallScore = 0;
  let classifiedMetricsCount = 0;

  for (const metricName in classificationThresholds) {
    if (metrics.hasOwnProperty(metricName) && metrics[metricName] !== null) {
      const value = parseFloat(metrics[metricName]);
      if (!isNaN(value)) {
        const classification = classifyMetric(metricName, value);
        classifications[metricName] = classification;
        classifiedMetricsCount++;

        // Assign points for overall score (example logic)
        switch (classification) {
          case "great":
            overallScore += 5;
            break;
          case "good":
            overallScore += 3;
            break;
          case "average":
            overallScore += 1;
            break;
          case "poor":
            overallScore -= 1;
            break;
          case "bad":
            overallScore -= 3;
            break;
        }
      }
    }
  }

  let overallClassification = "N/A";
  if (classifiedMetricsCount > 0) {
    const avgScore = overallScore / classifiedMetricsCount;
    if (avgScore >= 4) overallClassification = "Great";
    else if (avgScore >= 2) overallClassification = "Good";
    else if (avgScore >= 0) overallClassification = "Average";
    else if (avgScore >= -2) overallClassification = "Poor";
    else overallClassification = "Bad";
  }

  return {
    overall: overallClassification,
    details: classifications,
  };
}

module.exports = {
  classifyMetric,
  classifyConnection,
};
