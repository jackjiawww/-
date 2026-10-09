# Windows 真人桌宠

透明、置顶的桌面宠物，无需账号或 API 密钥。默认使用根据提供照片制作的透明人物素材，支持轻微浮动和点击反馈；不包含真人眨眼或口型动画。

## 双击运行（已打包版本）

在 GitHub 打开 `downloads/DesktopPet-Windows-x64.exe`，点击文件页的 Download raw file 下载到 Windows 电脑，放到桌面后双击。无需安装 Node.js。打开后人物会出现在右下角；拖动移动，点击底部「互动」按钮，右键退出。便携版未配置代码签名。

## Windows 从源码运行

安装 Node.js 22 或 24 LTS，在项目目录打开 PowerShell：

```powershell
npm ci
npm start
```

- 按住左键拖动移动。
- 点击底部「互动」按钮。
- 右键选择「选择真人照片…」可替换素材（推荐透明 PNG）；选择会保存在本机用户数据目录，重启后恢复。
- 点击底部「菜单」按钮，可以睡觉/醒来、切换置顶、回到屏幕右下角或退出。
- 程序不显示任务栏按钮，请通过右键菜单退出。

## 打包 Windows 程序

在 Windows 上运行：

```powershell
npm run check
npm run dist:win
```

生成的便携版 `.exe` 位于 `dist`，用户运行时无需安装 Node.js。当前没有配置代码签名。

## 验证范围

`npm run check` 检查 JavaScript 语法。透明窗口、置顶、拖动、多显示器和 Windows 打包需要在 Windows 上实际验证。云端 Linux 的构建验证不能代替 Windows 桌面验收。

0.1.1：人物区域改用 Windows 原生窗口拖动，互动和菜单通过底部按钮操作。
