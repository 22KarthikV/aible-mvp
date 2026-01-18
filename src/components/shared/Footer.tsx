/**
 * Footer Component for Aible
 *
 * Minimal footer with just copyright text.
 * No borders, backgrounds, or decorative elements.
 */

export default function Footer() {
  return (
    <footer className="mt-auto py-4 relative z-10">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-emerald-700/80 font-medium">
          &copy; 2026 Aible &bull; Your AI-Powered Kitchen Assistant
        </p>
      </div>
    </footer>
  );
}