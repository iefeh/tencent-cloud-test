import {ResponseData} from "@/lib/response/response";

export function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        const chunk = array.slice(i, i + chunkSize);
        result.push(chunk);
    }
    return result;
}

export function appendQueryParamToUrl(url: string, key: string, value: string | number | boolean): string {
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

export function appendResponseToUrlQueryParams<T>(url: string, data: ResponseData<T>) {
    return appendQueryParamsToUrl(url, {
        code: data.code,
        msg: data.msg
    });
}