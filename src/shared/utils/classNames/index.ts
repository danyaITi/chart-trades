type Mod = Record<string, boolean> | undefined;

/**
 * Утилита для условного объединения имен классов в одну строку.
 *
 * @param cls {string} - Основной (обязательный) класс.
 * @param mod {Mod} - Объект модификаторов, где ключи - названия классов,
 *                    а значения - логические флаги, определяющие, следует ли добавить класс.
 * @param additional {string[] | undefined} - Дополнительные классы, переданные в виде массива строк.
 *
 * @returns {string} - Строка с объединенными именами классов, разделенными пробелами.
 *                     Удаляются модификаторы со значением `false` или `undefined`.
 *
 * @example
 * classNames('button', { 'button--active': true, 'button--disabled': false }, ['extra-class'])
 * // Результат: 'button button--active extra-class'
 */
export const classNames = (cls: string, mod: Mod = {}, additional: [string | undefined] = [undefined]) => {
  return [
    cls,
    ...Object.entries(mod)
      .filter(([_, value]) => Boolean(value))
      .map(([key, _]) => key),

    ...additional,
  ].join(' ');
};
