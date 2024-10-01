import React, { useEffect, useState } from 'react';
import { getAllServices, deleteService, Service } from '../../api/service';
import { Delete01Icon, PencilEdit01Icon, PlusSignIcon } from 'hugeicons-react';
import { useNavigate } from 'react-router-dom';
import { contextPath } from '../../const/common.const';
import CustomTable from '../../componenets/CustomTable';
import { Loader } from '../../componenets/Loader';


const ServiceListPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
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
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: number) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      await deleteService(serviceId);
      await fetchServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const handleEdit = async (service: Service) => {
    navigate(`${contextPath}service/edit/${service.serviceId}`, {
      state: {
        code: service.code
      }
    });
  };

  return (
    <div className="container mt-4 mb-4">
      <div className={'row'}>
        <div className="col-md-8 offset-md-1 text-center">
          <span className={'h2'}>HTTP Services</span>
        </div>
        <div className="col-md-1 offset-md-1">
          <button className="btn btn-outline-success" onClick={() => navigate(`${contextPath}service/add`)}>
            <PlusSignIcon />
          </button>
        </div>
      </div>
      <div className={'row'}>
        <div className="col-md-10 offset-md-1">
          <div className="container mt-4">
            {loading ?
              <Loader />
              :
              <CustomTable
                columns={[
                  { key: 'code', label: 'Code' },
                  { key: 'actions', label: 'Actions' },
                ]}
                data={services.map(service => {
                  return {
                    code: <a href={`service/${service.serviceId}/mocks`} className="link-primary">
                      {service.code}
                    </a>,
                    actions: <div className="btn-group" role="group">
                      <button className="btn btn-primary" onClick={() => handleEdit(service)}>
                        <PencilEdit01Icon />
                      </button>
                      <button className="btn btn-danger" onClick={() => handleDelete(service.serviceId)}>
                        <Delete01Icon />
                      </button>
                    </div>
                  }
                })}
                sortableColumns={['code']}
                filterableColumns={['code']}
                styleProps={{
                  centerHeaders: true,
                  textCenterValues: true,
                }}
              />
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceListPage;
