import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TextInput, Button, Alert, ToastAndroid } from 'react-native';
import { collection, doc, query, orderBy, onSnapshot, getDoc, setDoc, addDoc, serverTimestamp, where, getDocs } from 'firebase/firestore';
import { db } from '../../android/app/src/config/firebaseConfig';
import { getAuth } from '@react-native-firebase/auth';
import { Image } from 'react-native';

type Review = {
  id: string;
  usuario: string;
  review: string;
  fecha: any;
  photoURL?: string | null;
  uid?: string;
};

type Props = {
  movieId: string;
  isWatched: boolean;
};

const Review: React.FC<Props> = ({ movieId, isWatched }) => {
  const auth = getAuth();
  const user = auth.currentUser;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [estructuraLista, setEstructuraLista] = useState(false);
  const [myReview, setMyReview] = useState<string>('');
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const [showAll, setShowAll] = useState(false);
  
  useEffect(() => {
    if (!movieId) return;

    const checkAndCreateReview = async () => {
      try {
        const movieDocRef = doc(db, 'review', String(movieId));
        const movieDocSnap = await getDoc(movieDocRef);

        if (!movieDocSnap.exists()) {
          await setDoc(movieDocRef, {});
          const usuariosRef = collection(db, 'review', String(movieId), 'usuarios');
          await addDoc(usuariosRef, {
            usuario: 'Sistema',
            review: '¡Sé el primero en dejar una reseña!',
            fecha: serverTimestamp(),
            photoURL: null,
            uid: 'sistema',
          });
        }
        setEstructuraLista(true);
      } catch (error) {
        console.error('Error en checkAndCreateReview:', error);
      }
    };

    checkAndCreateReview();
  }, [movieId]);

  // Verifica si el usuario ya escribió una reseña
  useEffect(() => {
    if (!movieId || !estructuraLista || !user) {
      setHasReviewed(false); // Permite comentar si no hay usuario
      console.log('No hay movieId, estructuraLista o usuario');
      console.log('movieId:', movieId, 'estructuraLista:', estructuraLista, 'user:', user);
      return;
    }

    const checkUserReview = async () => {
      const reviewsRef = collection(db, 'review', String(movieId), 'usuarios');
      const q = query(reviewsRef, where('uid', '==', user.uid));
      const snapshot = await getDocs(q);
      // Solo cuenta como "reseñado" si hay una reseña que NO sea del sistema
      const yaComento = snapshot.docs.some(doc => doc.data().uid !== 'sistema');
      setHasReviewed(yaComento);
    };

    checkUserReview();
  }, [movieId, estructuraLista, user]);

  // Escucha todas las reseñas
  useEffect(() => {
    if (!movieId || !estructuraLista) return;

    const reviewsRef = collection(db, 'review', String(movieId), 'usuarios');
    const q = query(reviewsRef, orderBy('fecha', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      snapshot => {
        const data = snapshot.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            usuario: typeof d.usuario === 'string' ? d.usuario : 'Usuario desconocido',
            review: typeof d.review === 'string' ? d.review : '',
            fecha: d.fecha,
            photoURL: d.photoURL,
            uid: d.uid,
          };
        }) as Review[];
        setReviews(data);
        setLoading(false);
      },
      error => {
        console.error('Error al obtener reviews:', error?.message || error);
        setReviews([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [movieId, estructuraLista]);

  // Enviar reseña
  const handleSendReview = async () => {
      if (sendingRef.current) return; // Bloquea instantáneamente
      sendingRef.current = true;
      setSending(true);

      if (!user) {
        Alert.alert('Debes iniciar sesión para comentar.');
        sendingRef.current = false;
        setSending(false);
        return;
      }
      if (!myReview.trim()) {
        Alert.alert('Escribe tu reseña antes de enviar.');
        sendingRef.current = false;
        setSending(false);
        return;
      }
      try {
        const reviewsRef = collection(db, 'review', String(movieId), 'usuarios');
        await addDoc(reviewsRef, {
          usuario: user.displayName || 'Usuario',
          review: myReview,
          fecha: serverTimestamp(),
          photoURL: user.photoURL || null,
          uid: user.uid,
        });
        setMyReview('');
        setHasReviewed(true);
        ToastAndroid.show('Reseña enviada con éxito.', ToastAndroid.SHORT);
      } catch (error) {
        Alert.alert('Error', 'No se pudo enviar la reseña.');
      } finally {
        sendingRef.current = false;
        setSending(false);
      }
    };

  if (loading) {
    return (
      <View style={styles.box}>
        <ActivityIndicator color="#E7A325" />
      </View>
    );
  }

  return (
    <View style={styles.box}>
    <View style={styles.linea} /> 
      <Text style={styles.title}>Reseñas</Text>
      {/* Formulario solo si no ha escrito reseña */}
      {user && !hasReviewed && isWatched &&(
        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: '#FFF', marginBottom: 4 }}>Escribe tu reseña:</Text>
          <TextInput
            style={{
              backgroundColor: '#19223A',
              color: '#FFF',
              borderRadius: 8,
              padding: 8,
              marginBottom: 8,
            }}
            value={myReview}
            onChangeText={setMyReview}
            placeholder="Tu reseña..."
            placeholderTextColor="#888"
            multiline
            editable={!sending}
          />
          <Button
            title={sending ? "Enviando..." : "Enviar reseña"}
            onPress={handleSendReview}
            color="#E7A325"
            disabled={sending}
          />
          {sending && (
            <Text style={{ color: '#E7A325', marginTop: 8 }}>Enviando reseña...</Text>
          )}
        </View>
      )}
      {user && !isWatched && (
        <Text style={{ color: '#A0A0A0', marginBottom: 12 }}>
          Debes marcar la película como vista para poder escribir una reseña.
        </Text>
      )}
      {user && hasReviewed && (
        <Text style={{ color: '#A0A0A0', marginBottom: 12 }}>Ya has escrito una reseña para esta película.</Text>
      )}
      {reviews.length === 0 ? (
        <Text style={styles.noReviews}>No hay reseñas aún.</Text>
      ) : (
        <>
          {(showAll ? reviews : reviews.slice(0, 5)).map(item => (
            <View key={item.id} style={styles.reviewItem}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                {item.photoURL ? (
                  <Image
                    source={{ uri: item.photoURL }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder} />
                )}
                <Text style={styles.user}>{item.usuario || 'Usuario desconocido'}</Text>
              </View>
              <Text style={styles.comment}>{item.review || ''}</Text>
              <Text style={styles.date}>
                {item.fecha?.toDate
                  ? new Date(item.fecha.toDate()).toLocaleDateString()
                  : ''}
              </Text>
            </View>
          ))}
          {reviews.length > 5 && !showAll && (
            <Text
              style={{
                color: '#E7A325',
                textAlign: 'center',
                marginTop: 8,
                fontWeight: 'bold',
              }}
              onPress={() => setShowAll(true)}
            >
              Ver más reseñas
            </Text>
          )}
          {showAll && reviews.length > 5 && (
            <Text
              style={{
                color: '#E7A325',
                textAlign: 'center',
                marginTop: 8,
                fontWeight: 'bold',
              }}
              onPress={() => setShowAll(false)}
            >
              Ver menos
            </Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: 'transparent',
    padding: 16,
    marginBottom: 32,
  },
  linea: {
    height: 2,
    backgroundColor: '#E7A325',
    marginBottom: 12,
    borderRadius: 2,
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noReviews: {
    color: '#A0A0A0',
    fontStyle: 'italic',
  },
  reviewItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#415A77',
    paddingBottom: 8,
  },
  user: {
    color: '#E7A325',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  comment: {
    color: '#FFF',
    marginBottom: 2,
  },
  date: {
    color: '#A0A0A0',
    fontSize: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#ccc',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    backgroundColor: '#415A77',
  },
});

export default Review;