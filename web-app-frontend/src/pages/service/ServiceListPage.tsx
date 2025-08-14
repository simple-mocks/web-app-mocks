import React, { useEffect, useState } from 'react';
import { ButtonGroup, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import { PencilEdit01Icon, Upload05Icon } from 'hugeicons-react';
import { getAllServices, deleteService, updateService, createService, Service } from '../../api/service';
import CustomTable, { Row as TableRow } from '../../components/CustomTable';
import { Loader } from '../../components/Loader';
import { ServiceModal } from './ServiceModal';
import { contextPath } from '../../const/common.const';
import { useNavigate } from 'react-router-dom';
import { LineiconsPlus, LineiconsTrash3 } from '../../const/icons';

const ServiceListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [editService, setEditService] = useState<Service | null>(null);
  const [newServiceCode, setNewServiceCode] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'edit' | 'add'>('add');
  const [error, setError] = useState<string | null>(null);
  const [minorError, setMinorError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await getAllServices();
      if (response.data.success) {
        setServices(response.data.body);
      } else {
        setError('Failed to fetch services');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setError('Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      const response = await deleteService(serviceId);
      if (response.status !== 200 || !response.data.success) {
        setMinorError('Failed to delete service');
        return;
      }
      setServices(services.filter(it => it.serviceId != serviceId));
    } catch (error) {
      console.error('Failed to delete service:', error);
      setMinorError('Failed to delete service');
    }
  };

  const handleEditClick = (service: Service) => {
    setEditService(service);
    setNewServiceCode(service.code);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editService) {
      return;
    }
    try {
      const response = await updateService(editService.serviceId, { code: newServiceCode });
      if (response.status !== 200 || !response.data.success) {
        setMinorError('Failed to update service');
        return;
      }
      editService.code = newServiceCode;
      setShowModal(false);
    } catch (error) {
      console.error('Failed to update service:', error);
      setMinorError('Failed to update service');
    } finally {
      setShowModal(false);
    }
  };

  const handleAddClick = () => {
    setNewServiceCode('');
    setModalMode('add');
    setShowModal(true);
  };

  const handleSaveAdd = async () => {
    try {
      const response = await createService({ code: newServiceCode });
      if (response.status !== 200 || !response.data.success) {
        setMinorError('Failed to add service');
        return;
      }
      const rs = response.data.body;
      setServices([...services, {
        serviceId: rs,
        code: newServiceCode
      }]);
    } catch (error) {
      console.error('Failed to add service:', error);
      setMinorError('Failed to add service');
    } finally {
      setShowModal(false);
    }
  };

  const handleSave = async () => {
    if (modalMode === 'edit') {
      await handleSaveEdit();
    } else {
      await handleSaveAdd();
    }
  };

  const handleCodeClick = (row: TableRow) => {
    navigate(`${contextPath}service/${row.serviceId}/mocks`);
  };

  return (
    <Container className="mt-4 mb-4">
      <Row>
        <Col md={{ span: 6, offset: 3 }}>
          <span className={'h2'}>HTTP Services</span>
        </Col>
        <Col md={{ span: 1, offset: 1 }}>
          <ButtonGroup>
            <Button
              variant="outline-success"
              onClick={handleAddClick}
              title={'Add'}
            >
              <LineiconsPlus />
            </Button>
            <Button
              variant={'outline-info'}
              onClick={() => navigate(`${contextPath}service/import`)}
              title={'Import'}
            >
              <Upload05Icon />
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
      <Row>
        <Col md={{ span: 10, offset: 1 }}>
          <Container className="mt-4">
            {loading ? (
              <Loader />
            ) : (
              <>
                {error && (
                  <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                  </Alert>
                )}
                {minorError && (
                  <Alert variant="danger" onClose={() => setMinorError(null)} dismissible>
                    {minorError}
                  </Alert>
                )}
                {!error && (
                  <CustomTable
                    columns={[
                      { key: 'code', label: 'Code' },
                      { key: 'actions', label: 'Actions' },
                    ]}
                    data={services.map((service) => {
                      return {
                        serviceId: service.serviceId,
                        code: {
                          representation: <code>{service.code}</code>,
                          onClick: handleCodeClick,
                          value: service.code,
                        },
                        actions: {
                          representation:
                            <ButtonGroup>
                              <Button
                                variant={'primary'}
                                onClick={() => handleEditClick(service)}
                                title={'Edit'}
                              >
                                <PencilEdit01Icon />
                              </Button>
                              <Button
                                variant={'danger'}
                                onClick={() => handleDelete(service.serviceId)}
                                title={'Delete'}
                              >
                                <LineiconsTrash3 />
                              </Button>
                            </ButtonGroup>
                        }
                      };
                    })}
                    sortableColumns={['code']}
                    sortByDefault={{column: 'serviceId'}}
                    filterableColumns={['code']}
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

      {/* Unified Modal for Add and Edit */}
      <ServiceModal
        showModal={showModal}
        setShowModal={setShowModal}
        modalMode={modalMode}
        newServiceCode={newServiceCode}
        setNewServiceCode={setNewServiceCode}
        handleSave={handleSave}
      />
    </Container>
  );
};

export default ServiceListPage;
