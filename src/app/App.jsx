import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Providers } from './Providers.jsx'
import { Layout } from './Layout.jsx'
import { Home } from '@/pages/Home.jsx'
import { Saved } from '@/pages/Saved.jsx'
import { NotFound } from '@/pages/NotFound.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'saved', element: <Saved /> },
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
