import {Platform} from 'react-native';

export const isIOS = () => {
  return Platform.OS === 'ios';
};

export const fontFamilies = {
  ANTON: {
    normal: isIOS() ? 'Anton-Regular' : 'AntonRegular',
    medium: isIOS() ? 'Anton-Medium' : 'AntonMedium',
    bold: isIOS() ? 'Anton-Bold' : 'AntonBold',
  },
  // Adjust the above code to fit your chosen fonts' names
};