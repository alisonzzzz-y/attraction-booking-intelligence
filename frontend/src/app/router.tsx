import { createBrowserRouter } from 'react-router-dom'
import { App } from './App'
import { HomePage } from './HomePage'
import { MapPreviewPage } from './MapPreviewPage'
import { MethodologyPage } from './MethodologyPage'
import { PlanPage } from './PlanPage'
import { ResultsPage } from './ResultsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'map-preview',
        element: <MapPreviewPage />,
      },
      {
        path: 'methodology',
        element: <MethodologyPage />,
      },
      {
        path: 'plan',
        element: <PlanPage />,
      },
      {
        path: 'results',
        element: <ResultsPage />,
      },
    ],
  },
])
