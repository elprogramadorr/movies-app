import React from 'react';
import {View, Text, Button} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from '../types';

type HomeNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const Home = () => {
  const navigation = useNavigation<HomeNavigationProp>();

  return (
    <View style={{padding: 100}}>
      <Button
        title="Ver Doctor Sleep"
        onPress={() => navigation.navigate('MovieDetails', {movieId: '694'})}
      />
    </View>
  );
};

export default Home;
