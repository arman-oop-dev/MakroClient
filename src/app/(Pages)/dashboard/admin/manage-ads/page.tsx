import ManageAds from "@/components/DashboardUI/Admin/ManageAds";

const Page = () => {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Manage Ads
        </h1>
        <p className="text-sm text-muted-foreground">
          Review pending ads submitted by users.
        </p>
      </div>

      <ManageAds />
    </section>
  );
};

export default Page;
