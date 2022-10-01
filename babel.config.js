var path = require('path');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ["./src/"],
        resolvePath(sourcePath, currentFile, opts) {
          if (
            sourcePath === 'react-native' &&
            !(
              (
                currentFile.includes('node_modules/react-native/') || // macos/linux paths
                currentFile.includes('node_modules\\react-native\\')
              ) // windows path
            ) &&
            !(
              currentFile.includes('resolver/react-native/') ||
              currentFile.includes('resolver\\react-native\\')
            )
          ) {
            return path.resolve(__dirname, 'resolver/react-native');
          }
          /**
           * The `opts` argument is the options object that is passed through the Babel config.
           * opts = {
           *   extensions: [".js"],
           *   resolvePath: ...,
           * }
           */
          return undefined;
        },
        alias: {
          "locales": "./src/locales", // optional
          "components": "./src/components", // optional
          "containers": "./src/containers", // optional
          "config": "./src/config", // optional
          "styles": "./src/styles", // optional
          "images": "./src/images", // optional,
          "utils": "./src/utils", // optional,
          "values": "./src/values", // optional,
          "lib": "./src/lib", // optional
          "epics": "./src/epics", // optional,
          "enum": "./src/enum", // optional,
          "reducers": "./src/reducers", // optional,
          "store": "./src/store", // optional,
          "actions": "./src/actions", // optional,
        }
      }
    ]
  ],
};