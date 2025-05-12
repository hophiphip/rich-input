import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import TemplateBuilderExample from './template-builder'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TemplateBuilderExample />
  </StrictMode>,
)
