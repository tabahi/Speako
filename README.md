# Speako
 
Bot conversation designer and tester for in browser conversation flow planning and debugging.

Visit [tabahi.github.io/Speako/](https://tabahi.github.io/Speako/) to check a very simple bot or design your own.

## Saving the model

Designer saves the model in browser's local memory, and then the tester uses that model during the conversation. Closing the browser (usually) won't reset it, however clearing the browser's memory will reset the model.

## Browser Compatibility

Currently only Chrome, Edge and Safari has the full support for Speech Recognition. Check [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition) for the latest news because Web Speech API is currently flagged as experimental technology.

# Install:

```CMD
:: Install Webpack
:: cd ./
npm init -y
npm install webpack webpack-cli --save-dev
:: Edit webpack.config.js
npx webpack --config webpack.config.js
:: Build:
npm run build

:: Install and Run Dev server:
npm install webpack-dev-server
npm run dev
```

Dependency: [GoJS 2.1](https://gojs.net/)
