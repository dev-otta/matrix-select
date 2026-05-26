/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',

    pluginType: 'CAPTURE',
    entryPoints: {
        plugin: './src/Plugin.tsx',
    },

    viteConfigExtensions: './viteConfigExtensions.mts',
}

module.exports = config
