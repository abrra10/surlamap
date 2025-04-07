// app/page.tsx or app/home/page.tsx
import { logout } from "./login/actions"; // Adjust the path as needed

export default function Home() {
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold">Welcome!</h1>

      <form action={logout}>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Logout
        </button>
      </form>
    </main>
  );
}
