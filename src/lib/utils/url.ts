export function appendQueryParamToUrl(url: string, key: string, value: string): string {
    const delimiter = url.includes('?') ? '&' : '?';
    return `${url}${delimiter}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

export function appendQueryParamsToUrl<T>(url: string, params: T): string {
    if (!params) {
        return url;
    }
    const queryParams = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');

    const delimiter = url.includes('?') ? '&' : '?';

    return `${url}${delimiter}${queryParams}`;
}