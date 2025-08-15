import React, { useState } from 'react';
import {
  ArrowLeft01Icon, Download05Icon
} from 'hugeicons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { contextPath, mockTypes } from '../../const/common.const';
import CustomTable from '../../components/CustomTable';
import { Button, Col, Container, Form, Row } from 'react-bootstrap';
import { useServiceMocks } from './serviceMocks';
import { Loader } from '../../components/Loader';
import { exportMocks } from '../../api/service';


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
      <Row>
        <Col md={12}>
          <Row className={'mb-2'}>
            <Col md={{ span: 1, offset: 2 }} className={'mb-2'}>
              <Button
                variant={'outline-primary'}
                onClick={() => navigate(`${contextPath}service/${serviceId}/mocks`)}
                title={'Back'}
              >
                <ArrowLeft01Icon />
              </Button>
            </Col>
            <Col md={6}>
              <span className={'h2'}>Export HTTP Service <code>{service.code}</code> Mocks</span>
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
          {loading ?
            <Loader />
            :
            <CustomTable
              columns={[
                { key: 'export', label: 'Export' },
                { key: 'method', label: 'Method' },
                { key: 'name', label: 'Name' },
                { key: 'path', label: 'Path' },
                { key: 'type', label: 'Type' },
                { key: 'enabled', label: 'Enabled' },
              ]}
              data={mocks.map(mock => {
                return {
                  mockId: mock.mockId,
                  export: {
                    representation: <Form.Check
                      type={'switch'}
                      checked={mock.exporting}
                      onChange={e => setExportingMockHandler(mock, e.target.checked)}
                    />
                  },
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
                      readOnly={true}
                    />
                  },
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
