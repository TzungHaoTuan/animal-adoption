@AGENTS.md

## 常用指令
- 開發：`npm run dev`
- Build / Lint / Typecheck：依 package.json scripts 為準

## 資料源限制（重要，影響架構決策，不要重新繞回去討論）
- Endpoint：`https://data.moa.gov.tw/api/v1/AnimalRecognition/`，實測是 `https` 且回應帶 `access-control-allow-origin: *`（跟原本假設的「http + 無 CORS」不同，實測沒有 mixed-content / CORS 硬性阻擋）。**仍然一律走 `app/api/animals` 代理層**，前端不可直接呼叫外部 API —— 理由改為快取控制、篩選邏輯不外露、未來換資料庫時好升級，而非技術上被逼的
- 分頁是 `Page`（1-based，必填，非 `$skip`），`$top` 控制筆數；篩選是直接傳欄位當 query param（如 `animal_kind=狗`），**不是** `$filter=field+like+value` 的 OData 語法
- **未登入（非會員）狀態下 `Page` 鎖死在 1**：實測 `Page=2` 直接回 `{"RS":"ERROR","MSG":"非會員只限回傳第一頁資料"}`（即使 `$top` 給很大也一樣）。`$top` 單次最多 1000，且 `$top=1000` 時回應 `Next` 仍是 `true` → 全國實際筆數 > 1000，但非會員能拿到的資料上限就是這 1000 筆，翻頁機制對我們沒用。**因此代理層改成：不帶篩選、`$top=1000&Page=1` 抓一次（吃 `revalidate:3600` 快取），篩選與分頁/無限捲動的位移全部在程式碼裡對這個陣列做，不再讓每種篩選組合各自打一次外部 API。** 之後若拿到會員 API key 能解除 Page 限制，才需要重新設計成真正的增量分頁。
- API 回傳欄位可能缺值、型別不穩定（例如 `animal_area_pkid`／`animal_shelter_pkid` 文件寫 string、實際回傳是 number）→ 代理層需用 zod 做 runtime 驗證，逐筆 `safeParse` 過濾髒資料，不能整批 parse 壞了就整包丟掉，也不能只信 TypeScript 型別
- 資料沒有「已認養」欄位、沒有日期欄位，動物被領養後直接從清單消失 → 不做歷史/已送養頁面
- 資料每日更新，代理層快取 `revalidate: 3600` 是刻意設計，不要縮短
- `animal_area_pkid`（縣市篩選用的代碼）目前沒有代碼對照表，縣市篩選功能先跳過，等拿到對照表或能實測到足夠資料再補

## 收容所地圖資料源（/shelters）
- Endpoint：`https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=2thVboChxuKs`，回傳 bare array（不是 `{Data:[...]}` 包裝），共 33 筆，欄位：`ID`/`ShelterName`/`CityName`/`Address`/`Phone`/`OpenTime`/`Url`（永遠是空字串，無照片）/`Lat`/`Lon`/`Seq`。
- **已內建經緯度**，不需要 geocode（不用 Nominatim、不用 Google Geocoding API），地圖圖磚與互動直接用 Leaflet + react-leaflet + OpenStreetMap 圖磚，不需要任何地圖 API key。
- 這份收容所名冊的 `ShelterName` 跟 `AnimalRecognition` API 的 `shelter_name` **對不上**（實測例：`彰化縣流浪狗中途之家臨時收容所` vs `彰化縣流浪狗中途之家`；`南投縣公立動物收容所` vs `公立南投動物收容所` 詞序不同）→ 兩份資料**不做關聯**，地圖頁不顯示動物數量、不連結動物清單、不比對動物照片。
- 資料筆數固定 33 筆、無分頁疑慮，SSR 一次抓（`revalidate:3600`，比照動物資料）、交給 client 端在記憶體裡依 `CityName` 篩選即可，不需要 `/api/shelters` route。

## 篩選狀態
- 篩選條件（種類/體型/性別/絕育，縣市待補）存在 URL query params，不要只放 React state，需支援分享連結與瀏覽器上一頁

## 列表顯示策略
- 用 infinite scroll（IntersectionObserver 偵測底部 sentinel，滾到底再抓下一批），不做「載入更多」按鈕
- 不做 windowing/virtualization（如 react-window）：清單上限是本地那 1000 筆快取資料經篩選後的結果，DOM 負擔不到需要 virtualization 的量級，`next/image` 本身也只 lazy-load 可視範圍外的圖片
- 首批筆數用固定猜測值（對齊 `xl:grid-cols-4` 抓 3 排），不做「依實際 viewport 尺寸動態決定首批筆數」— SSR 階段拿不到 client 尺寸，做了也只是徒增複雜度

## 圖片
- 動物照片來自政府網域，`next.config.js` 的 `images.remotePatterns` 必須白名單該網域，否則 `next/image` 會擋圖

## Design System
- 設計相關（配色/字體/元件樣式規範）見 [DESIGN.md](DESIGN.md)，**修改任何設計前先讀它**

## 詳細規劃
完整規劃、待辦事項與優先順序見 [PROJECT_PLAN.md](PROJECT_PLAN.md)
