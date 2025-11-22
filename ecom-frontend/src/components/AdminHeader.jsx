import React from 'react'
import { useNavigate } from 'react-router-dom'
import { BsFillBellFill, BsFillEnvelopeFill, BsPersonCircle, BsSearch, BsJustify } from 'react-icons/bs'

function AdminHeader({OpenSidebar}) {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdmin');
    } catch (err) {}
    navigate('/admin/login');
  };

  return (
    <header className='header'>
      <div className='menu-icon'>
        <BsJustify className='icon' onClick={OpenSidebar} />
      </div>
      <div className='header-left'>
        <BsSearch className='icon' />
      </div>
      <div className='header-right'>
        <BsFillBellFill className='icon' />
        <BsFillEnvelopeFill className='icon' />
        <BsPersonCircle className='icon' />
        <button className="admin-logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  )
}

export default AdminHeader
