module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ["./src/"],
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
  ]
};