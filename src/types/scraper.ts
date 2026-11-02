export interface KeywordData {
  word: string;
  count: number;
  percentage: string;
}

export interface SeoAnalysisResult {
  url: string;
  status: number;
  duration: number;
  contentLength: number;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  canonical: string;
  ogTitle: string;
  ogImage: string;
  twitterCard: string;
  h1: string[];
  h2: string[];
  h3: string[];
  totalWordsCount: number;
  topWords: KeywordData[];
  aiReport: string | null;
}

export interface StaticScrapeResult {
  url: string;
  status: number;
  statusText: string;
  duration: number;
  contentType: string;
  totalLength: number;
  snippetLength: number;
  title: string;
  htmlSnippet: string;
  totalLinks: number;
  totalImages: number;
  totalScripts: number;
  linksSample: { text: string; href: string }[];
  imagesSample: { alt: string; src: string }[];
  selectorResults: string[];
  headers: Record<string, string>;
}

export interface FrameInfo {
  src: string;
  title?: string;
  id?: string;
  className?: string;
  allow?: string;
  sandbox?: string;
  width?: string;
  height?: string;
  type: 'stream' | 'video' | 'embed' | 'ad' | 'general';
}

export interface FrameExtractionResult {
  url: string;
  pageTitle: string;
  totalFrames: number;
  frames: FrameInfo[];
  directVideos: { src: string; type?: string }[];
  scriptStreamUrls: string[];
}

export interface AutomationResult {
  url: string;
  title: string;
  status: number;
  duration: number;
  securityCheck: {
    hasHttps: boolean;
    hasCsp: boolean;
    cspValue: string;
    xFrameOptions: string;
    hsts: boolean;
    contentTypeOptions: string;
    referrerPolicy: string;
  };
  domSummary: {
    totalElements: number;
    formsCount: number;
    inputsCount: number;
    buttonsCount: number;
    imagesCount: number;
    iframesCount: number;
    scriptsCount: number;
    stylesCount: number;
  };
  socialPreview: {
    title: string;
    description: string;
    image: string;
    siteName: string;
    type: string;
  };
}

export interface ScrapeHistoryItem {
  id: string;
  url: string;
  timestamp: number;
  tool: string;
  title?: string;
}
