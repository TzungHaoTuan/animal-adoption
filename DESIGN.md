# DESIGN.md — 設計系統唯一真相來源

> 修改任何設計（配色、字體、元件樣式）前先讀這份文件。改完設計也要回來同步這份文件。

## 設計定調

「日光暖房 Warm」：美式活潑、無襯線、圓體，大圓角＋膠囊型按鈕徽章。米白／白色中性色為基底，主色是蜜糖橘，可可棕作跳色。

**簽名元素**：header logo 用 lucide 的 `PawPrint` icon，跟主色（蜜糖橘）走。其餘保持克制，活潑感由字體、大圓角與按鈕按壓感陰影撐起，不靠滿版裝飾。

## 字體

| 角色                             | 字體                                        | CSS 變數              | 說明                                       |
| -------------------------------- | ------------------------------------------- | --------------------- | ------------------------------------------ |
| heading（`font-heading`）        | Quicksand（600–700）→ fallback Noto Sans TC | `--font-quicksand`    | 圓角幾何無襯線，Latin variable 300–700     |
| body Latin（`font-sans` 優先）   | Nunito（400/500/600/700/800）               | `--font-nunito`       | 圓潤的幾何無襯線，與蜜糖橘主色調性一致     |
| body CJK（`font-sans` fallback） | Noto Sans TC（400/500/700）                 | `--font-noto-sans-tc` | 繁中正黑體，字形中性現代，覆蓋漢字與罕用字 |

Font stack 邏輯：

- `font-sans` = `var(--font-nunito), var(--font-noto-sans-tc)` — 英文走 Nunito，漢字 fallback 到 Noto Sans TC
- `font-heading` = `var(--font-quicksand), var(--font-noto-sans-tc)` — 英文標題走 Quicksand，漢字標題走 Noto Sans TC
- 三者都走 `next/font/google`（`app/layout.tsx`），CSS 變數於 `globals.css` 的 `@theme inline` 映射
- `h1`–`h4` 由 `@layer base` 自動套 `font-heading`，頁面標題不需手動加 class
- 不載 mono 字體（全站零使用，`font-mono` 回落 Tailwind 預設）

## 色彩（oklch）

| token                     | light                                                  | 用途                                                                                                            |
| ------------------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- |
| `--background`            | 米白 `0.972 0.016 75`                                  | 頁面底色                                                                                                        |
| `--foreground`            | 近黑咖啡 `#3B2A1C`                                     | 主文字                                                                                                          |
| `--card` / `--popover`    | 白 `#FFFFFF`                                           | 卡片浮於米白底上，製造層次                                                                                      |
| `--primary`               | 蜜糖橘 `0.72 0.13 55`，前景奶油白 `#FFF7EE`            | 按鈕、品牌、地圖 pin（pin SVG 用 `var(--primary)` 自動跟色）                                                    |
| `--primary-shadow`        | 深蜜糖橘 `0.55 0.11 55`                                | 主按鈕「按壓感」底部 2px 實色陰影                                                                               |
| `--accent`                | 可可棕淡底 `0.9 0.025 55`，前景深可可棕 `0.4 0.055 50` | hover 淡色高亮（詳情頁備註區塊、地圖選中列、下拉選單 focus、Google 地圖連結、篩選列「重設」）                   |
| `--accent-solid`          | 深可可棕 `0.45 0.06 50`，前景奶油白 `#F7F0E9`          | 「健康照護完成」徽章、首頁狗狗統計數字——`--accent` 的高飽和版本，shadcn 語意集沒有對應 slot，另外加的兩個 token |
| `--primary-soft-bg`       | 淡蜜糖橘 `0.93 0.045 65`                               | Header nav 選中分頁底色                                                                                         |
| `--secondary` / `--muted` | 深一階米白 `0.94 0.02 70` / 中性淡灰暖階 `#7A6A5B`     | 次要底色                                                                                                        |
| `--border` / `--input`    | 米白階淡灰 `0.9 0.025 65`                              |                                                                                                                 |
| `--ring`                  | 同 primary                                             |                                                                                                                 |

Dark mode（`.dark`，token 同步維護但目前無切換 UI）：background/foreground 與 light 互換，primary/accent/primary-shadow/primary-soft-bg/accent-solid 沿用與 light 相同的值（設計系統本身未提供獨立 dark 配色，維持與舊版一致的「兩模式共用同一組品牌色」慣例）。

