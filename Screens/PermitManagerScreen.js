import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, FlatList } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { db } from '../firebase';
import { doc, updateDoc, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import Lgelogo from '../Lgelogo';

export default function PermitManagerScreen({ navigation }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPermits, setFilteredPermits] = useState([]);
  const [selectedPermit, setSelectedPermit] = useState(null);
  const [pendingPermits, setPendingPermits] = useState([]);
  const [pastPermits, setPastPermits] = useState([
    { id: '2024-cbe-301', status: 'APPROVED', color: 'green' },
    { id: '2024-cbe-304', status: 'REJECTED', color: 'red' },
    { id: '2024-cbe-306', status: 'REJECTED', color: 'red' },
    { id: '2024-cbe-308', status: 'REJECTED', color: 'red' },
    { id: '2024-cbe-315', status: 'APPROVED', color: 'green' }
  ]);

  useEffect(() => {
    // Fetch permits with "Pending" status from Firebase
    const fetchPendingPermits = async () => {
      const permitsQuery = query(collection(db, 'permits'), where('status', '==', 'Pending'));
      const unsubscribe = onSnapshot(permitsQuery, (snapshot) => {
        const permitsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPendingPermits(permitsList);
      });

      // Cleanup listener on unmount
      return () => unsubscribe();
    };

    fetchPendingPermits();
  }, []);

  const handleStatusChange = async (permitId, newStatus) => {
    const permitRef = doc(db, 'permits', permitId);
    try {
      await updateDoc(permitRef, {
        status: newStatus,
      });
      console.log(`${permitId} status updated to ${newStatus}`);

      // Update past permits with the newly updated permit at the top
      const newPastPermits = [
        { id: permitId, status: newStatus.toUpperCase(), color: newStatus === 'Accepted' ? 'green' : 'red' },
        ...pastPermits.filter(permit => permit.id !== permitId)
      ];
      setPastPermits(newPastPermits);
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const filtered = pendingPermits.filter(permit =>
      permit.id.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredPermits(filtered);
  };

  const handleSelectPermit = (permit) => {
    setSearchTerm(permit.id);
    setSelectedPermit(permit.id);
    setFilteredPermits([]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Lgelogo />
      <View style={{ marginTop: 150 }} />
      
      {/* Search Field with Autocomplete */}
      <View style={styles.pickerContainer}>
        <TextInput
          style={styles.searchPermitText}
          placeholder="Search Permit Number"
          value={searchTerm}
          onChangeText={handleSearch}
        />
        {filteredPermits.length > 0 && (
          <FlatList
            data={filteredPermits}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.autocompleteItem}
                onPress={() => handleSelectPermit(item)}
              >
                <Text>{item.id}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      {/* Show Selected Permit with Accept/Reject Buttons */}
      {selectedPermit && (
        <View style={styles.smallPermitContainer}>
          <Text style={styles.permitText}>{selectedPermit}</Text>
          <TouchableOpacity style={styles.smallAcceptButton} onPress={() => handleStatusChange(selectedPermit, 'Accepted')}>
            <Text style={styles.acceptText}>ACCEPT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallRejectButton} onPress={() => handleStatusChange(selectedPermit, 'Rejected')}>
            <Text style={styles.rejectText}>REJECT</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pending Approval Section */}
      <Text style={styles.sectionTitle}>Pending Approval</Text>
      {pendingPermits.map((permit, index) => (
        <View key={index} style={styles.smallPermitContainer}>
          <Text style={styles.permitText}>{permit.id}</Text>
          <TouchableOpacity style={styles.smallAcceptButton} onPress={() => handleStatusChange(permit.id, 'Accepted')}>
            <Text style={styles.acceptText}>ACCEPT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.smallRejectButton} onPress={() => handleStatusChange(permit.id, 'Rejected')}>
            <Text style={styles.rejectText}>REJECT</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Past Permits Section */}
      <Text style={styles.sectionTitle}>Past Permits</Text>
      {pastPermits.map((permit, index) => (
        <View key={index} style={styles.pastPermitContainer}>
          <Text style={styles.pastPermitText}>{permit.id}</Text>
          <FontAwesome name="check-circle" size={20} color={permit.color} />
          <Text style={[styles.pastPermitStatus, { color: permit.color }]}>{permit.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  logo: {
    width: 200,
    height: 30,
    position: 'absolute',
    top: 50,
    right: 10,
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    borderColor: '#00A86B',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  searchPermitText: {
    color: '#8c8c8c',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  smallPermitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
    borderColor: '#dcdcdc',
    borderWidth: 1,
  },
  permitText: {
    fontSize: 14,
    flex: 1,
  },
  smallAcceptButton: {
    backgroundColor: '#28a745',
    padding: 5,
    borderRadius: 5,
    marginRight: 5,
  },
  smallRejectButton: {
    backgroundColor: '#dc3545',
    padding: 5,
    borderRadius: 5,
  },
  acceptText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  rejectText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  pastPermitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pastPermitText: {
    fontSize: 14,
    marginRight: 10,
    flex: 1,
  },
  pastPermitStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  autocompleteItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
