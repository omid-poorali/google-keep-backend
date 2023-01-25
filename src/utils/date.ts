// get now in seconds
export const nowInSeconds = (): number => {
    return Math.ceil(new Date().getTime() / 1000);
}

// is expired
export const isExpired = (expiredAt: number): boolean => {
    return nowInSeconds() > expiredAt;
}