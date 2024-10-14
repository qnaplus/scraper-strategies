// https://bugs.chromium.org/p/v8/issues/detail?id=2869
export const unleak = (str: string | undefined | null): string => {
    return (" " + (str ?? "")).slice(1);
};
