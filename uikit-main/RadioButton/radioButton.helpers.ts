interface DataAttributes {
    [key: string]: string | boolean | undefined;
}
/**
 *  Функция конвертации строки из camelCase в kebab-case
 */
const camelToKebab = (str: string): string => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

/**
 * Функция для преобразования пропсов в data-attributes
 */
export const propsToDataAttributes = (props: Record<string, any>, prefix: string): DataAttributes => {
    const dataAttributes: DataAttributes = {};

    Object.entries(props).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }

        const dataKey = `data-${prefix}-${camelToKebab(key)}`;

        dataAttributes[dataKey] = value;
    });

    return dataAttributes;
};
