import { fetchShelters, type Shelter } from "@/lib/shelters";
import { ShelterMap } from "@/components/shelter-map";
import { SiteHeader } from "@/components/site-header";

export default async function SheltersPage() {
  let shelters: Shelter[] = [];
  let fetchFailed = false;
  try {
    shelters = await fetchShelters();
  } catch {
    fetchFailed = true;
  }

  return (
    <div className="flex h-screen flex-col">
      <SiteHeader />

      <div className="mx-auto flex w-full sm:w-6xl h-[calc(100vh-76px)] flex-col gap-4 px-4 py-8 sm:px-6">
        <p className="text-sm text-muted-foreground">
          全台公立動物收容所地圖，資料每日更新。
        </p>

        {fetchFailed ? (
          <p className="py-16 text-center text-muted-foreground">
            資料讀取失敗，請稍後再試一次。
          </p>
        ) : (
          <ShelterMap shelters={shelters} />
        )}
      </div>
    </div>
  );
}
