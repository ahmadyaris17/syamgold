export const DEFAULT_FOOTER_ADDRESS = 'Jl. Perintis Kemerdekaan No. 1, Makassar, Sulawesi Selatan 90245';

export function normalizeWhatsAppNumber(value) {
  const digits = String(value ?? '').replace(/\D/g, '');

  if (!digits) return '';
  if (digits.startsWith('620')) return `62${digits.slice(3)}`;
  if (digits.startsWith('62')) return digits;
  if (digits.startsWith('0')) return `62${digits.slice(1)}`;
  if (digits.startsWith('8')) return `62${digits}`;

  return digits;
}

export function normalizeMapEmbedUrl(value) {
  const rawValue = String(value ?? '').trim();
  const iframeSource = rawValue.match(/src=["']([^"']+)["']/i)?.[1];
  const candidate = iframeSource || rawValue;

  if (!candidate) return '';

  try {
    const url = new URL(candidate);
    const isHttp = url.protocol === 'https:' || url.protocol === 'http:';
    const isGoogleMaps = /(^|\.)google\.[a-z.]+$/i.test(url.hostname)
      || url.hostname === 'maps.google.com';

    if (!isHttp || !isGoogleMaps) return '';
    if (url.pathname.startsWith('/maps/embed') || url.searchParams.get('output') === 'embed') {
      return url.toString();
    }

    const coordinates = decodeURIComponent(url.pathname).match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
    if (coordinates) {
      const [, latitude, longitude] = coordinates;
      return `https://www.google.com/maps?q=${latitude},${longitude}&z=17&output=embed`;
    }

    return '';
  } catch {
    return '';
  }
}

export function sanitizeCompanyInfo(companyInfo) {
  return Object.fromEntries(
    Object.entries(companyInfo).map(([key, value]) => [
      key,
      key === 'whatsapp'
        ? normalizeWhatsAppNumber(value)
        : key === 'outletsMapEmbedUrl'
          ? normalizeMapEmbedUrl(value)
        : typeof value === 'string'
          ? value.trim()
          : value,
    ]),
  );
}

export function sanitizeOutlets(outlets) {
  return outlets.map((outlet) => ({
    ...outlet,
    whatsapp: normalizeWhatsAppNumber(outlet.whatsapp),
  }));
}
