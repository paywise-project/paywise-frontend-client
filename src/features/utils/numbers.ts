export const formatNumberFa = (num: number): string => {
  return new Intl.NumberFormat("fa-IR").format(num);
};
