const util = require('util');

function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info: (...args) => {
    const msg = args.map(a => (typeof a === 'object' ? util.inspect(a, { depth: null, colors: false }) : a)).join(' ');
    console.log(`[${timestamp()}] [INFO] ${msg}`);
  },
  warn: (...args) => {
    const msg = args.map(a => (typeof a === 'object' ? util.inspect(a, { depth: null, colors: false }) : a)).join(' ');
    console.warn(`[${timestamp()}] [WARN] ${msg}`);
  },
  error: (...args) => {
    const msg = args.map(a => (typeof a === 'object' ? util.inspect(a, { depth: null, colors: false }) : a)).join(' ');
    console.error(`[${timestamp()}] [ERROR] ${msg}`);
  },
};

module.exports = logger;
