module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  "plugins": [
    ["import", { "libraryName": "ant-design-vue", "libraryDirectory": "es", "style": "css" }], // `style: true` 会加载 less 文件
    "@babel/plugin-proposal-logical-assignment-operators",
    ["@babel/plugin-proposal-pipeline-operator", { "proposal": "minimal" }],
    "@babel/plugin-proposal-do-expressions",
    "@babel/plugin-proposal-optional-chaining",
    "@babel/plugin-proposal-nullish-coalescing-operator",
    "@babel/plugin-proposal-partial-application",
  ]
}
