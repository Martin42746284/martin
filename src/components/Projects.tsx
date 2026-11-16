import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import { assetUrl } from '../lib/supabase';
import type { Project, ProjectCategory } from '../lib/types';
import { ApiIcon, CloseIcon, ExternalIcon, GithubIcon, MobileIcon, WebIcon } from './icons';
import { SectionHead } from './SectionHead';

const MAX_TAGS = 3;
const MAX_VISIBLE_PROJECTS = 6;

type Filter = 'Tous' | ProjectCategory;

function Cover({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  const image = failed ? undefined : assetUrl(project.image_path);
  const Icon = CATEGORY_ICON[project.category];

  return (
    <div className="cover" data-kind={project.category}>
      {image ? (
        <img src={image} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <>
          <Icon className="cover__glyph" />
          <span className="cover__kind">{project.category}</span>
        </>
      )}
    </div>
  );
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const { t } = useI18n();
  const extra = project.stack.length - MAX_TAGS;

  return (
    <li className="pcard">
      <article className="pcard__inner">
        <div className="pcard__cover">
          <Cover project={project} />
        </div>

        <div className="pcard__body">
          <div className="pcard__head">
            <h3 className="pcard__title">{project.title}</h3>
            {project.year && <span className="pcard__year">{project.year}</span>}
          </div>
          {project.subtitle && <p className="pcard__subtitle">{project.subtitle}</p>}
          <p className="pcard__summary">{project.summary}</p>

          <ul className="pcard__tags" aria-label={t('projects.tech')}>
            {project.stack.slice(0, MAX_TAGS).map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
            {extra > 0 && <li aria-label={`+${extra}`}>+{extra}</li>}
          </ul>

          <div className="pcard__actions">
            <button type="button" className="link-btn" onClick={onOpen} aria-label={`${t('projects.show')} - ${project.title}`}>
              {t('projects.show')}
            </button>
            {project.github_url && (
              <a className="link-btn" href={project.github_url} target="_blank" rel="noopener noreferrer">
                <GithubIcon /> {t('projects.source')}
                <span className="sr-only">{t('projects.newTab', { title: project.title })}</span>
              </a>
            )}
          </div>
        </div>
      </article>
    </li>
  );
}

function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const { t } = useI18n();
  const titleId = `project-title-${project.slug}`;

  return (
    <dialog
      className="pdialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="pdialog__panel">
        <button type="button" className="icon-btn pdialog__close" onClick={onClose} aria-label={t('projects.closed')}>
          <CloseIcon />
        </button>
        <Cover project={project} />

        <div className="pdialog__body">
          <div className="pcard__head">
            <h3 className="pdialog__title" id={titleId}>
              {project.title}
            </h3>
            {project.year && <span className="pcard__year">{project.year}</span>}
          </div>
          {project.subtitle && <p className="pcard__subtitle">{project.subtitle}</p>}
          <p className="pdialog__summary">{project.summary}</p>

          {project.highlights.length > 0 && (
            <ul className="pdialog__highlights">
              {project.highlights.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}

          <ul className="pcard__tags pcard__tags--all" aria-label={t('projects.tech')}>
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>

          <div className="pdialog__actions">
            {project.github_url && (
              <a className="btn btn--primary" href={project.github_url} target="_blank" rel="noopener noreferrer">
                <GithubIcon /> {t('projects.source')}
                <span className="sr-only">{t('projects.newTab', { title: project.title })}</span>
              </a>
            )}
            {project.live_url && (
              <a className="btn btn--ghost" href={project.live_url} target="_blank" rel="noopener noreferrer">
                <ExternalIcon /> {t('projects.site')}
                <span className="sr-only">{t('projects.newTab', { title: project.title })}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}

const CATEGORY_ICON: Record<ProjectCategory, typeof WebIcon> = {
  Web: WebIcon,
  Mobile: MobileIcon,
  API: ApiIcon,
};

export function Projects({ projects }: { projects: Project[] }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('Tous');
  const [showAll, setShowAll] = useState(false);
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const categories = ['Tous', ...new Set(projects.map((project) => project.category))] as Filter[];
  const filtered = projects.filter((project) => filter === 'Tous' || project.category === filter);
  const visible = showAll ? filtered : filtered.slice(0, MAX_VISIBLE_PROJECTS);
  const current = projects.find((project) => project.slug === openSlug);

  return (
    <section className="section" aria-labelledby="projets">
      <div className="container">
        <SectionHead id="projets" title={t('projects.title')} lead={t('projects.lead', { n: projects.length })} />

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

        <p className="sr-only" role="status">
          {t('projects.count', { n: visible.length })}
        </p>

        <ul className="pgrid">
          {visible.length === 0 && (
            <li className="pgrid__empty">
              {t('projects.empty')}
            </li>
          )}
          {visible.map((project) => (
            <ProjectCard key={project.slug} project={project} onOpen={() => setOpenSlug(project.slug)} />
          ))}
        </ul>

        {!showAll && filtered.length > MAX_VISIBLE_PROJECTS && (
          <div className="projects__more">
            <button type="button" className="btn btn--primary" onClick={() => setShowAll(true)}>
              {t('projects.showAll')}
            </button>
          </div>
        )}

        {current && <ProjectDialog key={current.slug} project={current} onClose={() => setOpenSlug(null)} />}
      </div>
    </section>
  );
}