function promiseSleep(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}