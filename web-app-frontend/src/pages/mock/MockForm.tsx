import React, { useState } from 'react';
import { Alert, Button, Col, Container, Form, InputGroup, Row, Table } from 'react-bootstrap';
import { methods, MockType, mockTypes, statusCodes } from '../../const/common.const';
import HttpHeadersForm from '../../components/HttpHeadersForm';
import StaticMockContent from '../../components/StaticMockContent';
import GraalVMMockContent from '../../components/GraalVMMockContent';
import StaticFileMockContent from '../../components/StaticFileMockContent';
import { ArrowLeft01Icon, FloppyDiskIcon, InformationCircleIcon } from 'hugeicons-react';
import { Loader } from '../../components/Loader';
import './MockForm.css';
import CodeDocumentation from './CodeDocumentation';
import SuggestiveInput from '../../components/suggestive-input/SuggestiveInput';
import { ModifyingMock } from './AddEditMockPage';

type MockFormProps = {
  loading: boolean;
  modifyingMock: ModifyingMock;
  setModifyingMock: (value: ModifyingMock) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditMode: boolean;
  saving: boolean;
  saved: boolean;
  navigateBack: () => void;
};

export const MockForm: React.FC<MockFormProps> = ({
                                                    loading,
                                                    modifyingMock,
                                                    setModifyingMock,
                                                    onSubmit,
                                                    isEditMode,
                                                    saving,
                                                    saved,
                                                    navigateBack
                                                  }) => {
  const [showPathHint, setShowPathHint] = useState(false);

  const onMockTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setModifyingMock({ ...modifyingMock, type: e.target.value as MockType });
  };

  return (
    <Container fluid className="mt-4 mb-4">
      <Row className="mb-2">
        <Col md={{ span: 1, offset: 2 }}>
          <Button
            variant="outline-primary"
            onClick={navigateBack}
            title={'Back'}
          >
            <ArrowLeft01Icon />
          </Button>
        </Col>
        <Col md={9}>
          <h2>{isEditMode ? 'Edit Mock' : 'Add Mock'}</h2>
        </Col>
      </Row>
      {loading ?
        <Loader />
        :
        <Row>
          <Col md={{ span: 10, offset: 1 }}>
            <Form className="mt-4" onSubmit={onSubmit}>
              {/* Mock Name Input */}
              <Form.Group className="mb-3" controlId="mockNameInput">
                <Row className="align-items-center">
                  <Col lg={2} md={3} sm={3}>
                    <Form.Label htmlFor={'nameInput'}>Name</Form.Label>
                  </Col>
                  <Col lg={10} md={9} sm={9} xs={12}>
                    <Form.Control
                      type="text"
                      id={'nameInput'}
                      value={modifyingMock.name}
                      onChange={(e) => setModifyingMock({ ...modifyingMock, name: e.target.value })}
                      required={true}
                      disabled={saving}
                    />
                  </Col>
                </Row>
              </Form.Group>

              {/* Method and Path Fields */}
              <Row className="mb-3">
                <Col lg={2} md={3} sm={3} xs={12}>
                  <Form.Group controlId="httpMethodSelect">
                    <Form.Label>HTTP Method</Form.Label>
                    <SuggestiveInput
                      mode={'free'}
                      value={modifyingMock.method}
                      onChange={it => setModifyingMock({ ...modifyingMock, method: it.value })}
                      required={true}
                      disabled={saving}
                      suggestions={methods.map(it => {
                        return { key: it, value: it };
                      })}
                      maxSuggestions={methods.length}
                    />
                  </Form.Group>
                </Col>

                <Col lg={10} md={9} sm={9} xs={12}>
                  <Form.Group controlId="pathInput">
                    <Form.Label htmlFor={'pathInput'}>Path</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>/</InputGroup.Text>
                      <Form.Control
                        type="text"
                        id={'pathInput'}
                        value={modifyingMock.path}
                        onChange={e => setModifyingMock({ ...modifyingMock, path: e.target.value })}
                        placeholder="Ant pattern or path"
                        required
                        disabled={saving}
                      />
                      <Button
                        onClick={() => setShowPathHint(!showPathHint)}
                        active={showPathHint}
                      >
                        <InformationCircleIcon />
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  {/* Path Hint */}
                  {showPathHint && (
                    <Row className="mb-3">
                      <Table responsive={true} hover={true}>
                        <thead>
                        <tr>
                          <th>Wildcard</th>
                          <th>Description</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                          <td><code>?</code></td>
                          <td>Matches exactly one character</td>
                        </tr>
                        <tr>
                          <td><code>*</code></td>
                          <td>Matches zero or more characters</td>
                        </tr>
                        <tr>
                          <td><code>**</code></td>
                          <td>Matches zero or more 'directories' in a path</td>
                        </tr>
                        <tr>
                          <td><code>&#123;spring:[a-z]+&#125;</code></td>
                          <td>Matches regExp <code>[a-z]+</code> as a path variable named <code>"spring"</code></td>
                        </tr>
                        </tbody>
                      </Table>
                    </Row>
                  )}
                </Col>
              </Row>

              {/* HTTP Headers */}
              <Form.Group className="mb-3">
                <Form.Label>Http Headers</Form.Label>
                <HttpHeadersForm
                  disabled={saving}
                  meta={modifyingMock.meta}
                  setMeta={it => setModifyingMock({ ...modifyingMock, meta: it })}
                />
              </Form.Group>

              {/* Status and Mock Type Fields */}
              <Row className="mb-3">
                <Col lg={4} md={12}>
                  <Form.Group controlId="statusSelect">
                    <Row className="align-items-center">
                      <Col xxl={2} lg={3}>
                        <Form.Label htmlFor={'statusSelect'}>Status</Form.Label>
                      </Col>
                      <Col xxl={10} lg={9}>
                        <SuggestiveInput
                          id={'statusSelect'}
                          type={'number'}
                          mode={'free'}
                          value={modifyingMock.meta['STATUS_CODE']}
                          onChange={it => setModifyingMock({
                            ...modifyingMock, meta: {
                              ...modifyingMock.meta,
                              STATUS_CODE: `${it.key ?? it.value}`
                            }
                          })}
                          required={true}
                          disabled={saving}
                          suggestions={Array.from(statusCodes).map(([key, value]) => {
                            return { key: `${key}`, value: `${key}: ${value}` };
                          })}
                          maxSuggestions={10}
                        />
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
                <Col lg={4} md={12}>
                  <Row className="align-items-center">
                    <Col xxl={2} lg={3}>
                      <Form.Label htmlFor={'delayInput'}>Delay</Form.Label>
                    </Col>
                    <Col xxl={10} lg={9}>
                      <InputGroup>
                        <Form.Control
                          type={'number'}
                          id={'delayInput'}
                          min={0}
                          value={`${modifyingMock.delay}`}
                          onChange={e => setModifyingMock({ ...modifyingMock, delay: +e.target.value })}
                          required={true}
                          disabled={saving}
                        />
                        <InputGroup.Text>ms</InputGroup.Text>
                      </InputGroup>
                    </Col>
                  </Row>
                </Col>
                <Col lg={4} md={12}>
                  <Form.Group controlId="modifyingMock.typeSelect">
                    <Row className="align-items-center">
                      <Col xxl={2} lg={3}>
                        <Form.Label htmlFor={'typeSelect'}>Type</Form.Label>
                      </Col>
                      <Col xxl={10} lg={9}>
                        <Form.Select
                          id={'typeSelect'}
                          value={modifyingMock.type}
                          onChange={onMockTypeChange}
                          required={true}
                          disabled={saving}
                        >
                          {
                            Array.from(mockTypes).map(
                              ([key, value]) => (
                                <option key={key} value={key}>{value}</option>
                              )
                            )
                          }
                        </Form.Select>
                      </Col>
                    </Row>
                  </Form.Group>
                </Col>
              </Row>

              {/* Content Section Based on Mock Type */}
              {modifyingMock.type === 'STATIC' && (
                <StaticMockContent
                  disabled={saving}
                  content={modifyingMock.content}
                  setContent={it => setModifyingMock({ ...modifyingMock, content: it })}
                  meta={modifyingMock.meta}
                  setMeta={it => setModifyingMock({ ...modifyingMock, meta: it })}
                  creation={!isEditMode} />
              )}

              {modifyingMock.type === 'STATIC_FILE' && <StaticFileMockContent
                disabled={saving}
                content={modifyingMock.content}
                setContent={it => setModifyingMock({ ...modifyingMock, content: it })}
                isEditMode={isEditMode}
              />}

              {(modifyingMock.type === 'JS' || modifyingMock.type === 'PYTHON') && (
                <GraalVMMockContent
                  mode={modifyingMock.type === 'JS' ? 'javascript' : 'python'}
                  disabled={saving}
                  content={modifyingMock.content}
                  setContent={it => setModifyingMock({ ...modifyingMock, content: it })}
                />
              )}

              {/* Save Button */}
              <Row className="mb-3">
                <Col className="d-flex justify-content-end">
                  <Button
                    variant="primary"
                    type="submit"
                    title={'Save'}
                    disabled={saving}
                  >
                    <FloppyDiskIcon />
                  </Button>
                </Col>
              </Row>

              {saved && (
                <Alert variant={'success'}>
                  Saved successfully.
                </Alert>
              )}

              {(modifyingMock.type === 'JS' || modifyingMock.type === 'PYTHON') && (
                <CodeDocumentation mode={modifyingMock.type === 'JS' ? 'javascript' : 'python'} />
              )}
            </Form>
          </Col>
        </Row>
      }
    </Container>
  );
};

export default MockForm;
