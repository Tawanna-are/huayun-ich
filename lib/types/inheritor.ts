export type RepresentativeWork = {
  title: string;
  englishTitle: string;
  summary: string;
  image: string;
  href: string;
  categoryName: string;
  region: string;
};

export type InheritorInterviewVideo = {
  url: string;
  poster: string;
  title: string;
};

export type InheritorProfile = {
  id: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  region: string;
  province: string;
  city: string;
  heritageName: string;
  heritageEnglishName: string;
  heritageSlug: string;
  heritageCategoryName: string;
  representativeWorks: RepresentativeWork[];
  interviewVideo?: InheritorInterviewVideo;
};
