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
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'left',
        color: '#EFEFEF',
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
        color: '#EFEFEF',
        padding: 5,
    },
    error: {
        fontSize: 16,
        color: 'red',
        textAlign: 'center',
    },
    row: {
        justifyContent: 'space-between',
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
        backgroundColor: '#415A77',
    },
    genreText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    nextButton: {
        padding: 16,
        backgroundColor: '#E0E1DD',
        borderRadius: 8,
        alignItems: 'center',
    },
    nextButtonText: {
        color: '#0D1B2A',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default styles;