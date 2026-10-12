import { useInView } from '../hooks/useInView';

interface Props {
  id: string;
  title: string;
  lead?: string;
}

export function SectionHead({ id, title, lead }: Props) {
  const [ref, shown] = useInView<HTMLElement>(0.4);
  return (
    <header className="section-head" ref={ref} data-shown={shown}>
      <h2 id={id} className="section-head__title">
        <span className="mask">
          <span className="mask__inner">{title}</span>
        </span>
      </h2>
      <span className="section-head__bar" aria-hidden="true" />
      {lead && <p className="section-head__lead">{lead}</p>}
    </header>
  );
}
