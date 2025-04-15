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
        color: '#EFEFEF',
        marginBottom: 16,
        textAlign: 'center',
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    row: {
        justifyContent: 'space-between', // Espaciado entre los botones
        marginBottom: 16,
    },
    genreButton: {
        flex: 1,
        margin: 8,
        padding: 16,
        backgroundColor: '#1B263B',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genreText: {
        color: '#EFEFEF',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default styles;