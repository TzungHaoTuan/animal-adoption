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
**Endpoint**：`https://data.moa.gov.tw/api/v1/AnimalRecognition/`（實測確認，見下方 curl 範例；與早期文件記載的 `Service/OpenData/AnimalOpenData.aspx` 不同）

```
curl -X GET "https://data.moa.gov.tw/api/v1/AnimalRecognition/?%24top=1000&Page=1" -H "accept: application/json"
```

回應包在 `{ "Data": [...] }` 裡。

### 支援參數
- `$top`：取得筆數
- `Page`：頁碼，**1-based，必填**（不是 `$skip` 位移）
- 篩選：每個回傳欄位都可以直接當 query param 傳（如 `animal_kind=狗&animal_sex=F`），**不是**舊文件寫的 `$filter=field+like+value` OData 語法

### 完整欄位（來自官方 API 參數文件）
| 欄位 | 說明 | 備註 |
|---|---|---|
| `animal_id` | 動物流水編號 | 回傳是 number，可當詳情頁 id |
| `animal_subid` | 動物收容編號 | |
| `animal_area_pkid` | 所屬縣市代碼 | 文件寫 string、實測回傳 number；**沒有代碼對照表**，縣市篩選功能延後 |
| `animal_shelter_pkid` | 所屬收容所代碼 | 同上，型別不穩定 |
| `animal_place` | 實際所在地 | |
| `animal_kind` | 貓 / 狗 | |
| `animal_sex` | 性別 | |
| `animal_bodytype` | SMALL / MEDIUM / BIG | |
| `animal_colour` | 花色 | |
| `animal_age` | 年紀，如 `ADULT` | |
| `animal_sterilization` | 絕育狀態：N=未輸入 / F=否 / T=是 | |
| `animal_bacterin` | 是否施打狂犬病疫苗 | |
| `animal_foundplace` | 尋獲地 | 可能是空字串 |
| `animal_title` | 網頁標題 | |
| `animal_status` | 動物狀態，如 `OPEN` | |
| `animal_remark` | 資料備註 | |
| `animal_caption` | 其他說明 | 可能是空字串 |
| `animal_opendate` / `animal_closeddate` | 開放認養起訖 | 日期格式不統一（`2026-07-17` vs 無期限時是 `2999-12-31`） |
| `animal_update` / `animal_createtime` | 異動／建立時間 | 格式也不統一（曾見 `2026/07/10`） |
| `shelter_name` / `shelter_address` / `shelter_tel` | 收容所名稱、地址、電話 | |
| `album_file` | 照片網址 | 已經是完整 `https://www.pet.gov.tw/upload/pic/xxx.png` URL，不用自己拼 |
| `album_update` | 照片更新時間 | 可能是空字串 |
| `cDate` | 資料建立時間 | |

### ⚠️ 資料特性（會直接影響設計）
- **資料是動態的**：動物一旦被領養，該筆資料會直接從清單消失，**沒有「已認養」狀態欄位**，也**沒有領養日期欄位**。
- 因此網站不適合做「歷史紀錄」或「已成功送養」頁面，因為資料源本身不保留這類資訊。
- 資料**每日更新**。
- 實測 API 是 `https` 且回應帶 `access-control-allow-origin: *`，技術上前端可以直接呼叫，**但仍照 CLAUDE.md 決策走後端代理層**（理由是快取控制、篩選邏輯不外露、未來換資料庫好升級，不是技術上被逼的）。
- **非會員分頁上限（實測確認）**：`Page=2`（不論 `$top` 多大）一律回 `{"RS":"ERROR","MSG":"非會員只限回傳第一頁資料"}`；`$top` 單次最多 1000，且 `$top=1000` 時 `Next` 仍是 `true`，代表全國實際筆數超過 1000。結論：非會員能拿到的資料上限固定是「`$top=1000&Page=1`」這 1000 筆，`Page` 分頁機制對匿名存取無用。架構決策見下方第四節。

---

## 二、頁面與內容規劃

### 首頁（列表頁）
- 卡片網格：照片、種類、花色、體型、所在收容所、大概地區
- 篩選列：貓/狗、體型、性別、絕育狀態、縣市
- **無限捲動**（IntersectionObserver 偵測底部 sentinel，滾到底再抓下一批；不做「載入更多」按鈕，也不做 windowing/virtualization——理由與實作方式見第四節）
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

### 為什麼還是走代理層（即使實測 API 是 https 且 CORS 開放）

實測 `https://data.moa.gov.tw/api/v1/AnimalRecognition/` 回應帶 `access-control-allow-origin: *`，技術上瀏覽器可以直接呼叫，不會被 CORS 或 mixed content 擋下。但仍然決定走 `app/api/animals` 代理層，理由：

1. **快取控制**：資料每日更新，代理層用 `next: { revalidate: 3600 }` 集中快取，避免每個使用者的每次篩選都直接打政府伺服器。
2. **避免細節外露**：直接 client-side 呼叫的話，篩選邏輯與參數組合會完全暴露在瀏覽器 devtools 中。
3. **未來好升級**：之後若要換成自己的資料庫（見下方），Route Handler 的抓取邏輯可以直接搬過去，前端完全不用改。

