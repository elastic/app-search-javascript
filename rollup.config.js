import babel from 'rollup-plugin-babel';

import pkg from './package.json';

export default
	{
		input: 'src/swiftype_app_search.js',
		output: [{
      // browser-friendly UMD build
			name: 'SwiftypeAppSearch',
			file: pkg.browser,
      format: 'umd'
    }, {
      // ES6 module build
      file: pkg.module,
      format: 'es'
    }],
    plugins: [
      babel({
        exclude: 'node_modules/**' // only transpile our source code
      })
    ]
	}
