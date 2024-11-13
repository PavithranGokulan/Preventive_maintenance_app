import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, StyleSheet, View, Image, Alert } from 'react-native';
import Lgelogo from '../Lgelogo';
import CheckBox from 'expo-checkbox'; 

export default function PermitToWorkScreen({ navigation }) {
  // State to track the input values
  const [form, setForm] = useState({
    name: '',
    numberOfPersons: '',
    descriptionOfWork: '',
    site: '',
    model: '',
    location: '',
    workArea: '',
    windSpeed: '',
  });

  // State to track the "Yes" or "No" selection
  const [windSpeedChecked, setWindSpeedChecked] = useState(null);

  // Function to handle input changes
  const handleInputChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleNext = () => {
    if (Object.values(form).every(value => value.trim())) {
      navigation.navigate('PermitListScreen', { formData: form });
    } else {
      Alert.alert('Error', 'Please fill in all fields before proceeding.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <Lgelogo />

      {/* Title */}
      <Text style={styles.titleText}>Permit to Work</Text>

      {/* Input Fields */}
      <TextInput
        placeholder="Name"
        placeholderTextColor="#A3D59B"
        style={styles.input}
        value={form.name}
        onChangeText={(text) => handleInputChange('name', text)}
      />
      <TextInput
        placeholder="No. of Persons"
        placeholderTextColor="#A3D59B"
        style={styles.input}
        value={form.numberOfPersons}
        onChangeText={(text) => handleInputChange('numberOfPersons', text)}
      />
      <TextInput
        placeholder="Description of Work"
        placeholderTextColor="#A3D59B"
        style={styles.input}
        value={form.descriptionOfWork}
        onChangeText={(text) => handleInputChange('descriptionOfWork', text)}
      />
      <TextInput
        placeholder="Site"
        placeholderTextColor="#A3D59B"
        style={styles.input}
        value={form.site}
        onChangeText={(text) => handleInputChange('site', text)}
      />
      <TextInput
      placeholder='Model'
      placeholderTextColor="#A3D59B"
      style={styles.input}
      value={form.model }
      onChangeText={(text) => handleInputChange('model', text)}
      />
      <TextInput
        placeholder="Location"
        placeholderTextColor="#A3D59B"
        style={styles.input}
        value={form.location}
        onChangeText={(text) => handleInputChange('location', text)}
      />
      <TextInput
        placeholder="Work Area"
        placeholderTextColor="#A3D59B"
        style={styles.input}
        value={form.workArea}
        onChangeText={(text) => handleInputChange('workArea', text)}
      />
      <TextInput
        placeholder="Wind Speed"
        placeholderTextColor="#A3D59B"
        style={styles.input}
        value={form.windSpeed}
        onChangeText={(text) => handleInputChange('windSpeed', text)}
      />
      {/* Yes or No Selection */}
      <View style={styles.selectionContainer}>
        <Text style={styles.selectionLabel}>A safeWork Method Statement (SWMS), Job Safety Analysis (JSA) and/or Safe Work Procedure (SWP) has been provided and is attached to this
        work permit?</Text>
        <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.optionButton, windSpeedChecked === 'Yes' && styles.selectedButton]}
          onPress={() => setWindSpeedChecked('Yes')}
        >
          <Text style={styles.optionText}>Yes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, windSpeedChecked === 'No' && styles.selectedButton]}
          onPress={() => setWindSpeedChecked('No')}
        >
          <Text style={styles.optionText}>No</Text>
        </TouchableOpacity>

        </View>
      </View>

      {/* Next Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={handleNext} // Call the handleNext function
      >
        <Text style={styles.buttonText}>Next</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  titleText: {
    fontSize: 35,
    fontWeight: 'bold',
    color: '#66C05D',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 80,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#A3D59B',
    fontSize: 14,
    color: '#000',
    marginBottom: 20,
    paddingVertical: 1,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: '#66C05D',
    borderRadius: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginTop:10,
    marginHorizontal: 5,
    justifyContent: 'center',
    alignItems: 'center',
    Width: 30,
  },
  optionText:{
    color: '#000',
  },
  selectionLabel:{
    fontWeight: '500',
    color: '#66C05D',
    textAlign: 'justify',
  },
  selectedButton: {
    backgroundColor: '#66C05D',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#66C05D',
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
