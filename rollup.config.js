import babel from "rollup-plugin-babel";
import { uglify } from "rollup-plugin-uglify";
import json from "rollup-plugin-json";

import pkg from "./package.json";

export default [
  {
    input: "src/elastic_app_search.js",
    output: [
      {
        // browser-friendly UMD build, for Browsers or Node
        name: "ElasticAppSearch",
        file: "dist/elastic_app_search.umd.js",
        format: "umd"
      },
      {
        // ES6 module build, for things like Rollup
        file: pkg.module,
        format: "es"
      }
    ],
    plugins: [
      json(), // So we can import thing like `package.json` as a module
      babel({
        exclude: "node_modules/**" // only transpile our source code
      })
    ]
  },
  {
    input: "src/elastic_app_search.js",
    output: [
      {
        // Minified UMD build
        name: "ElasticAppSearch",
        file: "dist/elastic_app_search.umd.min.js",
        format: "umd"
      }
    ],
    plugins: [
      json(),
      babel({
        exclude: "node_modules/**"
      }),
      uglify()
    ]
  }
];
