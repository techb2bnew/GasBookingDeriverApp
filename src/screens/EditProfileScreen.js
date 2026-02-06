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
  Image,
  PermissionsAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import { fontSize, spacing, borderRadius, wp, hp } from '../utils/dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import { COLORS } from '../utils/constants';

const EditProfileScreen = ({ navigation }) => {
  const { user, updateUser } = useAuth();
  const scrollViewRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    vehicleNumber: '',
    panCardNumber: '',
    aadharCardNumber: '',
    drivingLicence: '',
    bankDetails: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [imageUri, setImageUri] = useState(null);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Error', 'Authentication token not found');
        navigation.goBack();
        return;
      }

      const res = await authService.getProfile(token);
      if (res.success) {
        setProfileData(res);
        setFormData({
          name: res.user?.name || '',
          phone: res.user?.phone || '',
          address: res.user?.address || '',
          vehicleNumber: res.deliveryAgent?.vehicleNumber || '',
          panCardNumber: res.deliveryAgent?.panCardNumber || '',
          aadharCardNumber: res.deliveryAgent?.aadharCardNumber || '',
          drivingLicence: res.deliveryAgent?.drivingLicence || '',
          bankDetails: res.deliveryAgent?.bankDetails || '',
        });
        // Set existing profile image if available
        if (res.user?.profileImage) {
          setImageUri(res.user.profileImage);
        }
      } else {
        console.log('Error', res.error || 'Failed to load profile data');
      }
    } catch (error) {
      console.log('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to camera to take profile pictures',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const showImagePicker = () => {
    Alert.alert(
      'Select Profile Picture',
      'Choose an option',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openImageLibrary() },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Camera permission is required to take photos',
      );
      return;
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchCamera(options, response => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setProfileImage(asset);
        setImageUri(asset.uri);
      }
    });
  };

  const openImageLibrary = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      quality: 0.8,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel || response.errorMessage) {
        return;
      }
      if (response.assets && response.assets[0]) {
        const asset = response.assets[0];
        setProfileImage(asset);
        setImageUri(asset.uri);
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Phone validation (disabled but still validate if somehow changed)
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

    // PAN validation (simple length check so user is not blocked)
    if (!formData.panCardNumber.trim()) {
      newErrors.panCardNumber = 'PAN number is required';
    } else if (formData.panCardNumber.trim().length < 5) {
      newErrors.panCardNumber = 'PAN number must be at least 5 characters';
    }

    // Aadhar validation (only enforce 12 digits, ignore spaces)
    if (!formData.aadharCardNumber.trim()) {
      newErrors.aadharCardNumber = 'Aadhar number is required';
    } else if (
      !/^[0-9]{12}$/.test(formData.aadharCardNumber.replace(/\s/g, ''))
    ) {
      newErrors.aadharCardNumber =
        'Please enter a valid 12-digit Aadhar number';
    }

    // License validation
    if (!formData.drivingLicence.trim()) {
      newErrors.drivingLicence = 'Driving license number is required';
    } else if (formData.drivingLicence.trim().length < 5) {
      newErrors.drivingLicence =
        'Driving license must be at least 5 characters';
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

  const renderInput = (
    label,
    field,
    placeholder,
    keyboardType = 'default',
    required = false,
    autoCapitalize = 'words',
    maxLength = null,
    editable = true,
    multiline = false,
  ) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.textInput,
          errors[field] && styles.textInputError,
          !editable && styles.textInputDisabled,
          multiline && styles.textInputMultiline,
        ]}
        value={formData[field]}
        onChangeText={value => handleInputChange(field, value)}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#717182"
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        // returnKeyType="done"
        clearButtonMode="while-editing"
        blurOnSubmit={true}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        maxLength={maxLength}
        // editable={editable}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill all the required fields');
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        console.log('Error', 'Authentication token not found');
        return;
      }

      const profileUpdateData = {
        name: formData.name.trim(),
        phone: formData.phone.replace(/\s/g, ''), // Remove spaces from phone
        address: formData.address.trim(),
        vehicleNumber: formData.vehicleNumber.trim(),
        panCardNumber: formData.panCardNumber.toUpperCase().trim(),
        aadharCardNumber: formData.aadharCardNumber.replace(/\s/g, '').trim(),
        drivingLicence: formData.drivingLicence.trim(),
        bankDetails: formData.bankDetails.trim(),
        status: 'online', // Default status
      };

      // Use image upload service if image is selected, otherwise use regular update
      const result = profileImage
        ? await authService.updateProfileWithImage(
            token,
            profileUpdateData,
            profileImage,
          )
        : await authService.updateComprehensiveProfile(
            token,
            profileUpdateData,
          );

      if (result.success) {
        Alert.alert('Success', 'Profile updated successfully', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert(
          'Error',
          result.error || 'Failed to update profile. Please try again.',
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderImageUpload = () => (
    <View style={styles.imageUploadSection}>
      <Text style={styles.sectionTitle}>Profile Picture</Text>
      <View style={styles.imageUploadContainer}>
        <TouchableOpacity
          style={styles.imageUploadButton}
          onPress={showImagePicker}
        >
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.profileImagePreview}
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Icon name="camera-alt" size={40} color="#6b7280" />
              <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
            </View>
          )}
        </TouchableOpacity>
        {imageUri && (
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => {
              setImageUri(null);
              setProfileImage(null);
            }}
          >
            <Icon name="close" size={20} color="#ef4444" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFormContent = () => (
    <>
      {renderImageUpload()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.sectionCard}>
          {renderInput(
            'Full Name',
            'name',
            'Enter your full name',
            'default',
            true,
            'words',
          )}
          {renderInput(
            'Phone Number',
            'phone',
            'Enter your phone number',
            'phone-pad',
            true,
            'none',
            15,
            false,
          )}
          {renderInput(
            'Address',
            'address',
            'Enter your address',
            'default',
            false,
            'words',
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vehicle Information</Text>
        <View style={styles.sectionCard}>
          {renderInput(
            'Vehicle Number',
            'vehicleNumber',
            'Enter vehicle registration number',
            'default',
            true,
            'characters',
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Document Information</Text>
        <View style={styles.sectionCard}>
          {renderInput(
            'PAN Number',
            'panCardNumber',
            'Enter your PAN number',
            'default',
            true,
            'characters',
            10,
          )}
          {renderInput(
            'Aadhar Number',
            'aadharCardNumber',
            'Enter your Aadhar number',
            'numeric',
            true,
            'none',
            12,
          )}
          {renderInput(
            'Driving License',
            'drivingLicence',
            'Enter your driving license number',
            'default',
            true,
            'characters',
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bank Details</Text>
        <View style={styles.sectionCard}>
          {renderInput(
            'Bank Details',
            'bankDetails',
            'Enter bank name, account number, IFSC code',
            'default',
            false,
            'words',
            null,
            true,
            true,
          )}
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          disabled={loading}
        >
          <Text
            style={[
              styles.saveButtonText,
              loading && styles.saveButtonTextDisabled,
            ]}
          >
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
    backgroundColor: '#ffffff', // White background
  },
  keyboardContainer: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 60,
    paddingBottom: spacing.xl,
    minHeight: hp(14),
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  backButton: { padding: spacing.sm },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#ffffff', // White text
  },
  saveButton: {
    backgroundColor: '#ffff', // Blue
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.sm,
  },
  saveButtonDisabled: { backgroundColor: '#6b7280' }, // Gray when disabled
  saveButtonText: {
    color: '#100f0fff', // White text
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  saveButtonTextDisabled: { color: '#b8b8b8' },
  content: { flex: 1, paddingHorizontal: spacing.xl },
  scrollContent: { paddingBottom: spacing.lg },
  section: { marginTop: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color:COLORS.blue,
    marginBottom: spacing.lg,
  },
  sectionCard: {
    backgroundColor: '#f9fafb',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainer: { marginBottom: spacing.md },
  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: '#1f2937', // Dark text
    marginBottom: spacing.sm,
  },
  required: { color: '#ef4444' }, // Red
  textInput: {
    borderWidth: 1.2,
    borderColor: '#d1d5db', // Gray border
    borderRadius: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: '#1f2937', // Dark text
    backgroundColor: '#ffffff', // White input on light card
  },
  textInputError: {
    borderColor: '#ef4444', // Red
    backgroundColor: '#fef2f2', // Light red background
  },
  textInputDisabled: {
    backgroundColor: '#f3f4f6', // Light background
    color: '#6b7280', // Gray text
  },
  textInputMultiline: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  errorText: {
    color: '#ef4444', // Red
    fontSize: fontSize.xs,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  imageUploadSection: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  imageUploadContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  imageUploadButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  profileImagePreview: {
    width: 116,
    height: 116,
    borderRadius: 58,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    marginTop: spacing.xs,
    fontSize: fontSize.xs,
    color: '#6b7280',
    textAlign: 'center',
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default EditProfileScreen;
