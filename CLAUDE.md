@AGENTS.md

## 常用指令
- 開發：`npm run dev`
- Build / Lint / Typecheck：依 package.json scripts 為準

## 資料源限制（重要，影響架構決策，不要重新繞回去討論）
- 農業部動物認領養 API 是 `http`、無明確 CORS 政策 → 一律走 `app/api/animals` 代理層，前端不可直接呼叫外部 API
- API 回傳欄位可能缺值、型別不穩定 → 代理層需用 zod 做 runtime 驗證，不能只信 TypeScript 型別
- 資料沒有「已認養」欄位、沒有日期欄位，動物被領養後直接從清單消失 → 不做歷史/已送養頁面
- 資料每日更新，代理層快取 `revalidate: 3600` 是刻意設計，不要縮短

## 篩選狀態
- 篩選條件（種類/體型/性別/絕育/縣市）存在 URL query params，不要只放 React state，需支援分享連結與瀏覽器上一頁

## 圖片
- 動物照片來自政府網域，`next.config.js` 的 `images.remotePatterns` 必須白名單該網域，否則 `next/image` 會擋圖

## Design System
- 用 shadcn/ui，不用 Claude Design（team-collaboration 開銷對個人 side project 不划算，見 PROJECT_PLAN.md 第三節）

## 詳細規劃
完整規劃、待辦事項與優先順序見 [PROJECT_PLAN.md](PROJECT_PLAN.md)
