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
    meta.json
    money-cat.png
  taurus/
    index.ts
    meta.json
    banner.png
src/
  server.ts
  sync.ts
  copy-assets.ts
types/
  scriptable.d.ts
  api-core.d.ts
  api-system.d.ts
  api-io.d.ts
  api-misc.d.ts
dist/
  sync.js
  widgets/
```

每个组件一个目录，组件源码固定叫 `index.ts`，依赖图片放同目录。

`types/` 下按官方文档分组声明 Scriptable 全局 API：`scriptable.d.ts` 是小组件与核心类型，`api-core.d.ts` 是 Image/Data/Path 等数据类，`api-system.d.ts` 是通知/日历/提醒等系统类，`api-io.d.ts` 是 Safari/邮件/相册等通信媒体类，`api-misc.d.ts` 是 WebView/通讯录/输入等杂项类。

可选添加 `meta.json` 配置组件别名（同步列表里展示的中文名）和描述，未配置时别名使用目录名：

```json
{
  "alias": "招财猫",
  "description": "本月收入招财猫"
}
```

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

首次把构建后的 `dist/sync.js` 手动导入 Scriptable。

之后：

1. 电脑运行 `pnpm serve`
2. 手机运行 `sync`
3. 弹出组件列表：默认不勾选，按中文别名点选需要同步的组件（也可以用「全选」「全不选」），点「开始同步」
4. 只下载勾选的组件及其素材，并显示结果统计
5. 「清空手机里的组件」可一次性删除本机已同步的组件脚本和素材（不影响电脑端文件）

勾选结果会保存在 `sync-selection.json`，下次运行自动恢复；取消列表则不执行同步。

如果手机端看不到中文别名，说明电脑端同步服务还是旧代码，重启 `pnpm serve` 即可。

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
