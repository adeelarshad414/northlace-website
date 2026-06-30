const placeholderMetricPattern = /X{2,}|^TBD$/i;

const isPlaceholderMetric = (value) =>
  typeof value === "string" && placeholderMetricPattern.test(value.trim());

export const findMetricPlaceholderViolations = (entries) =>
  entries.flatMap((entry) => {
    if (entry.data.draft) {
      return [];
    }

    const violations = [];

    if (isPlaceholderMetric(entry.data.heroMetric?.value)) {
      violations.push(
        `${entry.filePath} heroMetric.value contains placeholder metric "${entry.data.heroMetric?.value}"`,
      );
    }

    entry.data.outcomeMetrics?.forEach((metric, index) => {
      if (isPlaceholderMetric(metric.value)) {
        violations.push(
          `${entry.filePath} outcomeMetrics[${index}].value contains placeholder metric "${metric.value}"`,
        );
      }
    });

    return violations;
  });
