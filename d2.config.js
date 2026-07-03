/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    name: 'matrix-select',
    title: 'Matrix Select',
    description: 'A DHIS2 app for selecting matrix data.',
    type: 'app',
    minDHIS2Version: '2.38',
    pluginType: 'CAPTURE',
    entryPoints: { plugin: './src/Plugin.tsx' },
    viteConfigExtensions: './viteConfigExtensions.mts',
}

module.exports = config
