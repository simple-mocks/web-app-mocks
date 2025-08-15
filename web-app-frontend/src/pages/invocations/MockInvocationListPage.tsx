import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import {
  MockInvocationItem, getInvocationsByMock
} from '../../api/service';
import CustomTable from '../../components/CustomTable';
import { Row as TableRow } from '../../components/CustomTable';
import { Loader } from '../../components/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import { contextPath } from '../../const/common.const';
import { ArrowLeft01Icon } from 'hugeicons-react';

const MockInvocationListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [invocations, setInvocations] = useState<MockInvocationItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { serviceId, mockId } = useParams();

  useEffect(() => {
    if (mockId) {
      fetchInvocations();
    } else {
      setLoading(false);
    }
  }, [mockId]);

  const fetchInvocations = async () => {
    if (!(serviceId && mockId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getInvocationsByMock(+serviceId, +mockId, 0, 30);
      if (response.data.success) {
        setInvocations(response.data.body.invocations);
      } else {
        setError('Failed to fetch invocations');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch invocations:', error);
      setError('Failed to fetch invocations');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeStyle = (status: number) => {
    if (status >= 100 && status < 200) {
      return 'text-bg-info';
    }
    if (status >= 200 && status < 300) {
      return 'text-bg-success';
    }
    if (status >= 300 && status < 400) {
      return 'text-bg-primary';
    }
    if (status >= 400 && status < 500) {
      return 'text-bg-warning';
    }
    if (status >= 500) {
      return 'text-bg-danger';
    }
    return 'text-bg-secondary';
  };

  const handleBack = () => {
    navigate(`${contextPath}service/${serviceId}/mocks`);
  };

  const handleRowClick = (row: TableRow) => {
    navigate(`${contextPath}service/${serviceId}/mocks/invocations/${mockId}/${row.invocationId}`);
  };

  return (
    <Container fluid className="mt-4 mb-4">
      <Row>
        <Col md={{ span: 1, offset: 2 }} className={'mb-2'}>
          <Button
            variant={'outline-primary'}
            type={'button'}
            onClick={handleBack}
            title={'Back'}
          >
            <ArrowLeft01Icon />
          </Button>
        </Col>
        <Col md={{ span: 8 }}>
          <span className={'h2'}>HTTP Mock Invocations</span>
        </Col>
      </Row>
      <Row>
        <Col md={{ span: 12 }}>
          <Container fluid className="mt-4">
            {loading ? (
              <Loader />
            ) : (
              <>
                {error && (
                  <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                  </Alert>
                )}
                {!error && (
                  <CustomTable
                    columns={[
                      { key: 'method', label: 'Method' },
                      { key: 'path', label: 'Path' },
                      { key: 'timing', label: 'Timing' },
                      { key: 'status', label: 'Status' },
                      { key: 'createdAt', label: 'At' },
                    ]}
                    data={invocations.map((invocation) => {
                      return {
                        invocationId: invocation.invocationId,
                        method: {
                          representation: <span
                            className={'badge text-bg-primary align-middle'}>{invocation.method}</span>,
                          value: invocation.method
                        },
                        path: {
                          representation: <code>{invocation.path}</code>,
                          value: invocation.path
                        },
                        timing: {
                          representation: <code>{invocation.timing}</code>,
                          value: invocation.timing
                        },
                        status: {
                          representation: <span
                            className={`badge ${getStatusBadgeStyle(invocation.status)} align-middle`}>{invocation.status}</span>,
                          value: invocation.status
                        },
                        createdAt: invocation.createdAt,
                      };
                    })}
                    onRowClick={handleRowClick}
                    sortableColumns={['method', 'path', 'timing', 'status', 'createdAt']}
                    sortByDefault={{column: 'createdAt', direction: 'desc'}}
                    filterableColumns={['method', 'path', 'timing', 'status', 'createdAt']}
                    styleProps={{
                      centerHeaders: true,
                      textCenterValues: true,
                    }}
                  />
                )}
              </>
            )}
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default MockInvocationListPage;
