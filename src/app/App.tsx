import {HistoryPage} from '@pages/history';

import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import '@app/styles/index.scss';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <section>
      <HistoryPage />
    </section>
  </StrictMode>,
);
