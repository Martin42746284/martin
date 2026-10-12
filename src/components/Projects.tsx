import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { useInView } from '../hooks/useInView';
import { useI18n } from '../lib/i18n';
import { assetUrl } from '../lib/supabase';
import type { Project, ProjectCategory } from '../lib/types';
import { ApiIcon, CloseIcon, ExternalIcon, GithubIcon, MobileIcon, WebIcon } from './icons';
import { SectionHead } from './SectionHead';

const CATEGORY_ICON: Record<ProjectCategory, typeof WebIcon> = {
  Web: WebIcon,
  Mobile: MobileIcon,
  API: ApiIcon,
};

/** Nombre de technologies affichées sur une carte (le reste est résumé par « +N »). */
const MAX_TAGS = 3;

type Filter = 'Tous' | ProjectCategory;

/** Halo lumineux qui suit le curseur sur la carte. */
function spotlight(event: PointerEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`);
  event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`);
}

/** Capture d'écran du projet, ou visuel généré (arches + icône) tant qu'il n'y en a pas. */
function Cover({ project, large = false }: { project: Project; large?: boolean }) {
  const { t } = useI18n();
  const [failed, setFailed] = useState(false);
  const image = failed ? undefined : assetUrl(project.image_path);
  const Icon = CATEGORY_ICON[project.category];

  return (
    <div className={`cover${large ? ' cover--large' : ''}`} data-kind={project.category}>
      {image ? (
        <img src={image} alt={t('projects.screenshot', { title: project.title })} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <>
          <span className="cover__arches" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <Icon className="cover__glyph" />
          <span className="cover__kind">{t(`projects.kind.${project.category}`)}</span>
        </>
      )}
    </div>
  );
}

function ProjectCard({ project, index, onOpen }: { project: Project; index: number; onOpen: () => void }) {
  const { t } = useI18n();
  const [ref, shown] = useInView<HTMLLIElement>(0.12);
  const extra = project.stack.length - MAX_TAGS;

  return (
    <li
      ref={ref}
      className="pcard reveal reveal--scale"
      data-shown={shown}
      style={{ ['--d' as string]: `${(index % 3) * 110}ms` } as CSSProperties}
    >
      <article className="pcard__inner" onPointerMove={spotlight}>
        <div className="pcard__cover">
          <Cover project={project} />
          {project.featured && <span className="pcard__badge">{t('projects.featured')}</span>}
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
            <button type="button" className="link-btn" onClick={onOpen} aria-label={`${t('projects.show')} – ${project.title}`}>
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

/** Fenêtre de détails : <dialog> natif, donc fermeture avec Échap et focus géré par le navigateur. */
function ProjectDialog({ project, onClose }: { project: Project; onClose: () => void }) {
  const { t } = useI18n();
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = `project-title-${project.slug}`;

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.documentElement.classList.add('is-locked');
    return () => document.documentElement.classList.remove('is-locked');
  }, []);

  const close = () => ref.current?.close();

  return (
    <dialog
      ref={ref}
      className="pdialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && close()}
    >
      <div className="pdialog__panel">
        <button type="button" className="icon-btn pdialog__close" onClick={close} aria-label={t('projects.closed')}>
          <CloseIcon />
        </button>
        <Cover project={project} large />

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

export function Projects({ projects }: { projects: Project[] }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Filter>('Tous');
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  const categories = useMemo(
    () => ['Tous', ...new Set(projects.map((project) => project.category))] as Filter[],
    [projects],
  );
  const visible = projects.filter((project) => filter === 'Tous' || project.category === filter);
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

        <ul className="pgrid">
          {visible.length === 0 && <li className="pgrid__empty">{t('projects.empty')}</li>}
          {visible.map((project, index) => (
            <ProjectCard key={project.slug} project={project} index={index} onOpen={() => setOpenSlug(project.slug)} />
          ))}
        </ul>

        {current && <ProjectDialog key={current.slug} project={current} onClose={() => setOpenSlug(null)} />}
      </div>
    </section>
  );
}