import React, { useState } from 'react';
import { Alert, Badge, Button, Col, Container, Form, Row } from 'react-bootstrap';
import { Exported, ExportedMock, ExportedService, importMocks } from '../../api/service';
import { ArrowLeft01Icon, Upload05Icon } from 'hugeicons-react';
import { contextPath, mockTypes } from '../../const/common.const';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomTable, Loader } from '@sibdevtools/frontend-common';
import { ClipboardBlock } from '../../components/clipboard/ClipboardBlock';


interface ImportingService {
  code: string;
  mocks: ImportingMock[];
}

interface ImportingMock extends ExportedMock {
  importing: boolean;
}

const ServiceMocksListImportPage: React.FC = () => {
  const [services, setServices] = useState<ImportingService[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();
  const { serviceId } = useParams();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as Exported;
        const services = json.services.map(service => {
          const mocks = service.mocks.map(mock => {
            return {
              ...mock,
              importing: true
            };
          });
          return {
            ...service,
            mocks
          };
        });
        setServices(services);
      } catch (error) {
        setError(`Error parsing file: ${error}`);
        console.error('Error parsing file', error);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    const importingServices: ExportedService[] = [];

    for (let service of services) {
      const mocks = service.mocks
        .filter(mock => mock.importing)
        .map(it => {
          return {
            method: it.method,
            name: it.name,
            path: it.path,
            type: it.type,
            delay: it.delay,
            enabled: it.enabled,
            content: it.content,
            contentMetadata: it.contentMetadata
          };
        });
      if (mocks.length === 0) {
        continue;
      }
      const importingService: ExportedService = {
        ...service,
        mocks: mocks
      };
      importingServices.push(importingService);
    }

    if (importingServices.length === 0) {
      return;
    }
    const rs = await importMocks({ services: importingServices });
    if (rs.data?.success) {
      setSuccess(true);
    } else {
      setSuccess(false);
      setError(`Error importing mocks: ` + rs.statusText);
    }
  };

  const setImportingMockHandler = (serviceIndex: number, mockIndex: number, importing: boolean) => {
    const updatedData = [...services];
    updatedData[serviceIndex].mocks[mockIndex].importing = importing;
    setServices(updatedData);
  };

  return (
    <Container fluid className={'mt-4 mb-4'}>
      <Row className={'mb-4'}>
        <Col md={{ span: 1, offset: 2 }}>
          <Button
            variant={'outline-primary'}
            onClick={() => navigate(serviceId ? `${contextPath}service/${serviceId}/mocks` : contextPath)}
            title={'Back'}
          >
            <ArrowLeft01Icon />
          </Button>
        </Col>
        <Col md={6}>
          <span className={'h2'}>Import Mocks</span>
        </Col>
        <Col md={{ span: 1, offset: 1 }}>
          <Button
            variant="outline-primary"
            onClick={handleImport}
            title={'Import'}
          >
            <Upload05Icon />
          </Button>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <Row className="mb-4">
            <Col md={{ span: 6, offset: 3 }}>
              <Form.Group controlId="fileUpload">
                <Form.Label>Upload Exported File</Form.Label>
                <Form.Control type="file" onChange={handleFileUpload} />
              </Form.Group>
            </Col>
          </Row>
          <Loader loading={loading}>
            {error ? (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                  {error}
                </Alert>
              ) :
              success ? (
                  <Alert variant="success" onClose={() => setSuccess(false)} dismissible>
                    Import successful
                  </Alert>
                ) :
                (
                  services.map((service, serviceIndex) => (
                    <div key={service.code}>
                      <h3>Service: {service.code}</h3>
                      <CustomTable
                        table={{ responsive: true }}
                        thead={{
                          columns: {
                            import: {
                              label: 'Import',
                              className: 'text-center'
                            },
                            method: {
                              label: 'Method',
                              sortable: true,
                              filterable: true,
                              className: 'text-center'
                            },
                            name: {
                              label: 'Name',
                              sortable: true,
                              filterable: true,
                              className: 'text-center'
                            },
                            path: {
                              label: 'Path',
                              sortable: true,
                              filterable: true,
                              className: 'text-center'
                            },
                            type: {
                              label: 'Type',
                              sortable: true,
                              filterable: true,
                              className: 'text-center'
                            },
                            enabled: {
                              label: 'Enabled',
                              className: 'text-center'
                            },
                          },
                          defaultSort: {
                            column: 'mockIndex',
                            direction: 'asc'
                          }
                        }}
                        tbody={{
                          data: service.mocks.map((mock, mockIndex) => ({
                            mockIndex: mockIndex,
                            import: {
                              representation:
                                <Form.Check
                                  type="switch"
                                  checked={mock.importing}
                                  onChange={(e) =>
                                    setImportingMockHandler(serviceIndex, mockIndex, e.target.checked)
                                  }
                                />,
                              className: 'text-center align-middle',
                            },
                            method: {
                              representation: <Badge bg="primary" className="align-middle">{mock.method}</Badge>,
                              className: 'text-center align-middle',
                              value: mock.method,
                            },
                            name: {
                              representation: mock.name,
                              className: 'align-middle',
                              value: mock.name
                            },
                            path: {
                              representation: <ClipboardBlock value={mock.path} />,
                              value: mock.path,
                            },
                            type: {
                              representation: mockTypes.get(mock.type) || mock.type,
                              className: 'text-center align-middle',
                              value: mock.type
                            },
                            enabled: {
                              representation: <Form.Check
                                type="switch"
                                checked={mock.enabled}
                                readOnly={true}
                              />,
                              className: 'text-center align-middle',
                            },
                          }))
                        }}
                      />
                    </div>
                  ))
                )}
          </Loader>
        </Col>
      </Row>
    </Container>
  );
};

export default ServiceMocksListImportPage;
