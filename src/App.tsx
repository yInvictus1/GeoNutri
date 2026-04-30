/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Dashboard from './components/Dashboard';

export default function App() {
  return (
    <HashRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/estabelecimento/:id" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
}
