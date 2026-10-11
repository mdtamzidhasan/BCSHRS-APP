import { Image, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/app-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FilePickerField } from '@/components/ui/misc';
import { RadioGroup } from '@/components/ui/radio-group';
import { FormError } from '@/components/ui/state-views';
import { useFormErrors } from '@/hooks/use-form-errors';
import { palette, radius, spacing } from '@/theme/tokens';
import { IMAGE_TYPES } from '../api';
import { useUploadHeader } from '../use-companies';

const IMAGE_MIME = ['image/jpeg', 'image/png', 'image/gif'];

/** Upload the company Header / Footer / Signature / Logo image, with a preview of the picked file. */
export function UploadHeaderView() {
  const state = useUploadHeader();
  const errors = useFormErrors(state.upload.error);

  return (
    <Card title="Upload image" outlined>
      <RadioGroup label="Image type" value={state.imageType} options={IMAGE_TYPES.map((type) => ({ label: type, value: type }))} onChange={state.setImageType} />
      <FilePickerField label="Image (jpg, png, gif - max 1 MB)" file={state.file} onPick={state.setFile} accept={IMAGE_MIME} error={errors.field('FileUpload1')} />
      {state.file ? (
        <View style={styles.preview}>
          <Image source={{ uri: state.file.uri }} style={styles.image} resizeMode="contain" accessibilityLabel="Selected image preview" />
        </View>
      ) : (
        <AppText tone="muted" variant="caption">
          {state.imageType === 'Logo' ? 'A logo must be 100 x 100 pixels or smaller.' : 'Choose an image to see its preview.'}
        </AppText>
      )}
      <FormError error={state.upload.error} />
      <Button title="Upload" icon="cloud-upload-outline" disabled={!state.file} loading={state.upload.isPending} onPress={() => state.upload.mutate()} />
    </Card>
  );
}

const styles = StyleSheet.create({
  preview: { alignItems: 'center', backgroundColor: palette.background, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  image: { width: '100%', height: 160 },
});
