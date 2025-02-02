declare type MenuType<T> = {
  icon: import('react').ReactElement<SVGAElement>;
  label: string;
  value: T;
};
