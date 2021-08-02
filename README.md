# Speako
 
Bot conversation designer and tester for in browser conversation flow planning and debugging.

Visit [tabahi.github.io/Speako/](https://tabahi.github.io/Speako/) to check a very simple bot or design your own.


## Design Rules

- There should be at least 1 `Bot Start` node in the design.
- Each `Bot` and `Bot Start` should be followed by at least one `Human` node.
- Each `Bot` and `Bot Start` should be followed by a `Bot fallback` node for in case no response matches the next available `Human` nodes.
- Adding a star `*` as one of the Text possibilities in `Human` nodes will accept all responses by human, therefore no need for fallback in that case.
- The end event nodes `Desired Out` and `Drop` can have multiple action commands as Text values. Currently, only the URL command is programmed.
- If a `Human` node is followed by multiple bot nodes, then preference goes to `Desired Out`, then `Bot` and then `Drop`, in that order. If there are multiple `Bot` nodes available then one will be selected randomly.

## 设计规则

- 设计中应该至少有 1 个`Bot Start`节点。
- 每个 `Bot` 和 `Bot Start` 都应该跟有至少一个 `Human` 节点。
- 每个 `Bot` 和 `Bot Start` 后面都应该跟一个 `Bot fallback` 节点，以防没有响应匹配下一个可用的 `Human` 节点。
- 添加星号 `*` 作为 `Human` 节点中的文本可能性之一将接受人类的所有响应，因此在这种情况下不需要回退。
- 结束事件节点`Desired Out` 和`Drop` 可以有多个动作命令作为文本值。 目前，仅对 URL 命令进行编程。
- 如果一个 `Human` 节点后面跟着多个 bot 节点，则优先级依次为 `Desired Out`、`Bot` 和 `Drop`。 如果有多个“Bot”节点可用，则将随机选择一个。 

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
