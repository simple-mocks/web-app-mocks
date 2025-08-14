import React, { useEffect, useState } from 'react';
import { contentTypes } from '../const/common.const';
import { Button, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { LineiconsMinus, LineiconsPlus } from '../const/icons';

interface Header {
  key: string;
  value: string;
}

interface HttpHeadersFormProps {
  meta: { [key: string]: string };
  setMeta: (newMeta: { [key: string]: string }) => void;
  disabled?: boolean;
}

const commonHeaders = [
  'Content-Type',
  'Authorization',
  'Accept',
  'Cache-Control',
  'User-Agent',
  'Accept-Encoding',
  'Host',
  'Referer',
];

const headerValueSuggestions: { [key: string]: string[] } = {
  'Content-Type': contentTypes,
  'Authorization': ['Bearer <token>', 'Basic <credentials>'],
  'Accept': ['application/json', 'text/html', 'application/xml'],
  'Cache-Control': ['no-cache', 'no-store', 'must-revalidate', 'public', 'private'],
};

const HttpHeadersForm: React.FC<HttpHeadersFormProps> = ({
                                                           meta,
                                                           setMeta,
                                                           disabled
                                                         }) => {
  const [notFilledExist, setNotFilledExist] = useState(false);

  const initialHeaders = meta['HTTP_HEADERS']
    ? JSON.parse(meta['HTTP_HEADERS'] as string)
    : {};

  const [headers, setHeaders] = useState<Header[]>(
    Object.entries(initialHeaders).length > 0
      ? Object.entries(initialHeaders).map(([key, value]) => ({ key, value: `${value}` }))
      : [{ key: '', value: '' }]
  );

  useEffect(() => {
    const initialHeaders = meta.HTTP_HEADERS ? JSON.parse(meta.HTTP_HEADERS) : {};
    const updatedHeaders = Object.entries(initialHeaders).length > 0
      ? Object.entries(initialHeaders).map(([key, value]) => ({ key, value: `${value}` }))
      : [{ key: '', value: '' }];
    setHeaders(updatedHeaders);
  }, [meta]);

  const updateMetaHeaders = (updatedHeaders: Header[]) => {
    const headersObject: { [key: string]: string } = {};
    updatedHeaders.forEach(({ key, value }) => {
      headersObject[key] = value;
    });

    const newMeta = { ...meta, HTTP_HEADERS: JSON.stringify(headersObject) };
    setMeta(newMeta);
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedHeaders = [...headers];
    updatedHeaders[index][field] = value;
    setHeaders(updatedHeaders);
    updateMetaHeaders(updatedHeaders);
  };

  const addHeader = () => {
    const updatedHeaders = [...headers, { key: '', value: '' }];
    setHeaders(updatedHeaders);
    updateMetaHeaders(updatedHeaders);
  };

  const removeHeader = (index: number) => {
    const updatedHeaders = headers.filter((_, i) => i !== index);
    setHeaders(updatedHeaders);
    updateMetaHeaders(updatedHeaders);
  };

  useEffect(() => {
    const notFilledExist = headers.filter(it => it.key === '')
      .find(it => it);
    setNotFilledExist(notFilledExist !== undefined);
  }, [headers]);

  return (
    <>
      {headers.map((header, index) => (
        <Row key={index} className="mb-3">
          {/* Header Key Input */}
          <Col md={12}>
            <Form.Group>
              <InputGroup>
                <Form.Control
                  type="text"
                  list="header-suggestions"
                  placeholder="Header Key"
                  value={header.key}
                  onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                  disabled={disabled}
                />
                <datalist id="header-suggestions">
                  {commonHeaders.map((headerName, i) => (
                    <option key={i} value={headerName} />
                  ))}
                </datalist>
                <Form.Control
                  type="text"
                  list={`value-suggestions-${index}`}
                  placeholder="Header Value"
                  value={header.value}
                  onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                  disabled={disabled}
                />
                <datalist id={`value-suggestions-${index}`}>
                  {(headerValueSuggestions[header.key] || []).map((valueSuggestion, i) => (
                    <option key={i} value={valueSuggestion} />
                  ))}
                </datalist>
                <Button
                  variant="danger"
                  onClick={() => removeHeader(index)}
                  disabled={disabled || headers.length === 1}
                  title={'Remove'}
                >
                  <LineiconsMinus />
                </Button>
                <Button
                  variant="primary"
                  onClick={addHeader}
                  disabled={disabled || index !== headers.length - 1 || notFilledExist}
                  title={'Add'}
                >
                  <LineiconsPlus />
                </Button>
              </InputGroup>
            </Form.Group>
          </Col>
        </Row>
      ))}
    </>
  );
};

export default HttpHeadersForm;
