const app = require('./src/app');
const env = require('./src/config/env');

app.listen(env.port, () => {
  console.log(`[aheadly] API listening on port ${env.port}`);
});
