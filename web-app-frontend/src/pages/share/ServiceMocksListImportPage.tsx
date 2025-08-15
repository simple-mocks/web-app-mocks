import React, { useState } from 'react';
import { Alert, Badge, Button, Col, Container, Form, Row } from 'react-bootstrap';
import CustomTable from '../../components/CustomTable';
import { Loader } from '../../components/Loader';
import { Exported, ExportedMock, ExportedService, importMocks } from '../../api/service';
import { ArrowLeft01Icon, Upload05Icon } from 'hugeicons-react';
import { contextPath, mockTypes } from '../../const/common.const';
import { useNavigate, useParams } from 'react-router-dom';


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
    <Container fluid className="mt-4 mb-4">
      <Row className={'mb-2'}>
        <Col md={{ span: 1, offset: 2 }} className={'mb-2'}>
          <Button
            variant={'outline-primary'}
            onClick={() => navigate(serviceId ? `${contextPath}service/${serviceId}/mocks` : contextPath)}
            title={'Back'}
          >
            <ArrowLeft01Icon />
          </Button>
        </Col>
        <Col md={6}>
          <span className={'h2'}>Import HTTP Mocks</span>
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
          {loading ? (
              <Loader />
            ) :
            error ? (
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
                        columns={[
                          { key: 'import', label: 'Import' },
                          { key: 'method', label: 'Method' },
                          { key: 'name', label: 'Name' },
                          { key: 'path', label: 'Path' },
                          { key: 'type', label: 'Type' },
                          { key: 'enabled', label: 'Enabled' },
                        ]}
                        data={service.mocks.map((mock, mockIndex) => ({
                          mockIndex: mockIndex,
                          import: {
                            representation: (
                              <Form.Check
                                type="switch"
                                checked={mock.importing}
                                onChange={(e) =>
                                  setImportingMockHandler(serviceIndex, mockIndex, e.target.checked)
                                }
                              />
                            ),
                          },
                          method: {
                            representation: <Badge bg="primary" className="align-middle">{mock.method}</Badge>,
                            value: mock.method,
                          },
                          name: mock.name,
                          path: {
                            representation: <code>{mock.path}</code>,
                            value: mock.path,
                          },
                          type: mockTypes.get(mock.type) || mock.type,
                          enabled: {
                            representation: <Form.Check type="switch" checked={mock.enabled} readOnly={true} />,
                          },
                        }))}
                        sortableColumns={['method', 'name', 'path', 'type']}
                        sortByDefault={{column: 'mockIndex'}}
                        filterableColumns={['method', 'name', 'path', 'type']}
                        styleProps={{ centerHeaders: true, textCenterValues: true }}
                      />
                    </div>
                  ))
                )}
        </Col>
      </Row>
    </Container>
  );
};

export default ServiceMocksListImportPage;
