import { useMemo, type CSSProperties } from 'react';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../lib/i18n';
import type { Skill } from '../lib/types';
import { SectionHead } from './SectionHead';

function SkillGroup({ category, items, index }: { category: string; items: Skill[]; index: number }) {
  const [ref, shown] = useInView<HTMLElement>(0.2);
  return (
    <section
      className="skill-group"
      ref={ref}
      data-shown={shown}
      aria-label={category}
      style={{ ['--g']: index } as CSSProperties}
    >
      <h3 className="skill-group__title">{category}</h3>
      <ul className="skill-group__list">
        {items.map((skill, i) => (
          <li key={skill.name} className={skill.is_core ? 'is-core' : undefined} style={{ ['--i' as string]: i } as CSSProperties}>
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
          {groups.map(([category, items], index) => (
            <SkillGroup key={category} category={category} items={items} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
