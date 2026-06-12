export default function Footer() {
  return (
    <footer
      className="mt-auto py-6 px-5 text-center text-sm"
      style={{
        borderTop: "3px solid",
        borderImage: "linear-gradient(to right, var(--color-waste), var(--color-gold), var(--color-reclaim)) 1",
        color: "var(--color-ink-soft)",
      }}
    >
      <p>
        Built with{" "}
        <span
          className="font-semibold"
          style={{
            fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif",
          }}
        >
          <span style={{ color: "var(--color-ink)" }}>Focus</span>
          <span style={{ color: "var(--color-waste)" }}>Lab</span>
        </span>{" "}
        &middot; {new Date().getFullYear()}
      </p>
    </footer>
  );
}
