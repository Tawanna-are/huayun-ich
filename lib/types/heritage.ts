export type HeritageCategorySlug =
  | "traditional-opera"
  | "traditional-craft"
  | "traditional-technique"
  | "folk-activity"
  | "folk-literature";

export type HeritageCategory = {
  slug: HeritageCategorySlug;
  name: string;
  englishName: string;
  summary: string;
  color: string;
};

export type HeritageTimelineEvent = {
  year: string;
  title: string;
  description: string;
};

export type HeritageGalleryImage = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  description?: string;
};

export type HeritageVideo = {
  title: string;
  url: string;
  poster: string;
};

export type HeritageItem = {
  id: string;
  slug: string;
  name: string;
  englishName: string;
  categorySlug: HeritageCategorySlug;
  categoryName: string;
  categoryEnglishName?: string;
  summary: string;
  region: string;
  province: string;
  city: string;
  inscriptionYear: number;
  featured: boolean;
  image: string;
  homeImageDescription?: string;
  heroImage: string;
  videoPoster: string;
  videoUrl: string;
  videos?: HeritageVideo[];
  history: string[];
  gallery: HeritageGalleryImage[];
  homeGallery?: HeritageGalleryImage[];
  timeline: HeritageTimelineEvent[];
  inheritor: {
    name: string;
    title: string;
    bio: string;
    image: string;
  };
  location: {
    lat: number;
    lng: number;
    mapX: number;
    mapY: number;
  };
  tags: string[];
  relatedSlugs: string[];
};
