# i-scriptable

用 TypeScript 写 Scriptable 小组件，并通过本地同步服务把构建后的脚本和素材同步到 iPhone。

## 环境

- Node.js >= 24
- pnpm >= 10，推荐本机使用 `pnpm@10.33.0`

## 目录

```text
widgets/
  moneycat/
    index.ts
    money-cat.png
  taurus/
    index.ts
    banner.png
src/
  server.ts
  client.ts
  copy-assets.ts
types/
  scriptable.d.ts
dist/
  client.js
  widgets/
```

每个组件一个目录，组件源码固定叫 `index.ts`，依赖图片放同目录。

## 开发

```bash
pnpm install
pnpm typecheck
pnpm lint:fix
pnpm build
pnpm serve
```

`pnpm serve` 会先构建，再启动本地同步服务。控制台会打印局域网地址，例如：

```text
http://192.168.50.35:8787/manifest.json
```

## 手机同步

首次把构建后的 `dist/client.js` 手动导入 Scriptable。

之后：

1. 电脑运行 `pnpm serve`
2. 手机运行 `client`
3. 同步脚本会分别显示脚本数量和素材数量

脚本和素材都会保留相对目录，例如 `moneycat/index.js` 和 `moneycat/money-cat.png`。

## 新增组件

新建目录：

```text
widgets/my-widget/
  index.ts
  background.png
```

运行 `pnpm build` 后会生成：

```text
dist/widgets/my-widget/index.js
dist/widgets/my-widget/background.png
```

组件里读取素材时使用相对路径：

```ts
const path = fm.joinPath(fm.documentsDirectory(), 'my-widget/background.png')
```
