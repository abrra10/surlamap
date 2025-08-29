"use client";

import HomePage from "./home/HomePage";
import SimpleNavigation from "./components/SimpleNavigation";
import SimpleFooter from "./components/SimpleFooter";

export default function Page() {
  return (
    <>
      <SimpleNavigation />
      <main className="flex-1 flex flex-col">
        <HomePage />
      </main>
      <SimpleFooter />
    </>
  );
}
