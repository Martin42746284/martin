import { useMemo, useState } from 'react';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../lib/i18n';
import { assetUrl } from '../lib/supabase';
import type { Project, ProjectCategory } from '../lib/types';
import { ApiIcon, ChevronIcon, ExternalIcon, GithubIcon, MobileIcon, WebIcon } from './icons';
import { SectionHead } from './SectionHead';

const CATEGORY_ICON: Record<ProjectCategory, typeof WebIcon> = {
  Web: WebIcon,
  Mobile: MobileIcon,
  API: ApiIcon,
};

type Filter = 'Tous' | ProjectCategory;

function ProjectRow({ project, open, onToggle }: { project: Project; open: boolean; onToggle: () => void }) {
  const { t } = useI18n();
  const [imageFailed, setImageFailed] = useState(false);
  const image = imageFailed ? undefined : assetUrl(project.image_path);
  const Icon = CATEGORY_ICON[project.category];
  const detailsId = `details-${project.slug}`;
  const [ref, shown] = useInView<HTMLLIElement>(0.12);

  return (
    <li className="project reveal reveal--up" data-open={open} data-kind={project.category} data-shown={shown} ref={ref}>
      <div className="project__tile">
        {image ? (
          <img
            src={image}
            alt={t('projects.screenshot', { title: project.title })}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <>
            <span className="cover__arches" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <Icon className="project__glyph" />
            <span className="project__kind">{t(`projects.kind.${project.category}`)}</span>
          </>
        )}
      </div>

      <div className="project__main">
        <div className="project__head">
          <h3 className="project__title">{project.title}</h3>
          {project.year && <span className="project__year">{project.year}</span>}
        </div>
        {project.subtitle && <p className="project__subtitle">{project.subtitle}</p>}
        <p className="project__summary">{project.summary}</p>

        <ul className="stack" aria-label={t('projects.tech')}>
          {project.stack.map((tech) => (
            <li key={tech}>{tech}</li>
          ))}
        </ul>

        <div className="project__details" id={detailsId} data-open={open}>
          <div className="project__details-inner">
            <ul className="project__highlights">
              {project.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="project__actions">
          <button
            type="button"
            className="link-btn"
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={onToggle}
          >
            {open ? t('projects.hide') : t('projects.show')}
            <ChevronIcon className="link-btn__chevron" />
          </button>
          {project.github_url && (
            <a className="link-btn" href={project.github_url} target="_blank" rel="noopener noreferrer">
              <GithubIcon /> {t('projects.source')}
              <span className="sr-only">{t('projects.newTab', { title: project.title })}</span>
            </a>
          )}
          {project.live_url && (
            <a className="link-btn" href={project.live_url} target="_blank" rel="noopener noreferrer">
              <ExternalIcon /> {t('projects.site')}
              <span className="sr-only">{t('projects.newTab', { title: project.title })}</span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}

export function Projects({ projects }: { projects: Project[] }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('Tous');
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const categories = useMemo(
    () => ['Tous', ...new Set(projects.map((project) => project.category))] as Filter[],
    [projects],
  );
  const visible = projects.filter((project) => filter === 'Tous' || project.category === filter);

  return (
    <section className="section" aria-labelledby="projets">
      <div className="container">
        <SectionHead
          id="projets"
          title={t('projects.title')}
          lead={t('projects.lead', { n: projects.length })}
        />

        <div className="filters" role="group" aria-label={t('projects.filter')}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className="filter"
              aria-pressed={filter === category}
              onClick={() => setFilter(category)}
            >
              {category === 'Tous' ? t('projects.all') : category}
            </button>
          ))}
        </div>

        <ul className="projects">
          {visible.length === 0 && <li className="projects__empty">{t('projects.empty')}</li>}
          {visible.map((project) => (
            <ProjectRow
              key={project.slug}
              project={project}
              open={toggled[project.slug] ?? project.featured}
              onToggle={() =>
                setToggled((current) => ({ ...current, [project.slug]: !(current[project.slug] ?? project.featured) }))
              }
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
