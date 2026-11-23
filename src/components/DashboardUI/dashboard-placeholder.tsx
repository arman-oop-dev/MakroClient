"use client";

import CreateAds from "./Seller/CreateAds";

const DashboardPlaceholder = () => {
  return (
    <section className="bg-background px-6 sm:px10">
      <div className="flex justify-end">
        <CreateAds />
      </div>
    </section>
  );
};

export default DashboardPlaceholder;
