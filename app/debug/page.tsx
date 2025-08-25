export default function DebugPage() {
  return (
    <div>
      <h1>Debug Page</h1>
      <p>This page has no Tailwind classes to test if basic CSS works.</p>
      <style jsx>{`
        .test-style {
          background-color: red;
          color: white;
          padding: 20px;
          margin: 20px;
        }
      `}</style>
      <div className="test-style">
        This should have a red background with white text (using styled-jsx).
      </div>
    </div>
  );
}
