module.exports = {
    makers: [
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    categories: 'Game',
                    maintainer: 'The alpha project',
                    homepage: 'https://github.com/The-Alpha-Project'
                }
            }
        },
        {
            name: '@electron-forge/maker-squirrel'
        }
    ]
}
