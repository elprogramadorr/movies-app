import React from 'react';
import {
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  StyleSheet,
  Linking,
} from 'react-native';

const WatchProvider = ({link, logoUrl, name}) => {
  const YouTubeUrl = 'https://www.youtube.com/watch?v=';
  const handlePress = () => {
    return;
  };

  return (
    <TouchableWithoutFeedback onPress={handlePress}>
      <View style={styles.container}>
        <Image source={{uri: logoUrl}} style={styles.logo} />
        <Text style={styles.name}>{name}</Text>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    width: 130,
  },
  logo: {
    width: 30,
    height: 30,
    borderRadius: 10,
    marginRight: 10,
  },
  name: {
    marginTop: 5,
    fontSize: 14,
    color: 'white',
  },
});

export default WatchProvider;
