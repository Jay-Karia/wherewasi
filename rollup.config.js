import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';

export default {
  input: 'background/worker.js',
  output: {
    dir: 'build/background',
    format: 'es',
    sourcemap: true
  },
  plugins: [
    nodePolyfills(),           // polyfill Node built-ins for browser
    resolve({ browser: true }),// resolve imports from node_modules
    commonjs(),                // convert CJS → ESM
    json()                     // support importing .json if needed
  ]
};
