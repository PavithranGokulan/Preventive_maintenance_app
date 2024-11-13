import React, { useState, useEffect } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, Button, StyleSheet, Alert, SafeAreaView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, addDoc } from 'firebase/firestore';
import { FontAwesome } from '@expo/vector-icons';
import { db } from '../firebase'; 

const sections = [
    { id: '1', title: 'Safety Rules' },
    { id: '2', title: 'General Rules at Service Check' },
    { id: '3', title: 'Documents Used at Service Check' },
    { id: '4', title: 'Fall Protection System' },
    { id: '5', title: 'Anchor Points' },
    { id: '6', title: 'Nose Cone' },
    { id: '7', title: 'Blades' },
    { id: '8', title: 'Hub and Blade Bearing' },
    { id: '9', title: 'Main Bearing Housing' },
    { id: '10', title: 'Soft Braking' },
    { id: '11', title: 'Cable Switches' },
    { id: '12', title: 'Traverse Connecting Rod' },
    { id: '13', title: 'Pitch System' },
    { id: '14', title: 'Gearbox' },
    { id: '15', title: 'Composite Coupling - Nu-Tech Coupling' },
    { id: '16', title: 'Gear Oil Cooling System' },
    { id: '17', title: 'Brake' },
    { id: '18', title: 'Generator' },
    { id: '19', title: 'Hydraulics' },
    { id: '20', title: 'Temperature Reading' },
    { id: '21', title: 'Yaw Gear - Yaw System' },
    { id: '22', title: 'Wind Vane, Anemometer' },
    { id: '23', title: 'Nacelle Cover' },
    { id: '24', title: 'Safety Items' },
    { id: '25', title: 'Lattice Tower' },
    { id: '26', title: 'Crane' },
    { id: '27', title: 'History of components replacements' },
    { id: '28', title: 'Additional Points' }
];

const ChecklistSection = ({ navigation }) => {
  const [sectionStatus, setSectionStatus] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  // Load section completion status from AsyncStorage
  const loadSectionStatus = async () => {
    const status = {};
    for (const section of sections) {
      const savedData = await AsyncStorage.getItem(section.title);
      status[section.title] = savedData ? true : false;
    }
    setSectionStatus(status);
  };

  useEffect(() => {
    loadSectionStatus();
  }, []);

  // Function to handle pull-to-refresh action
  const onRefresh = () => {
    setRefreshing(true);
    
    // Reload the section status after refreshing
    loadSectionStatus().then(() => {
      setRefreshing(false); // Stop the refreshing animation
    });
  };

  const uploadDataToFirestore = async () => {
    try {
      for (let section of sections) {
        const savedData = await AsyncStorage.getItem(section.title);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          await addDoc(collection(db, 'checklistData'), {
            section: section.title,
            items: parsedData,
          });
        }
      }
      Alert.alert('Success', 'All data uploaded to Firestore!');
    } catch (error) {
      console.error('Error uploading data to Firestore:', error);
      Alert.alert('Error', 'Failed to upload data to Firestore.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <Image 
          source={require('../assets/lge_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <View style={styles.container}>
        <Text style={styles.header}>Maintenance Checklist</Text>
        <FlatList
          data={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.sectionItem, { borderLeftColor: sectionStatus[item.title] ? '#66C05D' : '#FF4D4D' }]}
              onPress={() => navigation.navigate('ChecklistScreen', { section: item.title })}
            >
              <Text style={styles.sectionTitle}>{item.title}</Text>
              {sectionStatus[item.title] ? (
                <FontAwesome name="check-circle" size={24} color="#66C05D" />
              ) : (
                <FontAwesome name="exclamation-circle" size={24} color="#FF4D4D" />
              )}
            </TouchableOpacity>
          )}
          // Adding RefreshControl for pull-to-refresh functionality
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh} // Triggering the onRefresh function
              tintColor="#66C05D"
            />
          }
        />
        <Button
          title="Upload All Data"
          onPress={uploadDataToFirestore}
          color="#66C05D"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fafaf5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 50,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fafaf5',
  },
  logo: {
    width: 200,
    height: 50,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fafaf5',
  },
  header: {
    fontSize: 40,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#0c7d0f',
    marginBottom: 20,
  },
  sectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fafafa',
    borderRadius: 4,
    borderLeftWidth: 5,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#4d4d4d',
    fontWeight: '600',
  },
});

export default ChecklistSection;
