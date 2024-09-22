const toFixed2 = (number: number) => {
    const truncatedNumber = Math.floor(number * 100) / 100;
    return truncatedNumber;
};

export { toFixed2 };
