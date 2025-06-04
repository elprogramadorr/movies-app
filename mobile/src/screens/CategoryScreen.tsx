import React from 'react';
import { SafeAreaView, View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

const CategoryScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CategoryScreen'>>();
  
  const { categoryName, movies } = route.params;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A1B2A' }}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{categoryName}</Text>
      </View>

      <FlatList
        data={movies}
        numColumns={2} // Esto crea dos columnas
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.movieItem}
            onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
          >
            <Image
              source={{ 
                uri: item.poster_path 
                  ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                  : 'https://via.placeholder.com/150x225'
              }}
              style={styles.poster}
            />
            <View style={styles.movieInfo}>
              <Text style={styles.movieTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.movieRating}>⭐ {item.vote_average.toFixed(1)}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    backgroundColor: '#0D1B2A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 8, 
  },
  movieItem: {
    flex: 1, 
    margin: 8, 
    alignItems: 'center', 
    maxWidth: '50%', 
  },
  poster: {
    width: '100%', 
    aspectRatio: 2/3, 
    borderRadius: 8,
  },
  movieInfo: {
    width: '100%', 
    paddingTop: 8,
  },
  movieTitle: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  movieRating: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
});
export default CategoryScreen;