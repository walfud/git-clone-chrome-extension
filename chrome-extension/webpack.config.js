const path = require('path')

module.exports = {
    entry: path.join(__dirname, 'src', 'popup.js'),
    output: {
        path: path.join(__dirname, 'package'),
        filename: 'popup.js',
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            [
                                '@babel/preset-env',
                                {
                                    'targets': {
                                        'browsers': ['last 2 Chrome versions'],
                                    }
                                }
                            ],
                            "@babel/preset-react"
                        ],
                        plugins: ['@babel/plugin-proposal-class-properties', '@babel/plugin-proposal-object-rest-spread'],
                    }
                }
            }
        ]
    },
}