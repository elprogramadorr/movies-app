import React from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Image,
  View,
  TouchableOpacity,
} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';

const MovieDetailsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.mainContainer}>
          <View style={styles.leftContainer}>
            <Text style={styles.title}>Doctor Sleep</Text>
            <Text style={styles.director}>
              2019 - Dirigido por Mike Flanagan
            </Text>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'space-around',
              }}>
              <TouchableOpacity
                style={{backgroundColor: '#778DA9', height: 23, width: 77}}>
                <FontAwesome name="home" size={14} color="white" />
                <Text style={{color: 'white'}}>Trailer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{backgroundColor: '#415A77', height: 23, width: 77}}>
                <AntDesign name="heart" size={14} color="#E63946" />
                <Text style={{color: 'white'}}>Te gusta</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.posterContainer}>
            <Image
              source={{
                uri: 'https://image.tmdb.org/t/p/original/p69QzIBbN06aTYqRRiCOY1emNBh.jpg',
              }}
              style={styles.posterImage}
            />
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>Puntuación:</Text>
              <Text style={styles.ratingValue}>3.5 / 5</Text>
            </View>
          </View>
        </View>
        <View>
          <Text style={{color: '#E0E1DD', fontWeight: 600, fontSize: 14}}>
            Sinopsis
          </Text>
          <Text style={{color: '#E0E1DD', fontWeight: 'light', fontSize: 14}}>
            Secuela del film de culto "El resplandor" (1980) dirigido por
            Stanley Kubrick y también basado en una famosa novela de Stephen
            King. La historia transcurre algunos años después de los
            acontecimientos de "The Shining", y sigue a Danny Torrance (Ewan
            McGregor), traumatizado y con problemas de ira y alcoholismo que
            hacen eco de los problemas de su padre Jack, que cuando sus
            habilidades psíquicas resurgen, se contacta con una niña de nombre
            Abra Stone, a quien debe rescatar de un grupo de viajeros que se
            alimentan de los niños que poseen el don de "el resplandor".
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = {
  container: {
    backgroundColor: '#0D1B2A',
    flex: 1,
  },
  scrollView: {
    padding: 12,
  },
  mainContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leftContainer: {
    flex: 0.6,
    flexDirection: 'column',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  director: {
    color: '#E0E1DD',
    fontSize: 16,
    marginBottom: 12,
  },
  posterContainer: {
    flex: 0.4,
    flexDirection: 'column',
    alignItems: 'center',
  },
  posterImage: {
    width: 120,
    height: 180,
    borderRadius: 4,
  },
  ratingContainer: {
    marginTop: 8,
    alignItems: 'center',
    backgroundColor: '#E7A325',
    borderRadius: 4,
    height: 41,
    width: 104,
  },
  ratingText: {
    color: 'white',
    fontSize: 12,
  },
  ratingValue: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
};

export default MovieDetailsScreen;
