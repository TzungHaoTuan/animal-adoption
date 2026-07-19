# DESIGN.md — 設計系統唯一真相來源

> 修改任何設計（配色、字體、元件樣式）前先讀這份文件。改完設計也要回來同步這份文件。

## 設計定調

美式活潑、無襯線、圓體。黑白中性色為基底，主色是「貓掌肉球粉」。

**簽名元素**：肉球粉本身就是品牌 —— 主色取自貓掌肉球的粉紅，header logo 用 lucide 的 `PawPrint` icon。其餘保持克制，活潑感由字體與圓角撐起，不靠滿版裝飾。

## 字體

| 角色 | 字體 | 說明 |
|---|---|---|
| heading（`font-heading`） | Quicksand（600–700）→ fallback Zen Maru Gothic | 圓角幾何無襯線，Latin variable 300–700 |
| body（`font-sans`） | Zen Maru Gothic（400/500/700） | 日文圓體；其 Latin 字符也是圓體，短英數直接和諧 |

- 兩者都走 `next/font/google`（`app/layout.tsx`），CSS 變數 `--font-quicksand` / `--font-zen-maru`，在 `globals.css` 的 `@theme inline` 映射到 `--font-sans` / `--font-heading`。
- `h1`–`h4` 由 `@layer base` 自動套 `font-heading`，頁面標題不需手動加 class。
- **已知取捨**：Zen Maru Gothic 是日文字體，繁中罕用字會 fallback 到系統字型、少數字形為日式寫法。
- 不載 mono 字體（全站零使用，`font-mono` 回落 Tailwind 預設）。

## 色彩（oklch）

| token | light | 用途 |
|---|---|---|
| `--background` / `--foreground` | 純白 `1 0 0` / 近黑 `0.2 0.015 350` | 黑白基底 |
| `--primary` | 肉球粉 `0.64 0.17 20`，前景白 | 按鈕、品牌、地圖 pin（pin SVG 用 `var(--primary)` 自動跟色） |
| `--accent` | 淡粉底 `0.94 0.04 15`，前景深粉 | hover、徽章跳色 |
| `--secondary` / `--muted` | 極淡粉灰 / 中性淡灰 | 次要底色 |
| `--border` / `--input` | 淡灰 `0.9 0.005 350` | |
| `--ring` | 同 primary | |

Dark mode（`.dark`，token 同步維護但目前無切換 UI）：近黑底 `0.18 0.01 350`、粉主色提亮 `0.72 0.15 20`。

## Token 結構（不要動結構，只改值）

`app/globals.css` 是唯一調色中樞，採標準 shadcn/ui × Tailwind v4 寫法：

- `:root` / `.dark` 放原始 oklch 值，`@theme inline` 映射成 Tailwind utility（`bg-background`、`text-muted-foreground`…）。
- Token 命名是 shadcn 官方語意集（`--primary` + `--primary-foreground` 成對等），元件只認語意名。
- 換主題 = 只改 `:root` / `.dark` 的色值，所有元件自動跟上。

## 形狀與層級規則

- **radius**：`--radius: 1rem`，經既有比例 scale（sm→4xl）派生。使用規則：照片/大區塊 = `rounded-3xl`、卡片 = `rounded-xl`（Card 預設）、徽章 = `rounded-4xl`/full。
- **標題階層**：h1 hero = `text-3xl sm:text-4xl`；區塊標題 = `text-lg font-semibold`。不要用 `text-sm font-bold` 當區塊標題。
- **版心**：`max-w-6xl px-4 sm:px-6`，header 與頁面內容共用同一 gutter。
- **elevation**：卡片用 `ring-1 ring-foreground/10`（shadcn base-nova 預設）；互動卡片 hover 加 `-translate-y-0.5 shadow-md`。這是全站唯一的 motion，保持克制。

## 元件策略

- 用 shadcn/ui（style `base-nova`，基於 Base UI 非 Radix），不用 Claude Design——其核心價值是團隊協作與交接，對一人 side project 是多餘流程開銷；shadcn 把元件原始碼生成進 `components/ui/`、基於 CSS variables 做 theming，零轉換成本。
- Domain 複合元件（`AnimalCard`、`FilterBar` 等）放 `components/`，只組合 primitives 與 token，不自帶硬編碼色值。

## 未來項目（本次不做）

- GSAP 動效：列表卡片進場 stagger、篩選 fade/scale、詳情圖 hover parallax。Next.js 須用 `useGSAP`（`@gsap/react`）+ `useRef`，限 client component。
- Dark mode 切換 UI（token 已備好）。
