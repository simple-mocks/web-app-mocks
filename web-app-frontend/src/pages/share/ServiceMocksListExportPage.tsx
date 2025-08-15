import React, { useState } from 'react';
import { ArrowLeft01Icon, Download05Icon } from 'hugeicons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { contextPath, mockTypes } from '../../const/common.const';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useServiceMocks } from './serviceMocks';
import { exportMocks } from '../../api/service';
import { CustomTable } from '@sibdevtools/frontend-common';
import { ClipboardBlock } from '../../components/clipboard/ClipboardBlock';


const ServiceMocksListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { serviceId } = useParams();
  const { service, mocks, setExportingMockHandler } = useServiceMocks(serviceId, setLoading);

  if (!serviceId) {
    navigate(contextPath);
    return;
  }

  const onSave = async () => {
    const mocksIds = mocks.filter(it => it.exporting)
      .map(it => it.mockId);
    if (!mocksIds || mocksIds.length === 0) {
      return;
    }

    const rs = await exportMocks({ mocksIds });
    if (!rs.data.success) {
      return;
    }
    const body = JSON.stringify(rs.data.body);
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(body);
    link.download = `exported-${new Date().toISOString()}.json`;
    link.click();
  };

  return (
    <Container fluid className={'mt-4 mb-4'}>
      <Row className={'mb-4'}>
        <Col md={{ span: 1, offset: 2 }}>
          <Button
            variant={'outline-primary'}
            onClick={() => navigate(`${contextPath}service/${serviceId}/mocks`)}
            title={'Back'}
          >
            <ArrowLeft01Icon />
          </Button>
        </Col>
        <Col md={6}>
          <span className={'h2'}>Export <code>{service.code}</code> Mocks</span>
        </Col>
        <Col md={{ span: 1, offset: 1 }}>
          <Button variant={'outline-primary'}
                  onClick={() => onSave()}
                  title={'Download'}
          >
            <Download05Icon />
          </Button>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
          <CustomTable
            table={{ responsive: true }}
            thead={{
              tableId: 'service-mocks-export-table',
              columns: {
                export: {
                  label: 'Export',
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
                column: 'mockId',
                direction: 'asc'
              }
            }}
            tbody={{
              data: mocks.map(mock => ({
                  mockId: mock.mockId,
                  export: {
                    representation: <Form.Check
                      type={'switch'}
                      checked={mock.exporting}
                      onChange={e => setExportingMockHandler(mock, e.target.checked)}
                    />,
                    className: 'text-center align-middle',
                  },
                  method: {
                    representation: <span className={'badge text-bg-primary align-middle'}>{mock.method}</span>,
                    className: 'text-center align-middle',
                    value: mock.method
                  },
                  name: {
                    representation: mock.name,
                    className: 'align-middle',
                    value: mock.name
                  },
                  path: {
                    representation: <ClipboardBlock value={mock.path} />,
                    value: mock.path
                  },
                  type: {
                    representation: mockTypes.get(mock.type) || mock.type,
                    className: 'text-center align-middle',
                    value: mock.type
                  },
                  enabled: {
                    representation: <Form.Check
                      type={'switch'}
                      checked={mock.enabled}
                      readOnly={true}
                    />,
                    className: 'text-center align-middle',
                  },
                })
              )
            }}
            loading={loading}
          />
        </Col>
      </Row>
    </Container>
  );
};

export default ServiceMocksListPage;
