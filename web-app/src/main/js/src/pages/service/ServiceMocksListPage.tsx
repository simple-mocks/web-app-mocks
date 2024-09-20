import React, { useEffect, useState } from 'react';
import {
  deleteMock,
  getMocksByService,
  getMockUrl,
  Mock,
  Service,
  ServiceV2,
  setEnabledMock
} from '../../api/service';
import {
  ArrowLeft01Icon,
  Copy01Icon,
  Delete01Icon,
  PencilEdit01Icon,
  PlusSignIcon
} from 'hugeicons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { contextPath } from '../../const/common.const';
import CustomTable from '../../componenets/CustomTable';


const ServiceMocksListPage: React.FC = () => {
  const [service, setService] = useState<ServiceV2>(
    { code: '', mocks: [], serviceId: 0 }
  );
  const navigate = useNavigate();
  const { serviceId } = useParams();

  useEffect(() => {
    if (!serviceId) {
      return;
    }
    fetchMocks();
  }, []);

  if (!serviceId) {
    navigate(contextPath);
    return;
  }

  const fetchMocks = async () => {
    try {
      const response = await getMocksByService(+serviceId);
      if (response.data.success) {
        setService(response.data.body);
      }
    } catch (error) {
      console.error('Failed to fetch mocks:', error);
    }
  };

  const handleDelete = async (mockId: number) => {
    if (!window.confirm('Are you sure?')) {
      return;
    }
    try {
      await deleteMock(service.serviceId, mockId);
      await fetchMocks();
    } catch (error) {
      console.error('Failed to delete mock:', error);
    }
  };

  const handleEdit = async (service: Service, mock: Mock) => {
    navigate(`${contextPath}service/${service.serviceId}/mocks/edit/${mock.mockId}`, {
      state: {
        code: service.code
      }
    });
  };

  const handleCopy = async (e: React.MouseEvent<HTMLButtonElement>, service: Service, mock: Mock) => {
    const button = e.currentTarget
    try {
      button.classList.add( 'active')
      const rs = await getMockUrl(service.serviceId, mock.mockId);
      if (rs.data.success) {
        const body = rs.data.body
        await navigator.clipboard.writeText(body);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      button.classList.remove( 'active')
    }
  };

  const handleSetEnabled = async (service: Service, mock: Mock, e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      await setEnabledMock(service.serviceId, mock.mockId, { enabled: e.target.checked });
      await fetchMocks();
    } catch (error) {
      console.error('Failed to delete mock:', error);
    }
  };

  return (
    <div className="container mt-4 mb-4">
      <div className={'row'}>
        <div className="col-md-12 ">
          <div className={'row mb-2'}>
            <div className={'col-md-1 offset-md-2 mb-2'}>
              <button type="button" className="btn btn-outline-primary" onClick={() => navigate(contextPath)}>
                <ArrowLeft01Icon />
              </button>
            </div>
            <div className={'col-md-7'}>
              <span className={'h2'}>HTTP Service {service.code} Mocks</span>
            </div>
            <div className="col-md-1 offset-md-1">
              <button className="btn btn-outline-success"
                      onClick={() => navigate(`${contextPath}service/${service.serviceId}/mocks/add`)}>
                <PlusSignIcon />
              </button>
            </div>
          </div>
          <CustomTable
            columns={[
              { key: 'method', label: 'Method' },
              { key: 'name', label: 'Name' },
              { key: 'path', label: 'Path' },
              { key: 'type', label: 'Type' },
              { key: 'enabled', label: 'Enabled' },
              { key: 'actions', label: 'Actions' },
            ]}
            data={service.mocks.map(mock => {
              return {
                method: <span className={'badge text-bg-primary align-middle'}>{mock.method}</span>,
                name: `${mock.name}`,
                path: <code>{mock.path}</code>,
                type: `${mock.type}`,
                enabled: <div className="form-check form-switch">
                  <input className="form-check-input"
                         type="checkbox"
                         checked={mock.enabled}
                         onChange={e => handleSetEnabled(service, mock, e)} />
                </div>,
                actions: <div className="btn-group" role="group">
                  <button type={'button'} className="btn btn-primary" onClick={() => handleEdit(service, mock)}>
                    <PencilEdit01Icon />
                  </button>
                  <button type={'button'}
                          className="btn btn-info"
                          onClick={(e) => handleCopy(e, service, mock)}>
                    <Copy01Icon />
                  </button>
                  <button type={'button'} className="btn btn-danger" onClick={() => handleDelete(mock.mockId)}>
                    <Delete01Icon />
                  </button>
                </div>
              }
            })}
            sortableColumns={['method', 'name', 'path', 'type']}
            filterableColumns={['method', 'name', 'path', 'type']}
            styleProps={{
              centerHeaders: true,
              textCenterValues: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ServiceMocksListPage;
