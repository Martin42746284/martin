export interface Profile {
  id: number;
  full_name: string;
  title: string;
  title_en?: string | null;
  tagline: string;
  tagline_en?: string | null;
  hero_words: string[];
  hero_words_en?: string[] | null;
  bio: string;
  bio_en?: string | null;
  location: string | null;
  languages: string | null;
  languages_en?: string | null;
  education: string | null;
  education_en?: string | null;
  email: string | null;
  phone: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  photo_path: string | null;
  cv_path: string | null;
  cv_path_en?: string | null;
  available: boolean;
}

export interface Skill {
  category: string;
  category_en?: string | null;
  name: string;
  is_core: boolean;
  sort_order: number;
}

export type ProjectCategory = 'Web' | 'Mobile' | 'API';

export interface Project {
  slug: string;
  title: string;
  subtitle: string | null;
  subtitle_en?: string | null;
  category: ProjectCategory;
  summary: string;
  summary_en?: string | null;
  highlights: string[];
  highlights_en?: string[] | null;
  stack: string[];
  github_url: string | null;
  live_url: string | null;
  image_path: string | null;
  year: number | null;
  featured: boolean;
  sort_order: number;
}

export type ServiceIcon = 'web' | 'mobile' | 'api' | 'business' | 'ai' | 'speed';

export interface Service {
  icon: ServiceIcon;
  title: string;
  title_en?: string | null;
  description: string;
  description_en?: string | null;
  tags: string[];
  tags_en?: string[] | null;
  sort_order: number;
}

export interface Stat {
  value: number;
  suffix: string;
  label: string;
  label_en?: string | null;
  sort_order: number;
}

export interface PortfolioData {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  services: Service[];
  stats: Stat[];
}

export interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}
