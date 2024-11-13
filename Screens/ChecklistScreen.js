import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Switch, Button, FlatList, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
// import Example from '../Example';
const checklists = require('../Datas/checklists.json');

const ChecklistScreen = ({ route, navigation }) => {
  const { section } = route.params;
  const [checklistData, setChecklistData] = useState(checklists.sections[section] || []);

  useEffect(() => {
    const loadSavedData = async () => {
      const savedData = await AsyncStorage.getItem(section);
      if (savedData) {
        setChecklistData(JSON.parse(savedData));
      }
    };
    loadSavedData();
  }, [section]);

  const handleInputChange = (field, value, id) => {
    const updatedChecklist = checklistData.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setChecklistData(updatedChecklist);
  };

  const handleStatusChange = (value, id) => {
    const updatedChecklist = checklistData.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: value,
        };
      }
      return item;
    });
    setChecklistData(updatedChecklist);
  };

  const validateAndSaveSection = async () => {
    const isValid = checklistData.every(item => 
      item.status.trim() !== '' &&
      (item.status !== 'Other' || item.otherStatus.trim() !== '')&&
      item.remarks.trim() !== '' &&
      item.updatedRemarks.trim() !== ''
    );

    if (!isValid) {
      Alert.alert('Validation Error'
        , 'Please fill out the status for all checklist items.');
      return;
    }

    try {
      await AsyncStorage.setItem(section, JSON.stringify(checklistData));
      await AsyncStorage.setItem(`${section}_complete`, JSON.stringify(true));
      Alert.alert('Success', 'Section data saved successfully!');
      
    } catch (error) {
      console.error('Error saving section data:', error);
    }
    navigation.navigate('ChecklistSection');
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
        <Text style={styles.header}>{section}</Text>
        <FlatList
          data={checklistData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.checklistItem}>
              <View style={styles.row}>
                <Text style={styles.itemTitle}>{item.id + '. ' + item.title}</Text>
                <Switch
                  value={item.status === 'OK'}
                  onValueChange={(value) => handleStatusChange(value ? 'OK' : 'Not OK', item.id)}
                  trackColor={{ false: '#d9534f', true: '#5cb85c' }}
                  thumbColor="#fff"
                />
              </View>
              <TextInput
                style={styles.input}
                placeholder="Remarks"
                placeholderTextColor="#a5daa6"
                value={item.remarks}
                onChangeText={(text) => handleInputChange('remarks', text, item.id)}
              />
              <TextInput
                style={styles.input}
                placeholder="Updated Remarks"
                placeholderTextColor="#a5daa6"
                value={item.updatedRemarks}
                onChangeText={(text) => handleInputChange('updatedRemarks', text, item.id)}
              />
            </View>
          )}
        />
        <Button title="Save" color="#28a745" onPress={validateAndSaveSection} />
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
  checklistItem: {
    backgroundColor: '#fafafa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#555',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 5,
  },
  itemTitle: {
    fontSize: 20,
    flex: 1,
    color: '#54a855',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: '#a5daa6',
    borderBottomWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginTop: 10,
    color: '#333',
  },
});

export default ChecklistScreen;