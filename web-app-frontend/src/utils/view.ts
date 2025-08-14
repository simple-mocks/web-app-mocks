import { Base64 } from '@sibdevtools/frontend-common';

export type ViewType = 'base64' | 'raw';

export const getViewRepresentation = (view: ViewType, value: string | null): string => {
  if (!value) {
    return '';
  }
  if (view === 'raw') {
    return Base64.Decoder.text2text(value);
  }

  return value;
};
