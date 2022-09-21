const {defineConfig} = require('@vue/cli-service')
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin")

module.exports = defineConfig({
    transpileDependencies: [
        'vuetify'
    ],
    pluginOptions: {
        electronBuilder: {
            preload: 'src/preload.js',
            builderOptions: {
                extraResources: ['src', 'src/res/'],
                appId: "br.com.dld",
                productName: "Docker builder",
                linux: {
                    target: "deb",
                    category: "Productivity"
                },
                win: {
                    target: "nsis",
                    icon: "build/icons/icon.ico",
                    publisherName: "David Duarte"
                }
            }
        },
    },
    configureWebpack: {
        plugins: [
            new NodePolyfillPlugin()
        ]
    }
})