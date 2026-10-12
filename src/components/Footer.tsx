export function Footer({ name }: { name: string }) {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>
          © {new Date().getFullYear()} {name}
        </p>
      </div>
    </footer>
  );
}
