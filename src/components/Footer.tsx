import { Reveal } from './Reveal';

export function Footer({ name }: { name: string }) {
  return (
    <Reveal as="footer" className="footer" role="contentinfo">
      <div className="container footer__inner">
        <p>
          © {new Date().getFullYear()} {name}
        </p>
      </div>
    </Reveal>
  );
}
