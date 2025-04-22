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
        backgroundColor: '#007BFF',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    genreButtonSelected: {
        backgroundColor: '#415A77', // Color diferente para los botones seleccionados
    },
    genreText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    nextButton: {
        marginTop: 16,
        padding: 16,
        backgroundColor: '#28a745',
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default styles;