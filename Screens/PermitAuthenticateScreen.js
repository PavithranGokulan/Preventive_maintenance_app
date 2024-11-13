import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity, ScrollView, Keyboard, Alert } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs, limit, updateDoc, startAfter, orderBy, serverTimestamp } from 'firebase/firestore';
import Lgelogo from '../Lgelogo';
import { useNavigation } from '@react-navigation/native';

export default function PermitScreen() {
  const [permitNumber, setPermitNumber] = useState('');
  const [verifiedPermit, setVerifiedPermit] = useState(null);
  const [ongoingPermits, setOngoingPermits] = useState([]);
  const [historyPermits, setHistoryPermits] = useState([]);
  const [lastVisiblePermit, setLastVisiblePermit] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadLimit, setLoadLimit] = useState(5); // Initial limit for history permits
  const navigation = useNavigation();

  // Fetch ongoing permits (status: 'Accepted')
  const fetchOngoingPermits = async () => {
    try {
      const permitsRef = collection(db, 'permits');
      const q = query(permitsRef, where('status', '==', 'Accepted'));

      const querySnapshot = await getDocs(q);

      const permitsList = [];
      querySnapshot.forEach(doc => {
        permitsList.push({ id: doc.id, ...doc.data() });
      });
      setOngoingPermits(permitsList);
    } catch (error) {
      console.error('Error fetching ongoing permits:', error);
    }
  };

  // Fetch history permits with dynamic pagination
  // Fetch all permits for the history section, sorted by update time
  const fetchHistoryPermits = async (nextBatch = false) => {
    try {
      let permitsQuery = query(
        collection(db, 'permits'),
        where('status', 'in', ['Closed', 'Cancelled', 'Rejected', 'Pending']),
        orderBy('updatedAt', 'desc'),
        limit(loadLimit)
      );

      if (nextBatch && lastVisiblePermit) {
        permitsQuery = query(permitsQuery, startAfter(lastVisiblePermit), limit(loadLimit));
      }

      const querySnapshot = await getDocs(permitsQuery);

      const permits = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistoryPermits(prevPermits => {
        const filteredPermits = prevPermits.filter(permit => !permits.some(newPermit => newPermit.id === permit.id));
        return [...filteredPermits, ...permits];
      });

      setLastVisiblePermit(querySnapshot.docs[querySnapshot.docs.length - 1]);
      setLoadLimit(loadLimit + 5);
    } catch (error) {
      console.error('Error fetching history permits:', error);
    }
  };

  // Handle permit status update
  const updatePermitStatus = async (permitId, newStatus) => {
    try {
      const permitRef = doc(db, 'permits', permitId);
      await updateDoc(permitRef, { status: newStatus, updatedAt: serverTimestamp() });
      Alert.alert('Success', `Permit ${permitId} updated to ${newStatus}`);
      fetchOngoingPermits();
      fetchHistoryPermits(false);
    } catch (error) {
      console.error('Error updating permit status:', error);
    }
  };

  useEffect(() => {
    fetchOngoingPermits();
    fetchHistoryPermits();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Lgelogo />

      <View style={{ marginTop: 150 }} />

      <View style={{ width: '100%' }}>
        <TextInput
          placeholder="Enter Permit Number"
          style={styles.input}
          placeholderTextColor="#8c8c8c"
          value={permitNumber}
          onChangeText={(text) => setPermitNumber(text)}
        />
      </View>

      <Text style={styles.textCenter}>Can't find your permit?</Text>
      <TouchableOpacity style={styles.createPermitButton} onPress={() => navigation.navigate('PermitToWorkScreen')}>
        <Text style={styles.createPermitButtonText}>Create New Permit</Text>
      </TouchableOpacity>

      {/* Ongoing Permit Section */}
      <Text style={styles.sectionTitle}>On Going</Text>
      {ongoingPermits.length === 0 ? (
        <Text>No ongoing permits found.</Text>
      ) : (
        ongoingPermits.map((permit) => (
          <View key={permit.id} style={styles.permitContainer}>
            <Text style={styles.permitText}>{permit.id}</Text>
            <View style={styles.permitStatus}>
              <FontAwesome name="check-circle" size={20} color="green" />
              <Text style={styles.statusText}>Accepted</Text>
            </View>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.closePermitButton}
                onPress={() => updatePermitStatus(permit.id, 'Closed')}
              >
                <FontAwesome name="times-circle" size={16} color="green" />
                <Text style={styles.closePermitText}>Close permit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelPermitButton}
                onPress={() => updatePermitStatus(permit.id, 'Cancelled')}
              >
                <FontAwesome name="times-circle" size={16} color="red" />
                <Text style={styles.cancelPermitText}>Cancel permit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* History Section */}
      <Text style={styles.sectionTitle}>History:</Text>
      {historyPermits.length === 0 ? (
        <Text>No history permits found.</Text>
      ) : (
        historyPermits.map((permit) => (
          <View key={permit.id} style={styles.historyItem}>
            <Text style={styles.historyText}>{permit.id}</Text>
            <FontAwesome
              name={
                permit.status === 'Accepted'
                  ? 'check-circle'
                  : permit.status === 'Closed' || permit.status === 'Cancelled'
                  ? 'times-circle'
                  : 'clock-o'
              }
              size={20}
              color={
                permit.status === 'Accepted'
                  ? 'green'
                  : permit.status === 'Rejected' || permit.status === 'Cancelled'
                  ? 'red'
                  : permit.status === 'Pending'
                  ? 'orange'
                  : 'gray'
              }
            />
            <Text style={styles.statusText}>{permit.status}</Text>
          </View>
        ))
      )}

      <TouchableOpacity
        onPress={() => {
          if (!loadingMore) {
            setLoadingMore(true);
            fetchHistoryPermits(true).finally(() => setLoadingMore(false));
          }
        }}
      >
        <Text style={styles.viewMoreText}>View More...</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  logo: {
    width: 200,
    height: 30,
    position: 'absolute',
    top: 50,
    right: 10,
  },
  input: {
    height: 50,
    borderColor: '#00A86B',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 10,
    width: '100%',
    color: '#000000',
  },
  textCenter: {
    textAlign: 'left',
    marginBottom: 10,
    color: '#8c8c8c',
  },
  createPermitButton: {
    backgroundColor: '#2E8B57',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  createPermitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  permitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  permitText: {
    fontSize: 14,
    marginRight: 10,
  },
  permitStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginLeft: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    marginLeft: 'auto',
  },
  closePermitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    marginRight: 10,
  },
  closePermitText: {
    color: 'green',
    marginLeft: 5,
  },
  cancelPermitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  cancelPermitText: {
    color: 'red',
    marginLeft: 5,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyText: {
    fontSize: 14,
    marginRight: 10,
  },
  viewMoreText: {
    fontSize: 14,
    color: '#2E8B57',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
});
