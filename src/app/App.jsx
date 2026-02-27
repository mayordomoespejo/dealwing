import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Providers } from './Providers.jsx'
import { Layout } from './Layout.jsx'
import { Home } from '@/pages/Home.jsx'
import { NotFound } from '@/pages/NotFound.jsx'

const Saved = lazy(() => import('@/pages/Saved.jsx').then(m => ({ default: m.Saved })))

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      {
        path: 'saved',
        element: (
          <Suspense fallback={null}>
            <Saved />
          </Suspense>
        ),
      },
    ],
  },
  { path: '*', element: <NotFound /> },
])

export function App() {
  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  )
}
