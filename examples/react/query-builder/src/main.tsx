import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import QueryBuilderExample from './query-builder'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryBuilderExample />
  </StrictMode>,
)
