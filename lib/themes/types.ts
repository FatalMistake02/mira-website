export interface Theme {
  id: string;
  name: string;
  description: string | null;
  author_name: string;
  user_id: string | null;
  preview_image_url: string | null;
  css_content: string;
  download_count: number;
  version: string;
  status?: string;
  created_at: string;
  updated_at: string;
  profiles?: Profile;
  theme_tags?: { tags: Tag }[];
}

export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface ThemeVersion {
  id: string;
  theme_id: string;
  version: string;
  css_content: string;
  created_at: string;
}

export interface ThemeInput {
  name: string;
  description?: string;
  author_name: string;
  css_content: string;
  preview_image_url?: string;
  tags?: string[];
}

export interface ProfileInput {
  username?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
}
