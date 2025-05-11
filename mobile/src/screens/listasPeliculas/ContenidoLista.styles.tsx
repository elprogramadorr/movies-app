import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A1B2A',
    padding: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backButton: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  description: {
    color: '#E0E1DD',
    fontSize: 16,
    marginBottom: 8,
  },
  creationTime: {
    color: '#A0A0A0',
    fontSize: 14,
    marginBottom: 16,
  },
  list: {
    paddingBottom: 16,
  },
  posterContainer: {
    flex: 1,
    alignItems: 'center',
    margin: 4,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
    marginBottom: 4,
  },
  posterNumber: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
  },
});

export default styles;