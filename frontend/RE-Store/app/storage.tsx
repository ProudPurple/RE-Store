import { View, Text, Image, Dimensions} from 'react-native';
import { addPhoto, getGroups, getPhoto, } from '../assets/photos/group-manager';
import { useState, useEffect } from 'react';
const {width, height} = Dimensions.get('window');

export default function Storage() {
  const [imageUri, setImageUri] = useState<string | null>(null);
    const fetchPhoto = async (groupIndex: number, photoIndex: number) => {
    const photo = await getPhoto(groupIndex, photoIndex);
    setImageUri(photo);
  };

  useEffect(() => {
    fetchPhoto(0, 0);
  }, []);

  console.log(imageUri == null)
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Storage Screen</Text>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{width:width*7/8,height:width*7/8}}/>
      ) : (
        <Text>N/A</Text>
      )}
    </View>
  );
}