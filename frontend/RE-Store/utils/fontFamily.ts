import {fontFamilies} from './font';

export const getFontFamily = (
  weight: 'normal' | 'medium' | 'bold',
) => {
  const selectedFontFamily = fontFamilies.ANTON
  return selectedFontFamily[weight];
};