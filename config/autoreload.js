module.exports.autoreload = {
  active: true,
  usePolling: false,
  dirs: [
    "api/models",
    "api/controllers",
    "api/services",
    "config/locales"
  ],
  ignored: [
    // ignored
    "**.ts"
  ]
};
