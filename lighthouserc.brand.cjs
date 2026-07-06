module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run preview -- --host 127.0.0.1 --port 4323",
      startServerReadyPattern: "Local",
      url: [
        "http://127.0.0.1:4323/brand",
        "http://127.0.0.1:4323/brand/northlace",
        "http://127.0.0.1:4323/brand/adeel-codes-cloud",
        "http://127.0.0.1:4323/brand/signal-and-scale",
        "http://127.0.0.1:4323/brand/the-cloud-lounge",
      ],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.95 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 1 }],
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci-brand",
    },
  },
};
