import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Alert, Button, Table } from 'react-bootstrap';
import {
  MockInvocation, getInvocation, MockInvocationDefaults,
  MultiValueMap
} from '../../../api/service';
import { Loader } from '../../../components/Loader';
import { useNavigate, useParams } from 'react-router-dom';
import { contextPath } from '../../../const/common.const';
import { ArrowLeft01Icon } from 'hugeicons-react';
import { BodyRepresentation } from './BodyRepresentation';

const MockInvocationPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [invocation, setInvocation] = useState<MockInvocation>(MockInvocationDefaults);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();
  const { serviceId, mockId, invocationId } = useParams();

  useEffect(() => {
    if (mockId) {
      fetchInvocation();
    } else {
      setLoading(false);
    }
  }, [mockId]);

  const fetchInvocation = async () => {
    if (!(serviceId && mockId && invocationId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await getInvocation(+serviceId, +mockId, +invocationId);
      if (response.data.success) {
        setInvocation(response.data.body);
      } else {
        setError('Failed to fetch invocation');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch invocation:', error);
      setError('Failed to fetch invocation');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(`${contextPath}service/${serviceId}/mocks/invocations/${mockId}`);
  };

  const renderTableRows = (map: MultiValueMap) => {
    if (!map) return <tr>
      <td colSpan={2}>N/A</td>
    </tr>;

    const entries = Object.entries(map);
    if (entries.length === 0) return <tr>
      <td colSpan={2}>N/A</td>
    </tr>;

    return entries.map(([key, value], idx) => {
      if (!value) {
        return (
          <tr key={`${key}-${idx}`}>
            <td>{key}</td>
            <td>N/A</td>
          </tr>
        );
      }

      return value.map((val, valIdx) => (
        <tr key={`${key}-${idx}-${valIdx}`}>
          {valIdx === 0 && (
            <td rowSpan={value.length}>{key}</td>
          )}
          <td>{val || 'N/A'}</td>
        </tr>
      ));
    });
  };

  return (
    <Container fluid className="mt-4 mb-4">
      <Row>
        <Col md={{ span: 1, offset: 2 }} className={'mb-2'}>
          <Button
            variant={'outline-primary'}
            type={'button'} onClick={handleBack}
            title={'Back'}
          >
            <ArrowLeft01Icon />
          </Button>
        </Col>
        <Col md={{ span: 8 }}>
          <span className={'h2'}>HTTP Mock Invocation</span>
        </Col>
      </Row>
      <Row>
        <Col md={12}>
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
                  <Row>
                    <Col md={{ offset: 1, span: 10 }}>
                      <Table striped bordered hover responsive>
                        <tbody>
                        <tr>
                          <td><strong>Remote Client Host</strong></td>
                          <td>{invocation.remoteHost || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>Remote Client Address</strong></td>
                          <td>{invocation.remoteAddress || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td><strong>HTTP Method</strong></td>
                          <td>{invocation.method}</td>
                        </tr>
                        <tr>
                          <td><strong>Request Path</strong></td>
                          <td>{invocation.path}</td>
                        </tr>
                        <tr>
                          <td><strong>Execution Timing</strong></td>
                          <td>{invocation.timing} ms</td>
                        </tr>
                        <tr>
                          <td><strong>Status Code</strong></td>
                          <td>{invocation.status}</td>
                        </tr>
                        <tr>
                          <td><strong>Invocation Date Time</strong></td>
                          <td>{invocation.createdAt}</td>
                        </tr>
                        </tbody>
                      </Table>

                      <h4 className="mt-4">Query Params</h4>
                      <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                          <th>Key</th>
                          <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {renderTableRows(invocation.queryParams)}
                        </tbody>
                      </Table>

                      <h4 className="mt-4">Request Headers</h4>
                      <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                          <th>Key</th>
                          <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {renderTableRows(invocation.rqHeaders)}
                        </tbody>
                      </Table>

                      <BodyRepresentation
                        title={'Request Body'}
                        body={invocation.rqBody}
                        headers={invocation.rqHeaders}
                        invocationId={+(invocationId || '0')}
                      />

                      <h4 className="mt-4">Response Headers</h4>
                      <Table striped bordered hover responsive>
                        <thead>
                        <tr>
                          <th>Key</th>
                          <th>Value</th>
                        </tr>
                        </thead>
                        <tbody>
                        {renderTableRows(invocation.rsHeaders)}
                        </tbody>
                      </Table>

                      <BodyRepresentation
                        title={'Response Body'}
                        body={invocation.rsBody}
                        headers={invocation.rsHeaders}
                        invocationId={+(invocationId || '0')}
                      />
                    </Col>
                  </Row>
                )}
              </>
            )}
          </Container>
        </Col>
      </Row>
    </Container>
  );
};

export default MockInvocationPage;
