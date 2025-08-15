import React, { useCallback } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { Download05Icon } from 'hugeicons-react';
import { downloadBase64File } from '../utils/files';
import { Base64 } from '@sibdevtools/frontend-common';

export interface StaticMockBinaryContentProps {
  isEditMode: boolean;
  content: Uint8Array;
  setContent: (content: Uint8Array) => void;
  disabled?: boolean;
}

const StaticFileMockContent: React.FC<StaticMockBinaryContentProps> = ({
                                                                         isEditMode,
                                                                         content,
                                                                         setContent,
                                                                         disabled
                                                                       }) => {
  const getFileContent = useCallback((file: File): Promise<Uint8Array> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const binaryData = new Uint8Array(reader.result as ArrayBuffer);
        resolve(binaryData);
      };
      reader.onerror = (error) => reject(error);
    });
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const content = await getFileContent(file);
    setContent(content);
  };

  const downloadFile = () => {
    downloadBase64File(Base64.Encoder.array2text(content), 'rs.bin', 'application/octet-stream');
  };

  if (isEditMode) {
    return (
      <Form.Group controlId="fileInput" className="mb-3">
        <Form.Label>Upload File</Form.Label>
        <InputGroup>
          <Form.Control
            type="file"
            disabled={disabled}
            onChange={handleFileChange}
          />
          <Button
            disabled={disabled}
            variant={'outline-secondary'}
            onClick={downloadFile}
            title={'Download'}
          >
            <Download05Icon />
          </Button>
        </InputGroup>
      </Form.Group>
    );
  }

  return (
    <Form.Group controlId="fileInput" className="mb-3">
      <Form.Label>Upload File</Form.Label>
      <Form.Control
        type="file"
        onChange={handleFileChange}
      />
    </Form.Group>
  );
};

export default StaticFileMockContent;
