const CHROME_ARGS = [
  // --no-sandbox is needed when running Chrome inside a container
  process.env.CI ? '--no-sandbox' : null,
  '--headless',
  '--disable-dev-shm-usage',
  '--disable-software-rasterizer',
  '--mute-audio',
  '--remote-debugging-port=0',
  '--window-size=1440,900',
].filter(Boolean);

module.exports = {
  test_page: 'tests/index.html?hidepassed',
  disable_watching: true,
  launch_in_ci: ['Chromium', 'Chrome'],
  launch_in_dev: ['Chromium'],
  ignore_missing_launchers: true,
  browser_args: {
    Chromium: {
      ci: CHROME_ARGS,
      dev: CHROME_ARGS,
    },
    Chrome: {
      ci: CHROME_ARGS,
      dev: CHROME_ARGS,
    },
  },
};
