import React, { useEffect, useState } from 'react';
import { createMock, getMock, MockMeta, updateMock } from '../../api/service';
import { useNavigate, useParams } from 'react-router-dom';
import { contextPath, methods, MockType } from '../../const/common.const';
import MockForm from './MockForm';
import { Base64 } from '@sibdevtools/frontend-common';

export interface ModifyingMock {
  name: string;
  method: string;
  path: string;
  type: MockType;
  delay: number;
  meta: MockMeta;
  content: Uint8Array;
}

const AddEditMockPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const navigate = useNavigate();
  const { serviceId, mockId } = useParams();

  const [modifyingMock, setModifyingMock] = useState<ModifyingMock>({
    name: '',
    method: methods[0],
    path: '',
    type: 'STATIC',
    delay: 0,
    meta: {
      STATUS_CODE: '200'
    },
    content: new Uint8Array(0)
  });

  useEffect(() => {
    if (mockId) {
      fetchMock();
    } else {
      setLoading(false);
    }
  }, [mockId]);

  const fetchMock = async () => {
    setLoading(true);
    if (!(serviceId && mockId)) {
      setLoading(false);
      return;
    }
    try {
      const response = await getMock(+serviceId, +mockId);
      const body = response.data.body;
      setModifyingMock({
        name: body.name,
        method: body.method,
        path: body.path.slice(1),
        delay: body.delay,
        type: body.type,
        meta: body.meta,
        content: Base64.Decoder.text2array(body.content)
      });
    } catch (error) {
      console.error('Failed to fetch mock:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!serviceId) {
    navigate(contextPath);
    return;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    try {
      const mockData = {
        name: modifyingMock.name,
        method: modifyingMock.method,
        path: '/' + modifyingMock.path,
        type: modifyingMock.type,
        delay: modifyingMock.delay,
        meta: modifyingMock.meta,
        content: Base64.Encoder.array2text(modifyingMock.content)
      };
      if (mockId) {
        await updateMock(+serviceId, +mockId, mockData);
      } else {
        await createMock(+serviceId, mockData);
      }
      setSaved(true);
      if (mockId === undefined) {
        navigate(`${contextPath}service/${serviceId}/mocks`);
      }
    } catch (error) {
      console.error('Failed to submit mock:', error);
    } finally {
      setSaving(false);
    }
  };

  const navigateBack = () => {
    navigate(`${contextPath}service/${serviceId}/mocks`);
  };

  return (
    <MockForm
      loading={loading}
      modifyingMock={modifyingMock}
      setModifyingMock={setModifyingMock}
      onSubmit={handleSubmit}
      isEditMode={!!mockId}
      navigateBack={navigateBack}
      saving={saving}
      saved={saved}
    />
  );
};

export default AddEditMockPage;
