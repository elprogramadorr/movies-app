import React from 'react';
import {Text, SafeAreaView, ScrollView, Image, View} from 'react-native';

const MovieDetailsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.mainContainer}>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Doctor Sleep</Text>
            <Text style={styles.director}>
              2019 - Dirigido por Mike Flanagan
            </Text>
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
  textContainer: {
    flex: 0.7,
    paddingRight: 15,
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
    flex: 0.3,
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
  },
  ratingText: {
    color: 'white',
    fontSize: 14,
  },
  ratingValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
};

export default MovieDetailsScreen;
