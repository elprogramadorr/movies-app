import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import Icon from 'react-native-vector-icons/FontAwesome';


interface Credit {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  character?: string;
  job?: string;
}

interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  profile_path: string | null;
  birthday: string | null;
  place_of_birth: string | null;
}

const API_KEY = 'dc66f3e3e06fbb42ce432acf4341427f';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const PersonDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { personId } = route.params as { personId: number };
  const [details, setDetails] = useState<PersonDetails | null>(null);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPerson = async () => {
      try {
        const [detailRes, creditsRes] = await Promise.all([
          axios.get(`${BASE_URL}/person/${personId}`, {
            params: { api_key: API_KEY, language: 'es-ES' },
          }),
          axios.get(`${BASE_URL}/person/${personId}/combined_credits`, {
            params: { api_key: API_KEY, language: 'es-ES' },
          }),
        ]);
        setDetails(detailRes.data);
        setCredits(creditsRes.data.crew.concat(creditsRes.data.cast));
      } catch (error) {
        console.error('Error cargando detalles de la persona:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPerson();
  }, [personId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se pudo cargar la información.</Text>
      </View>
    );
  }

  // Filtrar por acting y directing
  const acted = credits
    .filter(c => c.character)
    .sort((a, b) => b.id - a.id);
  const directed = credits.filter(c => c.job === 'Director');

  const renderCredit = ({ item }: { item: Credit }) => {
    const title = item.title || item.name;
    return (
      <TouchableOpacity
        style={styles.creditItem}
        onPress={() => navigation.navigate('MovieDetails', { movieId: item.id })}
      >
        {item.poster_path ? (
          <Image
            source={{ uri: `${IMAGE_BASE_URL}${item.poster_path}` }}
            style={styles.creditImage}
          />
        ) : (
          <View style={[styles.creditImage, styles.noImage]}> 
            <Icon name="film" size={30} color="#555" />
          </View>
        )}
        <Text style={styles.creditTitle} numberOfLines={2}>{title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {details.profile_path && (
        <Image
          source={{ uri: `${IMAGE_BASE_URL}${details.profile_path}` }}
          style={styles.profileImage}
        />
      )}
      <Text style={styles.name}>{details.name}</Text>
      {details.birthday && (
        <Text style={styles.subText}>Nacimiento: {details.birthday}</Text>
      )}
      {details.place_of_birth && (
        <Text style={styles.subText}>Lugar: {details.place_of_birth}</Text>
      )}
      <Text style={styles.sectionTitle}>Biografía</Text>
      <Text style={styles.bioText}>{details.biography || 'Sin biografía disponible.'}</Text>

      {acted.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Películas / Series (Actuación)</Text>
          <FlatList
            data={acted}
            horizontal
            keyExtractor={item => `act-${item.id}`}
            renderItem={renderCredit}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.creditsList}
          />
        </>
      )}

      {directed.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Películas Dirigidas</Text>
          <FlatList
            data={directed}
            horizontal
            keyExtractor={item => `dir-${item.id}`}
            renderItem={renderCredit}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.creditsList}
          />
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1B2A',
    padding: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1B2A',
  },
  profileImage: {
    width: '100%',
    height: 400,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  subText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  bioText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  creditsList: {
    paddingBottom: 10,
  },
  creditItem: {
    width: 120,
    marginRight: 10,
    alignItems: 'center',
  },
  creditImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
  },
  creditTitle: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  noImage: {
    backgroundColor: '#1E2D3C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PersonDetailsScreen;
