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
        textAlign: 'left',
        color: '#EFEFEF',
    },
    textTitle: {
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'left',
        color: '#EFEFEF',
    },
    poster: {
        width: 120,
        height: 180,
        borderRadius: 8,
    },
    text: {
        fontSize: 12,
        marginBottom: 8,
        textAlign: 'center',
        color: '#EFEFEF',
        padding:5,
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
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#EFEFEF',
    },
    movieItem: {
        marginRight: 16,
        alignItems: 'center',
        position: 'relative',
    },
    selectedOverlay: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -20 }, { translateY: -20 }], // Centra la carita feliz
        justifyContent: 'center',
        alignItems: 'center',
    },
    finalizeButtonContainer: {
        alignItems: 'center',
    },

    finalizeButton:{
        padding: 16,
        backgroundColor: '#E0E1DD',
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },

    finalizeButtonText: {
        color: '#0D1B2A',
        fontSize: 18,
        fontWeight: 'bold',
    },

    scrollView: {
        flex: 1,
    },
});

export default styles;