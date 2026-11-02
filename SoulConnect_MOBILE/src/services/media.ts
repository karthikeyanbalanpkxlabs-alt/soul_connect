import {Alert, PermissionsAndroid, Platform} from 'react-native';
import {errorCodes, isErrorWithCode, pick, types} from '@react-native-documents/picker';
import {Asset, launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {uploadMediaFile} from './api';

const MAX_BYTES = 20 * 1024 * 1024;

export type MediaKind = 'profile' | 'family' | 'identity';
export type MediaSource = 'library' | 'camera' | 'documents';

const PREFIX: Record<MediaKind, string> = {
  profile: 'profile',
  family: 'family_photo',
  identity: 'id_proof',
};

export async function pickMedia(source: MediaSource) {
  return source === 'documents' ? pickDocument() : pickPhoto(source);
}

export async function uploadPicked(kind: MediaKind, file: {uri: string; name: string; type: string}) {
  const uploaded = await uploadMediaFile(file, PREFIX[kind]);
  if (!uploaded.ok) {
    Alert.alert('Upload failed', uploaded.error);
    return null;
  }
  return {url: uploaded.url, name: file.name, type: file.type};
}

async function pickPhoto(source: 'library' | 'camera') {
  const options = {
    mediaType: 'photo' as const,
    selectionLimit: 1,
    quality: 0.8 as const,
    cameraType: 'back' as const,
    saveToPhotos: false,
  };
  if (source === 'camera' && !(await ensureCameraPermission())) {
    return null;
  }
  const result = source === 'camera' ? await launchCamera(options) : await launchImageLibrary(options);
  if (result.didCancel) {
    return null;
  }
  if (result.errorCode) {
    Alert.alert(
      source === 'camera' ? 'Camera unavailable' : 'Gallery unavailable',
      result.errorCode === 'permission'
        ? 'Allow access in your phone settings, then try again.'
        : result.errorMessage || 'Could not open the picker.',
    );
    return null;
  }
  const asset = result.assets?.[0];
  return asset ? photoFile(asset) : null;
}

function photoFile(asset: Asset) {
  if (!asset.uri) {
    return null;
  }
  const type = asset.type || 'image/jpeg';
  if (!type.startsWith('image/')) {
    Alert.alert('Photo required', 'Choose a JPEG, PNG, or WebP image.');
    return null;
  }
  if (asset.fileSize && asset.fileSize > MAX_BYTES) {
    Alert.alert('File too large', 'Image size should not exceed 20MB.');
    return null;
  }
  const extension = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
  return {
    uri: asset.uri,
    name: asset.fileName || `photo-${Date.now()}.${extension}`,
    type,
  };
}

async function ensureCameraPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }
  const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
    title: 'Camera',
    message: 'Soul Connect needs the camera so you can take a photo.',
    buttonPositive: 'Allow',
    buttonNegative: 'Not now',
  });
  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    return true;
  }
  Alert.alert('Camera unavailable', 'Allow camera access to take a photo.');
  return false;
}

async function pickDocument() {
  try {
    const [file] = await pick({
      type: [types.images, types.pdf],
      allowMultiSelection: false,
    });
    if (!file?.uri) {
      return null;
    }
    const name = file.name || `document-${Date.now()}`;
    const type = file.type || (name.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');
    const allowed = type.startsWith('image/') || type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
    if (!allowed) {
      Alert.alert('Invalid file', 'Upload an image or a PDF.');
      return null;
    }
    if (file.size && file.size > MAX_BYTES) {
      Alert.alert('File too large', 'File is too large. Max limit is 20MB.');
      return null;
    }
    return {uri: file.uri, name, type};
  } catch (error) {
    if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) {
      return null;
    }
    Alert.alert('Documents unavailable', 'Could not open your documents.');
    return null;
  }
}
