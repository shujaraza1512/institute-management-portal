function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-6 text-center">
      <h1 className="text-3xl md:text-4xl font-display text-navy-800">Institute Management Portal</h1>
      <p className="mt-3 text-muted max-w-md">
        The full homepage (hero, features, announcements, footer) is built in Phase 4.
        This placeholder confirms routing and the design tokens are wired up correctly.
      </p>
      <a
        href="/login"
        className="mt-6 px-5 py-2.5 bg-navy-700 text-white rounded-card shadow-card hover:bg-navy-800 transition-colors"
      >
        Login
      </a>
    </div>
  );
}

export default Home;
