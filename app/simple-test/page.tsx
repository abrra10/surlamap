export default function SimpleTestPage() {
  return (
    <div>
      <h1>CSS Test Page</h1>

      {/* Tailwind Test */}
      <div className="bg-red-500 text-white p-8 mb-4">
        <h2 className="text-2xl font-bold">Tailwind Test</h2>
        <p>This should have a red background and white text.</p>
      </div>

      {/* Regular CSS Test */}
      <div className="test-css">
        <h2>Regular CSS Test</h2>
        <p>This should have a green background and white text.</p>
      </div>

      {/* Inline Style Test */}
      <div
        style={{
          backgroundColor: "blue",
          color: "white",
          padding: "20px",
          margin: "20px",
        }}
      >
        <h2>Inline Style Test</h2>
        <p>This should have a blue background and white text.</p>
      </div>
    </div>
  );
}
