import AllAds from "@/components/DashboardUI/Seller/AllAds";
import CreateAds from "@/components/DashboardUI/Seller/CreateAds";

const Page = () => {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            My Ads
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage your rental ads.
          </p>
        </div>
        <CreateAds />
      </div>

      <AllAds />
    </section>
  );
};

export default Page;
