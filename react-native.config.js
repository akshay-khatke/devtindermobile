module.exports = {
    transformer: {
        getTransformOptions: async () => ({
            transform: {
                experimentalImportSupport: false,
                inlineRequires: true,
            },
        }),
    },
    resolver: {
        sourceExts: ['js', 'jsx', 'ts', 'tsx'],
        assetExts: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ttf', 'otf', 'xml', 'mp4', 'm4a'],
        watchFolders: [__dirname],
        nodeModulesPaths: [__dirname + '/node_modules'],
    },
    // Optional: If you have separate android/ios directories outside the project root
    // projectRoot: __dirname,
    // watchRoot: __dirname,
};
