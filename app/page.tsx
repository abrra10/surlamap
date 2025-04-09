// app/page.tsx or app/home/page.tsx
"use client";

import { logout } from "./login/actions"; // Adjust the path as needed
import DashboardRedirect from "./dashboard/page"; // Import the DashboardRedirect component

export default function Home() {
  return (
    <main className="p-4 mx-auto">
      <h1>Hello word</h1>
      <p>This is a content to make our page longer</p>
      <div className="w-full h-screen bg-green-300"></div>
      <p>Lorem Ipsum is simply dummy text ...</p>

      {/* DashboardRedirect component handles the role-based redirection */}
      {/* <DashboardRedirect /> */}

      {/* Logout Form */}
      {/* <form action={logout}>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </form> */}
    </main>
  );
}
