/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',

    pluginType: 'CAPTURE',
    entryPoints: {
        app: './src/App.tsx',
        plugin: './src/Plugin.tsx',
    },

    viteConfigExtensions: './viteConfigExtensions.mts',
}

module.exports = config
