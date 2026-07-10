# 台灣動物認領養網站 - 專案規劃文件

> 本文件整理自與 Claude 的規劃討論，作為開發時的參考依據。可直接在 Claude Code 裡開啟這份文件，
> 請 Claude Code 依照這裡的規劃逐步建立專案。

## 專案目標

串接農業部（原農委會）動物認領養開放資料 API，做一個資訊清楚、視覺溫暖的認養資訊網站，
作為個人 side project 累積 React / Next.js / AI 輔助開發流程經驗。

## 技術棧

- **框架**：Next.js（App Router）
- **語言**：TypeScript
- **樣式**：Tailwind CSS
- **UI 元件**：shadcn/ui（基於 Tailwind + CSS variables，自帶一致的 design system）
- **動效**：GSAP（搭配 `@gsap/react` 的 `useGSAP` hook）

---

## 一、資料來源：動物認領養 API

**API 文件**：https://data.moa.gov.tw/api.aspx
**Endpoint**：`http://data.moa.gov.tw/Service/OpenData/AnimalOpenData.aspx`

### 支援參數
- `$top`：取得筆數
- `$skip`：分頁位移
- `$filter`：篩選條件，語法如 `animal_kind+like+貓`，可用 `+and+` 疊加多條件

### 常見欄位
| 欄位 | 說明 |
|---|---|
| `animal_kind` | 貓 / 狗 |
| `animal_colour` | 花色 |
| `animal_bodytype` | SMALL / MEDIUM / BIG |
| `animal_sex` | 性別 |
| `animal_sterilization` | 絕育狀態：N=未輸入 / F=否 / T=是 |
| 照片網址 | 已統一為 https |
| 收容所資訊 | 名稱、電話、地址 |

### ⚠️ 資料特性（會直接影響設計）
- **資料是動態的**：動物一旦被領養，該筆資料會直接從清單消失，**沒有「已認養」狀態欄位**，也**沒有領養日期欄位**。
- 因此網站不適合做「歷史紀錄」或「已成功送養」頁面，因為資料源本身不保留這類資訊。
- 資料**每日更新**。
- API 本身是 `http`（非 `https`），且官方沒有明確 CORS 政策 → 需要後端代理層（見第四節）。

---

## 二、頁面與內容規劃

### 首頁（列表頁）
- 卡片網格：照片、種類、花色、體型、所在收容所、大概地區
- 篩選列：貓/狗、體型、性別、絕育狀態、縣市
- 分頁或無限捲動（利用 `$top` / `$skip`）
- Empty state：篩選過嚴無結果、或資料剛好被領養完的情況都要處理

### 動物詳情頁
- 大圖 + 基本資料 + 收容所聯絡資訊（電話、地址，加 Google Maps 外部連結）
- 提醒文案：「此資料每日更新，若已被認養則會自動下架」

### 收容所／地圖頁（加分項）
- 依收容所分群，或用地圖標記全台收容所分布

### 收藏／關注（加分項）
- 用 `localStorage` 存收藏清單即可，MVP 階段不需要帳號系統

---

## 三、Design System 策略

**結論：不使用 Claude Design，直接用 shadcn/ui 建立輕量 design system。**

理由：
1. Claude Design 的核心價值是「團隊協作 + 交接給其他工程師」，對一人 side project 是多餘的流程開銷。
2. Claude Design 跑在 Opus 4.7 上，較耗用量額度，且是獨立的研究預覽產品。
3. shadcn/ui 本身就是把元件原始碼生成到專案裡（`components/ui/`），基於 CSS variables 做 theming，
   已經解決「樣式一致性」的需求，且完全活在程式碼裡、零轉換成本。

### 實作順序
1. **shadcn CLI init**：選定色系（建議暖色系如橘/杏色，適合寵物網站），建立 `globals.css` 的 CSS variables（`--primary`、`--radius`、`--muted` 等）作為 design system 雛形
2. **定義 theme tokens**：主色、dark mode 對應色，全站元件統一吃這套變數
3. **建立自訂複合元件**：`AnimalCard`、`FilterBar`、`AnimalDetailSheet` 等 domain 專屬元件

### GSAP 動效規劃
- 列表卡片進場：`gsap.from` + stagger
- 篩選切換：fade / scale transition
- 詳情頁圖片：hover scale 或輕微 parallax
- Next.js 中須注意：使用 `useGSAP`（`@gsap/react`）+ `useRef`，且需在 client component 中使用（加 `"use client"`），避免 SSR 階段操作不存在的 DOM

---

## 四、API 代理層架構

### 為什麼不能讓瀏覽器直接打政府 API

