import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

const BASE_URL = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
const DEFAULT_PUBLIC_LOGO = `${BASE_URL}platform-logo.svg`;
const PLATFORM_CONFIG_KEY = 'm1_platform_config';
const DEFAULT_PLATFORM_NAME = '绩效信息管理平台';

type PlatformConfig = {
  platformName: string;
  logoUrl: string;
};

const SVG_GRAPHIC_SELECTOR = 'path,rect,circle,ellipse,line,polyline,polygon,text,image,use';

const getInlineStyleValue = (element: Element, property: string) => {
  const styleText = element.getAttribute('style');
  if (!styleText) {
    return null;
  }

  const matched = styleText
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${property}:`));

  return matched ? matched.slice(property.length + 1).trim() : null;
};

const getSvgPaintAttr = (element: Element, property: string) =>
  element.getAttribute(property) || getInlineStyleValue(element, property);

const isZeroLikeValue = (value?: null | string) => {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim();
  if (!normalizedValue) {
    return false;
  }

  if (normalizedValue.endsWith('%')) {
    return Number.parseFloat(normalizedValue) === 0;
  }

  const parsedValue = Number.parseFloat(normalizedValue);
  return Number.isFinite(parsedValue) && parsedValue === 0;
};

const isTransparentPaint = (value?: null | string) => {
  if (!value) {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();
  return normalizedValue === 'none' || normalizedValue === 'transparent' || normalizedValue === '#0000' || normalizedValue === '#00000000';
};

const hasVisibleStroke = (element: Element) => {
  const stroke = getSvgPaintAttr(element, 'stroke');
  if (!stroke || isTransparentPaint(stroke)) {
    return false;
  }

  if (isZeroLikeValue(getSvgPaintAttr(element, 'opacity')) || isZeroLikeValue(getSvgPaintAttr(element, 'stroke-opacity'))) {
    return false;
  }

  const strokeWidth = getSvgPaintAttr(element, 'stroke-width');
  return !isZeroLikeValue(strokeWidth);
};

const hasVisibleFill = (element: Element) => {
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'line' || tagName === 'polyline') {
    return false;
  }

  if (isZeroLikeValue(getSvgPaintAttr(element, 'opacity')) || isZeroLikeValue(getSvgPaintAttr(element, 'fill-opacity'))) {
    return false;
  }

  const fill = getSvgPaintAttr(element, 'fill');
  return !fill || !isTransparentPaint(fill);
};

const decodeSvgDataUrl = (logoUrl: string) => {
  const lowerCaseUrl = logoUrl.toLowerCase();
  if (!lowerCaseUrl.startsWith('data:image/svg+xml')) {
    return '';
  }

  const commaIndex = logoUrl.indexOf(',');
  if (commaIndex < 0) {
    return '';
  }

  const dataContent = logoUrl.slice(commaIndex + 1);

  try {
    return lowerCaseUrl.includes(';base64,') ? atob(dataContent) : decodeURIComponent(dataContent);
  } catch {
    return '';
  }
};

const isVisuallyEmptySvgDataUrl = (logoUrl: string) => {
  const svgText = decodeSvgDataUrl(logoUrl);
  if (!svgText) {
    return true;
  }

  const svgDocument = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  if (svgDocument.querySelector('parsererror')) {
    return true;
  }

  const graphicElements = Array.from(svgDocument.querySelectorAll(SVG_GRAPHIC_SELECTOR));
  if (!graphicElements.length) {
    return true;
  }

  return !graphicElements.some((element) => {
    const tagName = element.tagName.toLowerCase();
    if (isZeroLikeValue(getSvgPaintAttr(element, 'opacity'))) {
      return false;
    }

    if (tagName === 'image' || tagName === 'use') {
      return true;
    }

    return hasVisibleFill(element) || hasVisibleStroke(element);
  });
};

const normalizeLogoUrl = (logoUrl?: string) => {
  if (!logoUrl || logoUrl === '/platform-logo.svg' || logoUrl === 'platform-logo.svg') {
    return DEFAULT_PUBLIC_LOGO;
  }

  if (logoUrl.toLowerCase().startsWith('data:image/svg+xml') && isVisuallyEmptySvgDataUrl(logoUrl)) {
    return DEFAULT_PUBLIC_LOGO;
  }

  return logoUrl;
};

const readLocalConfig = (): PlatformConfig => {
  const raw = localStorage.getItem(PLATFORM_CONFIG_KEY);
  if (!raw) {
    return {
      platformName: DEFAULT_PLATFORM_NAME,
      logoUrl: DEFAULT_PUBLIC_LOGO,
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PlatformConfig>;
    return {
      platformName: parsed.platformName || DEFAULT_PLATFORM_NAME,
      logoUrl: normalizeLogoUrl(parsed.logoUrl),
    };
  } catch {
    return {
      platformName: DEFAULT_PLATFORM_NAME,
      logoUrl: DEFAULT_PUBLIC_LOGO,
    };
  }
};

export const usePlatformStore = defineStore('platform', () => {
  const initialConfig = readLocalConfig();
  const platformName = ref(initialConfig.platformName);
  const logoUrl = ref(initialConfig.logoUrl);
  const currentPageTitle = ref('');

  const upsertIconLink = (rel: string, href: string) => {
    let link = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }

    link.type = 'image/svg+xml';
    link.href = href;
  };

  const syncDocumentMeta = () => {
    document.title = currentPageTitle.value ? `${currentPageTitle.value} - ${platformName.value}` : platformName.value;
    const nextLogoUrl = normalizeLogoUrl(logoUrl.value);
    upsertIconLink('icon', nextLogoUrl);
    upsertIconLink('shortcut icon', nextLogoUrl);
  };

  const persistConfig = () => {
    localStorage.setItem(
      PLATFORM_CONFIG_KEY,
      JSON.stringify({
        platformName: platformName.value,
        logoUrl: normalizeLogoUrl(logoUrl.value),
      })
    );
  };

  const setPlatformConfig = (payload: Partial<PlatformConfig>) => {
    platformName.value = payload.platformName || DEFAULT_PLATFORM_NAME;
    logoUrl.value = normalizeLogoUrl(payload.logoUrl);
  };

  const resetPlatformConfig = () => {
    platformName.value = DEFAULT_PLATFORM_NAME;
    logoUrl.value = DEFAULT_PUBLIC_LOGO;
  };

  const setCurrentPageTitle = (title: string) => {
    currentPageTitle.value = title;
  };

  watch(
    [platformName, logoUrl, currentPageTitle],
    () => {
      logoUrl.value = normalizeLogoUrl(logoUrl.value);
      persistConfig();
      syncDocumentMeta();
    },
    { immediate: true }
  );

  return {
    platformName,
    logoUrl,
    currentPageTitle,
    defaultPlatformName: DEFAULT_PLATFORM_NAME,
    defaultLogoUrl: DEFAULT_PUBLIC_LOGO,
    setPlatformConfig,
    resetPlatformConfig,
    setCurrentPageTitle,
    syncDocumentMeta,
  };
});