另有三個共用陰影 token（`--shadow-header-chip`、`--shadow-card`、`--shadow-hero-card`，值見 `app/globals.css`），註冊在 `@theme inline` 的 `--shadow-*` 命名空間下，直接產生 `shadow-header-chip`／`shadow-card`／`shadow-hero-card` 這三個 Tailwind utility，兩種 card 陰影深淺分別對應「小型 chip/pill」與「大卡片」。

## Token 結構（不要動結構，只改值）

`app/globals.css` 是唯一調色中樞，採標準 shadcn/ui × Tailwind v4 寫法：

- `:root` / `.dark` 放原始 oklch 值，`@theme inline` 映射成 Tailwind utility（`bg-background`、`text-muted-foreground`…）。
- Token 命名是 shadcn 官方語意集（`--primary` + `--primary-foreground` 成對等），元件只認語意名。
- 換主題 = 只改 `:root` / `.dark` 的色值，所有元件自動跟上。

## 形狀與層級規則

- **radius**：用 Tailwind v4 原生分級尺度（`xl`=12px、`2xl`=16px、`3xl`=24px、`4xl`=32px…）。使用規則：卡片/照片/大區塊（`Card`、hero 圖、地圖容器）= `rounded-3xl`；卡片內嵌的方形縮圖（`AnimalCard`、推薦縮圖）= `rounded-2xl`；卡片內嵌的矮色塊（詳情頁備註區塊）= `rounded-xl`；下拉選單彈出層 = `rounded-2xl`、選單項目 = `rounded-lg`；徽章 = `rounded-4xl`/full。按鈕、Toggle chip、Select trigger 一律 `rounded-full`（膠囊型），不受這個尺度影響。
- **標題階層**：h1 hero = `text-3xl sm:text-4xl`；區塊標題 = `font-heading text-lg font-bold`（用 `font-heading` + `font-bold`，不要用純 `font-semibold` 的 body 字重當區塊標題）。
- **版心**：`max-w-6xl px-4 sm:px-6`，header 與頁面內容共用同一 gutter。
- **elevation**：卡片一律 `shadow-card`（無 ring/border，純陰影撐出層次——`ui/card.tsx` 的 cva 已經是這個預設，呼叫端不用重複寫）；互動卡片（`AnimalCard`）hover 加 `-translate-y-0.5 shadow-md`。小型 pill/chip（header nav、avatar badge、hero 徽章）用 `shadow-header-chip`。主按鈕另有 `shadow-[0_2px_0_var(--primary-shadow)]` 的按壓感陰影，`active` 時陰影消失＋按鈕下移 1px，模擬按下去的觸感；header logo 圓徽也套用同一個按壓陰影。這是全站僅有的動態效果，保持克制。

## 元件策略

- 用 shadcn/ui（style `base-nova`，基於 Base UI 非 Radix），不用 Claude Design——其核心價值是團隊協作與交接，對一人 side project 是多餘流程開銷；shadcn 把元件原始碼生成進 `components/ui/`、基於 CSS variables 做 theming，零轉換成本。
- Domain 複合元件（`AnimalCard`、`FilterBar` 等）放 `components/`，只組合 primitives 與 token，不自帶硬編碼色值。
- `ui/toggle.tsx`（連帶 `ToggleGroup`）與 `ui/select.tsx` 的 `SelectTrigger` 都改成膠囊 chip 外觀（`rounded-full`、無框線、選中態 `bg-primary`/`data-[state=on]`），讓 `FilterBar` 的種類/性別 toggle 和年齡/體型/縣市 select 視覺上是同一組 chip，使用端不用另外加樣式。
- `SiteHeader` 的 `current` prop 預設 `"animals"`（首頁沒有明確對應分頁，比照設計系統定案稿把首頁歸在「找毛孩」分頁高亮）。
- `components/ui/button.tsx`／`badge.tsx` 目前沒有任何呼叫端引用（已被各頁面的客製 pill 取代），刻意保留當作可用 primitive，之後要做表單或彈窗時直接用，不用重新刻一份。連帶 `--destructive`／`--input`／`--secondary` 這三個 token 也只存在於這兩個檔案內部，同樣是「暫時沒被用到但保留」的狀態，不是遺漏。
- `--chart-*`（5 個）、`--sidebar-*`（8 個）是 shadcn 範本內建的圖表／側邊欄 token，這個專案從未做過圖表或側邊欄元件，已整組移除。

## 未來項目（本次不做）

- GSAP 動效：列表卡片進場 stagger、篩選 fade/scale、詳情圖 hover parallax。Next.js 須用 `useGSAP`（`@gsap/react`）+ `useRef`，限 client component。
- Dark mode 切換 UI（token 已備好）。
