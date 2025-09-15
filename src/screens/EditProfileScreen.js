import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../context/AuthContext';
import { fontSize, spacing, borderRadius,wp,hp } from '../utils/dimensions';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const scrollViewRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicleNumber: '',
    licenseNumber: '',
    vehicleModel: '',
    vehicleColor: '',
    address: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        vehicleNumber: user.vehicleNumber || '',
        licenseNumber: user.licenseNumber || '',
        vehicleModel: user.vehicleModel || '',
        vehicleColor: user.vehicleColor || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    // Vehicle number validation
    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    } else if (formData.vehicleNumber.trim().length < 5) {
      newErrors.vehicleNumber = 'Vehicle number must be at least 5 characters';
    }

    // License number validation
    if (!formData.licenseNumber.trim()) {
      newErrors.licenseNumber = 'License number is required';
    } else if (formData.licenseNumber.trim().length < 5) {
      newErrors.licenseNumber = 'License number must be at least 5 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const renderInput = (label, field, placeholder, keyboardType = 'default', required = false, autoCapitalize = 'words', maxLength = null, editable = true) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[styles.textInput, errors[field] && styles.textInputError, !editable && styles.textInputDisabled]}
        value={formData[field]}
        onChangeText={(value) => handleInputChange(field, value)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#717182"
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        returnKeyType="next"
        clearButtonMode="while-editing"
        blurOnSubmit={false}
        multiline={false}
        numberOfLines={1}
        textAlignVertical="center"
        maxLength={maxLength}
        editable={editable}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors before saving');
      return;
    }

    setLoading(true);
    try {
      const updatedUser = { 
        ...user, 
        ...formData,
        phone: formData.phone.replace(/\s/g, '') // Remove spaces from phone
      };
      
      if (updateUser) {
        await updateUser(updatedUser);
      }
      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderFormContent = () => (
    <>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        {renderInput('Full Name', 'name', 'Enter your full name', 'default', true, 'words')}
        {renderInput('Phone Number', 'phone', 'Enter your phone number', 'phone-pad', true, 'none', 15, false)}
        {renderInput('Address', 'address', 'Enter your address', 'default', false, 'words')}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>

        {renderInput('Vehicle Number', 'vehicleNumber', 'Enter vehicle registration number', 'default', true, 'characters')}
        {renderInput('License Number', 'licenseNumber', 'Enter your driver license number', 'default', true, 'characters')}
        {renderInput('Vehicle Model', 'vehicleModel', 'Enter vehicle model')}
        {renderInput('Vehicle Color', 'vehicleColor', 'Enter vehicle color')}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="#030213" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          disabled={loading}
        >
          <Text style={[styles.saveButtonText, loading && styles.saveButtonTextDisabled]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      {Platform.OS === 'ios' ? (
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior="padding"
          keyboardVerticalOffset={0}
          enabled={true}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {renderFormContent()}
          </ScrollView>
        </KeyboardAvoidingView>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          {renderFormContent()}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#ffffff' // White background
  },
  keyboardContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6', // Light background border
  },
  backButton: { padding: spacing.sm },
  headerTitle: { 
    fontSize: fontSize.lg, 
    fontWeight: '600', 
    color: '#1f2937' // Dark text
  },
  saveButton: { 
    backgroundColor: '#3b82f6', // Blue
    paddingHorizontal: spacing.lg, 
    paddingVertical: spacing.sm, 
    borderRadius: spacing.sm 
  },
  saveButtonDisabled: { backgroundColor: '#6b7280' }, // Gray when disabled
  saveButtonText: { 
    color: '#ffffff', // White text
    fontSize: fontSize.sm, 
    fontWeight: '600' 
  },
  saveButtonTextDisabled: { color: '#b8b8b8' },
  content: { flex: 1, paddingHorizontal: spacing.xl },
  scrollContent: { paddingBottom: 40 },
  section: { marginTop: spacing.xl },
  sectionTitle: { 
    fontSize: fontSize.md, 
    fontWeight: '600', 
    color: '#1f2937', // Dark text
    marginBottom: spacing.lg 
  },
  inputContainer: { marginBottom: 20 },
  inputLabel: { 
    fontSize: fontSize.sm, 
    fontWeight: '500', 
    color: '#1f2937', // Dark text
    marginBottom: spacing.sm 
  },
  required: { color: '#ef4444' }, // Red
  textInput: {
    borderWidth: 1,
    borderColor: '#f3f4f6', // Light background border
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: '#1f2937', // Dark text
    backgroundColor: '#ffffff', // White background
  },
  textInputError: {
    borderColor: '#ef4444', // Red
    backgroundColor: '#fef2f2', // Light red background
  },
  textInputDisabled: {
    backgroundColor: '#f3f4f6', // Light background
    color: '#6b7280', // Gray text
  },
  errorText: {
    color: '#ef4444', // Red
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default EditProfileScreen;
