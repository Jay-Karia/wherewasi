import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodePolyfills from 'rollup-plugin-node-polyfills';
import replace from '@rollup/plugin-replace';
import inject from '@rollup/plugin-inject';

import dotenv from 'dotenv';
dotenv.config();

export default {
  input: 'background/worker.js',
  output: {
    dir: 'build/background',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    replace({
      preventAssignment: true,
      'process.env.GEMINI_API_KEY': JSON.stringify(
        process.env.GEMINI_API_KEY || ''
      ),
    }),

    inject({ process: 'process/browser' }),
    nodePolyfills(),
    resolve({ browser: true, preferBuiltins: false }),
    commonjs(),
    json(),
  ],
};
