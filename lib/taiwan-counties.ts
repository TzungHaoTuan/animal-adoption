// Standard 直轄市 → 省轄市 → 縣 ordering used across Taiwan gov sites
// (roughly north-to-south within each tier), not alphabetical/code-point order.
export const COUNTY_ORDER = [
  "臺北市",
  "新北市",
  "桃園市",
  "臺中市",
  "臺南市",
  "高雄市",
  "基隆市",
  "新竹市",
  "嘉義市",
  "新竹縣",
  "苗栗縣",
  "彰化縣",
  "南投縣",
  "雲林縣",
  "嘉義縣",
  "屏東縣",
  "宜蘭縣",
  "花蓮縣",
  "臺東縣",
  "澎湖縣",
  "金門縣",
  "連江縣",
];

export function compareCounty(a: string, b: string) {
  const indexA = COUNTY_ORDER.indexOf(a);
  const indexB = COUNTY_ORDER.indexOf(b);
  if (indexA === -1 || indexB === -1) return a.localeCompare(b, "zh-Hant");
  return indexA - indexB;
}
