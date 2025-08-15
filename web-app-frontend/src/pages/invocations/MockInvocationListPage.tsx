import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Container, Row } from 'react-bootstrap';
import { getInvocationsByMock, MockInvocationItem } from '../../api/service';
import { useNavigate, useParams } from 'react-router-dom';
import { contextPath } from '../../const/common.const';
import { ArrowLeft01Icon } from 'hugeicons-react';
import { CustomTable } from '@sibdevtools/frontend-common';
import { CustomTableParts } from '@sibdevtools/frontend-common/dist/components/custom-table/types';
import { ClipboardBlock } from '../../components/clipboard/ClipboardBlock';

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

  const handleRowClick = (row: CustomTableParts.Row) => {
    navigate(`${contextPath}service/${serviceId}/mocks/invocations/${mockId}/${row.invocationId}`);
  };

  return (
    <Container fluid className={'mt-4 mb-4'}>
      <Row className={'mb-4'}>
        <Col md={{ span: 1, offset: 2 }}>
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
        <Col xs={{ span: 12 }}>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}
          {!error && (
            <CustomTable
              table={{ responsive: true }}
              thead={{
                columns: {
                  method: {
                    label: 'Method',
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
                  timing: {
                    label: 'Timing',
                    sortable: true,
                    filterable: true,
                    className: 'text-center'
                  },
                  status: {
                    label: 'Status',
                    sortable: true,
                    filterable: true,
                    className: 'text-center'
                  },
                  createdAt: {
                    label: 'At',
                    sortable: true,
                    filterable: true,
                    className: 'text-center'
                  },
                },
                defaultSort: {
                  column: 'createdAt',
                  direction: 'desc'
                }
              }}
              tbody={{
                data: invocations.map((invocation) => ({
                  invocationId: invocation.invocationId,
                  method: {
                    representation: <span className={'badge text-bg-primary align-middle'}>{invocation.method}</span>,
                    className: 'text-center align-middle',
                    value: invocation.method
                  },
                  path: {
                    representation: <ClipboardBlock value={invocation.path} />,
                    value: invocation.path
                  },
                  timing: {
                    representation: <code>{invocation.timing}</code>,
                    className: 'text-center align-middle',
                    value: invocation.timing
                  },
                  status: {
                    representation: <span
                      className={`badge ${getStatusBadgeStyle(invocation.status)} align-middle`}>{invocation.status}</span>,
                    className: 'text-center align-middle',
                    value: invocation.status
                  },
                  createdAt: {
                    representation: invocation.createdAt,
                    className: 'text-center align-middle',
                    value: invocation.createdAt
                  },
                })),
                rowBehavior: {
                  handler: handleRowClick
                }
              }}
              loading={loading}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default MockInvocationListPage;
