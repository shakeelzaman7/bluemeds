export const snakeToCamel = (str: string): string => {
    return str.toLowerCase().replace(
        /([-_][a-z])/g,
        (group) => group.toUpperCase()
            .replace('-', '')
            .replace('_', '')
    );
}

export const snakeCaseObject = (obj: Object):Object => {
    let finalObj = {};
    for(let key in obj)
    {
        finalObj[camelToSnake(key)] = obj[key];
    }

    return finalObj;
}

export const camelToSnake = (str: string): string =>
{
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

export const implementsInterface = <T>(object: any, descriptor:string): object is T => {
    return descriptor in object;
}