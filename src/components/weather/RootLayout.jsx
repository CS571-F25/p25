import React from 'react'
import { Outlet } from 'react-router-dom'
import SmartWardrobeNavbar from '../layout/SmartWardrobeNavbar'

export default function RootLayout() {
  return (
    <>
      <SmartWardrobeNavbar />
      <main className="container mt-4">
        <Outlet />
      </main>
    </>
  )
}
