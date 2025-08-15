import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import ServiceListPage from './pages/service/ServiceListPage';
import ServiceMocksListPage from './pages/mocks/ServiceMocksListPage';
import { contextPath } from './const/common.const';
import AddMockPage from './pages/mock/AddEditMockPage';
import AddEditMockPage from './pages/mock/AddEditMockPage';
import MockInvocationListPage from './pages/invocations/MockInvocationListPage';
import { MockInvocationPage } from './pages/invocations/invocation/MockInvocationPage';
import ServiceMocksListExportPage from './pages/share/ServiceMocksListExportPage';
import ServiceMocksListImportPage from './pages/share/ServiceMocksListImportPage';


const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={contextPath}>
          <Route index element={<ServiceListPage />} />
          <Route path={'service'}>
            <Route path={':serviceId'}>
              <Route path={'mocks'}>
                <Route index element={<ServiceMocksListPage />} />
                <Route path={'add'} element={<AddMockPage />} />
                <Route path={'edit'}>
                  <Route path={':mockId'} element={<AddEditMockPage />} />
                </Route>
                <Route path={'invocations'}>
                  <Route path={':mockId'}>
                    <Route index element={<MockInvocationListPage />} />
                    <Route path={':invocationId'} element={<MockInvocationPage />} />
                  </Route>
                </Route>
                <Route path={'export'} element={<ServiceMocksListExportPage />} />
                <Route path={'import'} element={<ServiceMocksListImportPage />} />
              </Route>
            </Route>
            <Route path={'import'} element={<ServiceMocksListImportPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