### Route Handler 實作

```typescript
// app/api/animals/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { fetchAnimals } from '@/lib/animals';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const kind = searchParams.get('kind'); // 貓 or 狗
  const bodytype = searchParams.get('bodytype');
  const sex = searchParams.get('sex');
  const sterilization = searchParams.get('sterilization');
  const top = searchParams.get('top') ?? '20';
  const page = searchParams.get('page') ?? '1';

  const apiUrl = new URL('https://data.moa.gov.tw/api/v1/AnimalRecognition/');
  apiUrl.searchParams.set('$top', top);
  apiUrl.searchParams.set('Page', page);
  if (kind) apiUrl.searchParams.set('animal_kind', kind);
  if (bodytype) apiUrl.searchParams.set('animal_bodytype', bodytype);
  if (sex) apiUrl.searchParams.set('animal_sex', sex);
  if (sterilization) apiUrl.searchParams.set('animal_sterilization', sterilization);

  const res = await fetch(apiUrl.toString(), {
    next: { revalidate: 3600 }, // 快取 1 小時
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 502 });
  }

  const animals = parseAnimalList(await res.json()); // zod safeParse，過濾髒資料
  return NextResponse.json({ data: animals });
}
```

前端只需要打自己的 `/api/animals?kind=貓`，不需碰原始政府 API 網址與語法。**分頁用 `page`（1-based），不是 `skip`** — 因為上游本身就是 `Page` 參數，沒必要多包一層轉換。

### 快取（`revalidate`）的用意

- 資料本身「每日更新」，快取 1 小時完全不影響資料新鮮度
- 減少對政府伺服器的請求量
- 使用者體感速度變快（大部分請求吃 Next.js 自己的快取）

### 需要注意的坑

1. ~~篩選參數組合過多會降低快取命中率~~ → **已定案（見下方「無限捲動與分頁架構」）**：不再是「可考慮」，而是實測發現非會員 `Page` 分頁根本不可用後的必要設計——固定 `$top=1000&Page=1` 抓一次並快取，篩選/分頁邏輯全部在程式碼裡對這份陣列處理。
2. ~~`page`/`top` 分頁與快取搭配~~ → 不適用了。改用 `offset`/`limit` 對本地陣列做 slice，不再對外部 API 分頁。
3. **未來可平滑升級為資料庫架構**：若之後想加排程（如 Vercel Cron）把資料存進自己的資料庫，
   Route Handler 的抓取邏輯可以直接搬過去，不用重寫。
4. **錯誤處理不能省**：政府開放資料平台穩定性有限，Route Handler 需要 try/catch + timeout，
   前端也要有合理的 loading / error 狀態。

### 無限捲動與分頁架構（實測 Page 限制後定案）

實測發現非會員 `Page=2` 一律被拒（`{"RS":"ERROR","MSG":"非會員只限回傳第一頁資料"}`），`$top` 上限 1000，且 `$top=1000` 時 `Next` 仍為 `true`（全國筆數 > 1000）。這代表：
- 不管怎麼組參數，非會員能碰到的資料上限就是「`$top=1000&Page=1`」這 1000 筆，`Page` 分頁對我們無用。
- 這 1000 筆**不是全部資料**，冷門的種類/縣市篩選結果可能樣本很少甚至掛零，不等於「全國目前真實可認養數量」。之後若有會員 API key 解除上限，這是最值得升級的點。

架構決定：
1. **`lib/animals.ts`**：`fetchAllAnimalsRaw()` 不帶任何篩選、`$top=1000&Page=1`，吃 `revalidate:3600` 快取——不管使用者切換什麼篩選條件，upstream 只會打這一種 URL，快取命中率遠高於「每種篩選組合各自一條快取」的舊設計。`fetchAnimals(filters, { offset, limit })` 在這份陣列上做 `.filter()` + `.slice()`，回傳 `{ items, hasMore }`。
2. **`app/api/animals/route.ts`**：參數從 `top`/`page` 改成 `offset`/`limit`，內部呼叫 `fetchAnimals` 做本地分頁，回傳 `{ data, hasMore }`。
3. **首頁**：SSR 先抓固定筆數（對齊 `xl:grid-cols-4` 抓 3 排 = 12 筆左右）當首批，不做「依 viewport 動態決定首批筆數」——SSR 階段拿不到 client 尺寸，做了只是徒增複雜度。
4. **`AnimalGrid`（新增 client component）**：接手首批資料 + `hasMore`，用 `IntersectionObserver` 偵測底部 sentinel，滾到底時打 `/api/animals?...&offset=...&limit=...` 抓下一批、append 進畫面。篩選條件變更時（`FilterBar` 用 `router.push` 換 URL）靠 `key={JSON.stringify(filters)}` 強制整個元件重新掛載、重置捲動狀態。
5. **不做 windowing/virtualization**（如 react-window）：清單是篩選後的子集，DOM 負擔到不了需要 virtualization 的量級，`next/image` 本身也只 lazy-load 可視範圍外的圖片。

明確捨棄「載入更多」按鈕方案——使用者已表態要 infinite scroll。

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
