import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, Router, RouterProvider } from 'react-router-dom'
import './index.css'
import Home from './home'

const router = createBrowserRouter([

  {
    path: '/',
    element:<Home/>
  },
  {
    path: '/upload',
    element:<Home/>
  },
  {
    path: '/record',
    element:<Home/>
  }

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router = {router}/>
  </StrictMode>,
)
