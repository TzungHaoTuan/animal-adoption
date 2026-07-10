@AGENTS.md

## 常用指令
- 開發：`npm run dev`
- Build / Lint / Typecheck：依 package.json scripts 為準

## 資料源限制（重要，影響架構決策，不要重新繞回去討論）
- Endpoint：`https://data.moa.gov.tw/api/v1/AnimalRecognition/`，實測是 `https` 且回應帶 `access-control-allow-origin: *`（跟原本假設的「http + 無 CORS」不同，實測沒有 mixed-content / CORS 硬性阻擋）。**仍然一律走 `app/api/animals` 代理層**，前端不可直接呼叫外部 API —— 理由改為快取控制、篩選邏輯不外露、未來換資料庫時好升級，而非技術上被逼的
- 分頁是 `Page`（1-based，必填，非 `$skip`），`$top` 控制筆數；篩選是直接傳欄位當 query param（如 `animal_kind=狗`），**不是** `$filter=field+like+value` 的 OData 語法
- API 回傳欄位可能缺值、型別不穩定（例如 `animal_area_pkid`／`animal_shelter_pkid` 文件寫 string、實際回傳是 number）→ 代理層需用 zod 做 runtime 驗證，逐筆 `safeParse` 過濾髒資料，不能整批 parse 壞了就整包丟掉，也不能只信 TypeScript 型別
- 資料沒有「已認養」欄位、沒有日期欄位，動物被領養後直接從清單消失 → 不做歷史/已送養頁面
- 資料每日更新，代理層快取 `revalidate: 3600` 是刻意設計，不要縮短
- `animal_area_pkid`（縣市篩選用的代碼）目前沒有代碼對照表，縣市篩選功能先跳過，等拿到對照表或能實測到足夠資料再補

## 篩選狀態
- 篩選條件（種類/體型/性別/絕育，縣市待補）存在 URL query params，不要只放 React state，需支援分享連結與瀏覽器上一頁

## 圖片
- 動物照片來自政府網域，`next.config.js` 的 `images.remotePatterns` 必須白名單該網域，否則 `next/image` 會擋圖

## Design System
- 用 shadcn/ui，不用 Claude Design（team-collaboration 開銷對個人 side project 不划算，見 PROJECT_PLAN.md 第三節）

## 詳細規劃
完整規劃、待辦事項與優先順序見 [PROJECT_PLAN.md](PROJECT_PLAN.md)