1. **CORS 風險**：政府開放資料平台不一定會回傳 `Access-Control-Allow-Origin`，瀏覽器跨網域請求可能被直接擋下（curl 測試正常，但瀏覽器環境會失敗）。
2. **Mixed content 封鎖**：API 是 `http`，若網站部署在 `https`（如 Vercel），瀏覽器會封鎖從 https 頁面發出的 http 請求。**這個問題只能靠後端代理解決**，前端無論怎麼調整都沒用。
3. **避免細節外露**：直接 client-side 呼叫的話，API 呼叫方式與篩選邏輯會完全暴露在瀏覽器 devtools 中。

### Route Handler 實作

```typescript
// app/api/animals/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind'); // 貓 or 狗
  const top = searchParams.get('top') ?? '20';
  const skip = searchParams.get('skip') ?? '0';

  let filter = '';
  if (kind) filter = `animal_kind+like+${encodeURIComponent(kind)}`;

  const apiUrl = new URL('http://data.moa.gov.tw/Service/OpenData/AnimalOpenData.aspx');
  apiUrl.searchParams.set('$top', top);
  apiUrl.searchParams.set('$skip', skip);
  if (filter) apiUrl.searchParams.set('$filter', filter);

  const res = await fetch(apiUrl.toString(), {
    next: { revalidate: 3600 }, // 快取 1 小時
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 502 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
```

前端只需要打自己的 `/api/animals?kind=貓`，不需碰原始政府 API 網址與語法。

### 快取（`revalidate`）的用意

- 資料本身「每日更新」，快取 1 小時完全不影響資料新鮮度
- 減少對政府伺服器的請求量
- 使用者體感速度變快（大部分請求吃 Next.js 自己的快取）

### 需要注意的坑

1. **篩選參數組合過多會降低快取命中率**：若篩選維度很多（種類 × 體型 × 性別 × 縣市），
   可考慮改成「固定抓全部資料（如 `$top=1000`）並快取」，篩選邏輯自己在程式碼裡處理，而不是每種組合各打一次外部 API。
2. **`$skip`/`$top` 分頁與快取搭配**：翻頁到新的頁面時第一次仍需真的打一次外部 API，屬正常現象。
3. **未來可平滑升級為資料庫架構**：若之後想加排程（如 Vercel Cron）把資料存進自己的資料庫，
   Route Handler 的抓取邏輯可以直接搬過去，不用重寫。
4. **錯誤處理不能省**：政府開放資料平台穩定性有限，Route Handler 需要 try/catch + timeout，
   前端也要有合理的 loading / error 狀態。

---

## 五、開發前需確認的缺漏項目（依重要程度）

### 🔴 P0 — 現在補上，晚做會返工
1. **篩選狀態同步到 URL query params**，不要只放 React state。理由：篩選結果需要可分享、瀏覽器上一頁鍵要能用。晚加等於重構整個列表頁的資料流。
2. **`next.config.js` 圖片網域白名單**：動物照片來自政府網域，`next/image` 預設會擋外部網域，需設定 `images.remotePatterns`，否則圖片直接載不出來。
3. **API 回傳資料的 runtime 驗證**：官方文件自己承認欄位可能缺值、型別不穩定，TypeScript 型別只在編譯期有用。建議在代理層用 zod 做 schema 驗證，擋掉髒資料再回傳給前端。

### 🟡 P1 — 中等重要，可先寫下來刻意跳過，但要在合適時機補
4. Loading / skeleton 狀態（列表頁快取未命中、翻頁時的等待感）
5. SEO 基本 metadata（動物詳情頁很適合加 title + OG image，對認養網站有實際幫助）
6. 無障礙基本檢查：圖片 alt text（用品種/花色當替代文字）、篩選表單可鍵盤操作
7. 錯誤監控（先 `console.error` 即可，之後有需要再接 Sentry）

### ⚪ 刻意不做（MVP 個人專案不需要）
i18n、帳號系統、自動化測試框架、CI/CD pipeline

---

## 待辦事項（建議開發順序）

- [ ] `create-next-app`（TypeScript + Tailwind + App Router）
- [ ] `next.config.js` 設定動物照片網域的 `images.remotePatterns`
- [ ] shadcn/ui init，設定色彩 tokens
- [ ] 定義 TypeScript 型別 + zod schema，驗證 API 回傳資料
- [ ] 建立 `app/api/animals/route.ts` 代理層 + 快取
- [ ] 首頁列表 + 篩選功能（篩選狀態同步到 URL query params）
- [ ] Loading / empty / error 狀態（skeleton UI）
- [ ] 動物詳情頁 + SEO metadata（title、OG image）
- [ ] 無障礙基本檢查（alt text、篩選表單鍵盤操作）
- [ ] GSAP 進場動效
- [ ] 收藏功能（localStorage）
- [ ] 收容所地圖頁（加分項）
- [ ] （可選）錯誤監控接 Sentry
