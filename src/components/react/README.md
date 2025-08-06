# React Components

这个目录包含了 Deltarune 预言面板生成器的 React 组件版本。

## 组件列表

### ProphecyGenerator

主要的预言面板生成器组件，包含所有原始功能：

- 图片上传和遮罩处理
- 文本输入和自定义
- 多种样式选择（默认、Susie 的暗世界、最终预言）
- 图片缩放和位置调整
- 高级设置（字体、纹理等）
- 实时预览画布

### MonochromeTool

单色图像处理工具组件：

- 图像上传和预览
- 阈值调整滑块
- 颜色反转开关
- PNG 导出功能

### Feedback

反馈组件，用于收集用户反馈和建议。

## 使用方法

### 在 Astro 页面中使用

```astro
---
import { ProphecyGenerator } from "@/components/react/ProphecyGenerator";
import { MonochromeTool } from "@/components/react/MonochromeTool";
---

<ProphecyGenerator client:load />
<MonochromeTool client:load />
```

### 在 React 应用中使用

```tsx
import { ProphecyGenerator, MonochromeTool } from "@/components/react";

function App() {
  return (
    <div>
      <ProphecyGenerator />
      <MonochromeTool />
    </div>
  );
}
```

## 特性

- ✅ 完整的 TypeScript 支持
- ✅ 响应式设计
- ✅ 自定义字体支持
- ✅ 实时画布渲染
- ✅ 文件上传处理
- ✅ 动画效果
- ✅ 模块化架构

## 依赖

- React 18+
- TypeScript
- Tailwind CSS
- shadcn/ui 组件库

## 样式

所有组件都包含了必要的 CSS 样式，包括：

- 自定义字体（ProphecyType 和 DTM Sans）
- 动画效果
- 响应式布局
- 交互状态

组件遵循扁平化设计风格，符合原始项目的设计理念。
