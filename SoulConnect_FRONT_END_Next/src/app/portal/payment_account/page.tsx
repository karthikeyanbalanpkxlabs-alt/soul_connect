"use client";

import React, { Suspense } from "react";
import ListPage from "./ListPage";

export default function PaymentAccountPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-600 border-t-transparent"></div>
        </div>
      }
    >
      <ListPage />
    </Suspense>
  );
}
