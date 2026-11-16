interface Props {
  id: string;
  title: string;
  lead?: string;
}

export function SectionHead({ id, title, lead }: Props) {
  return (
    <header className="section-head">
      <h2 id={id} className="section-head__title">{title}</h2>
      <span className="section-head__bar" aria-hidden="true" />
      {lead && <p className="section-head__lead">{lead}</p>}
    </header>
  );
}