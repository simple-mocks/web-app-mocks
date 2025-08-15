import React, { useState } from 'react';
import {
  getMockUrl,
  Mock,
  Service,
} from '../../api/service';
import {
  ArrowLeft01Icon, Download05Icon,
  Upload05Icon
} from 'hugeicons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { contextPath, mockTypes } from '../../const/common.const';
import CustomTable from '../../components/CustomTable';
import { Button, ButtonGroup, Col, Container, Form, Row } from 'react-bootstrap';
import { useServiceMocks } from './serviceMocks';
import { ActionButtons } from './ActionButtons';
import { Loader } from '../../components/Loader';
import { LineiconsPlus } from '../../const/icons';


const ServiceMocksListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState<{ [key: number]: boolean }>({});
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { service, mocks, deleteMockHandler, setEnabledMockHandler } = useServiceMocks(serviceId, setLoading);

  if (!serviceId) {
    navigate(contextPath);
    return;
  }

  const handleEdit = async (service: Service, mock: Mock) => {
    navigate(`${contextPath}service/${service.serviceId}/mocks/edit/${mock.mockId}`);
  };

  const handleInvocations = async (service: Service, mock: Mock) => {
    navigate(`${contextPath}service/${service.serviceId}/mocks/invocations/${mock.mockId}`);
  };

  const handleCopy = async (service: Service, mock: Mock, newPage: boolean) => {
    try {
      const rs = await getMockUrl(service.serviceId, mock.mockId);
      if (!rs.data.success) {
        return;
      }
      const body = rs.data.body;
      if (newPage) {
        window?.open(body, '_blank')?.focus();
        return;
      }
      await navigator.clipboard.writeText(body);
      setShowTooltip(prev => ({ ...prev, [mock.mockId]: true }));
      setTimeout(() => {
        setShowTooltip(prev => ({ ...prev, [mock.mockId]: false }));
      }, 3000);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    }
  };

  return (
    <Container fluid className={'mt-4 mb-4'}>
      <Row>
        <Col md={12}>
          <Row className={'mb-2'}>
            <Col md={{ span: 1, offset: 2 }} className={'mb-2'}>
              <Button
                variant={'outline-primary'}
                onClick={() => navigate(contextPath)}
                title={'Back'}
              >
                <ArrowLeft01Icon />
              </Button>
            </Col>
            <Col md={6}>
              <span className={'h2'}>HTTP Service <code>{service.code}</code> Mocks</span>
            </Col>
            <Col md={{ span: 1, offset: 1 }}>
              <ButtonGroup>
                <Button
                  variant={'outline-success'}
                  onClick={() => navigate(`${contextPath}service/${service.serviceId}/mocks/add`)}
                  title={'Add'}
                >
                  <LineiconsPlus />
                </Button>
                <Button
                  variant={'outline-primary'}
                  onClick={() => navigate(`${contextPath}service/${service.serviceId}/mocks/export`)}
                  title={'Export'}
                >
                  <Download05Icon />
                </Button>
                <Button
                  variant={'outline-info'}
                  onClick={() => navigate(`${contextPath}service/${service.serviceId}/mocks/import`)}
                  title={'Import'}
                >
                  <Upload05Icon />
                </Button>
              </ButtonGroup>
            </Col>
          </Row>
          {loading ?
            <Loader />
            :
            <CustomTable
              columns={[
                { key: 'method', label: 'Method' },
                { key: 'name', label: 'Name' },
                { key: 'path', label: 'Path' },
                { key: 'type', label: 'Type' },
                { key: 'enabled', label: 'Enabled' },
                { key: 'actions', label: 'Actions' },
              ]}
              data={mocks.map(mock => {
                return {
                  mockId: mock.mockId,
                  method: {
                    representation: <span className={'badge text-bg-primary align-middle'}>{mock.method}</span>,
                    value: mock.method
                  },
                  name: mock.name,
                  path: {
                    representation: <code>{mock.path}</code>,
                    value: mock.path
                  },
                  type: mockTypes.get(mock.type) || mock.type,
                  enabled: {
                    representation: <Form.Check
                      type={'switch'}
                      checked={mock.enabled}
                      onChange={e => setEnabledMockHandler(mock, e.target.checked)}
                    />
                  },
                  actions: {
                    representation: <ActionButtons
                      mock={mock}
                      onInvocations={() => handleInvocations(service, mock)}
                      onEdit={() => handleEdit(service, mock)}
                      onCopy={(e) => handleCopy(service, mock, e.ctrlKey || e.altKey || e.shiftKey)}
                      onDelete={() => deleteMockHandler(mock)}
                      showTooltip={showTooltip}
                    />
                  }
                };
              })}
              sortableColumns={['method', 'name', 'path', 'type']}
              sortByDefault={{column: 'mockId'}}
              filterableColumns={['method', 'name', 'path', 'type']}
              styleProps={{
                centerHeaders: true,
                textCenterValues: true,
              }}
            />
          }
        </Col>
      </Row>
    </Container>
  );
};

export default ServiceMocksListPage;
