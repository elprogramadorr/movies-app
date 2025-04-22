import React from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';

interface ActorProps {
  name: string;
  photoUrl: string | null;
  role: string;
}

const Actor: React.FC<ActorProps> = ({name, photoUrl, role}) => {
  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: photoUrl || 'https://via.placeholder.com/150x200?text=No+Photo',
        }}
        style={styles.photo}
        resizeMode="cover"
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.role} numberOfLines={2}>
          {role}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: '180',
  },
  photo: {
    width: 50,
    height: 50,
    borderRadius: 30,
    marginRight: 15,
    borderWidth: 1,
    borderColor: 'white',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  role: {
    color: '#AAAAAA',
    fontSize: 10,
    fontStyle: 'italic',
  },
});

export default Actor;
