import babel from "rollup-plugin-babel";
import { uglify } from "rollup-plugin-uglify";

import pkg from "./package.json";

export default [
  {
    input: "src/swiftype_app_search.js",
    output: [
      {
        // browser-friendly UMD build
        name: "SwiftypeAppSearch",
        file: "dist/swiftype_app_search.umd.js",
        format: "umd"
      },
      {
        // ES6 module build
        file: pkg.module,
        format: "es"
      }
    ],
    plugins: [
      babel({
        exclude: "node_modules/**" // only transpile our source code
      })
    ]
  },
  {
    input: "src/swiftype_app_search.js",
    output: [
      {
        // Minified umd build
        name: "SwiftypeAppSearch",
        file: "dist/swiftype_app_search.umd.min.js",
        format: "umd"
      }
    ],
    plugins: [
      babel({
        exclude: "node_modules/**" // only transpile our source code
      }),
      uglify()
    ]
  }
];
