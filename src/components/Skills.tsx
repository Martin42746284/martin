import { useMemo } from 'react';
import { useI18n } from '../lib/i18n';
import type { Skill } from '../lib/types';
import { SectionHead } from './SectionHead';

function SkillGroup({ category, items }: { category: string; items: Skill[] }) {
  return (
    <section className="skill-group" aria-label={category}>
      <h3 className="skill-group__title">{category}</h3>
      <ul className="skill-group__list">
        {items.map((skill) => (
          <li key={skill.name} className={skill.is_core ? 'is-core' : undefined}>
            {skill.name}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Skills({ skills }: { skills: Skill[] }) {
  const { t } = useI18n();
  const groups = useMemo(() => {
    const map = new Map<string, Skill[]>();
    [...skills]
      .sort((a, b) => a.sort_order - b.sort_order)
      .forEach((skill) => map.set(skill.category, [...(map.get(skill.category) ?? []), skill]));
    return [...map.entries()];
  }, [skills]);

  if (groups.length === 0) return null;

  return (
    <section className="section" aria-labelledby="competences">
      <div className="container">
        <SectionHead
          id="competences"
          title={t('skills.title')}
          lead={t('skills.lead')}
        />
        <div className="skills">
          {groups.map(([category, items]) => (
            <SkillGroup key={category} category={category} items={items} />
          ))}
        </div>
      </div>
    </section>
  );
}