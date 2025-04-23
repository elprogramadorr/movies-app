import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#0D1B2A',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: '#EFEFEF',
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
        color: '#EFEFEF',
    },
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    genreSection: {
        marginBottom: 24,
    },
    genreTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#EFEFEF',
    },
    movieItem: {
        marginRight: 16,
        alignItems: 'center',
        position: 'relative',
    },
    poster: {
        width: 120,
        height: 180,
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        padding: 5,
    },
    finalizeButtonContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
});

export default styles;