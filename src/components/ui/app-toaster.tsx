"use client";

import { Toaster } from "react-hot-toast";

const AppToaster = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "10px",
          background: "#fff",
          color: "#101217",
          border: "1px solid #e5e7eb",
        },
        success: {
          iconTheme: {
            primary: "#274a78",
            secondary: "#fff",
          },
        },
      }}
    />
  );
};

export default AppToaster;
