import React from 'react'
import
{BsCart3, BsGrid1X2Fill, BsFillArchiveFill, BsFillGrid3X3GapFill, BsPeopleFill,
  BsListCheck, BsMenuButtonWideFill, BsFillGearFill, BsTruck}
 from 'react-icons/bs'

function AdminSidebar({openSidebarToggle, OpenSidebar, onNavigate, currentView}) {
  const handleNavigation = (view) => {
    onNavigate(view);
  };

  const isActive = (view) => currentView === view ? 'active' : '';

  return (
    <aside id="sidebar" className={openSidebarToggle ? "sidebar-responsive": ""}>
        <div className='sidebar-title'>
            <div className='sidebar-brand'>
                <BsCart3  className='icon_header'/> SHOP
            </div>
            <span className='icon close_icon' onClick={OpenSidebar}>X</span>
        </div>

        <ul className='sidebar-list'>
            <li className={`sidebar-list-item ${isActive('dashboard')}`}>
                <button className="sidebar-link-button" onClick={() => handleNavigation('dashboard')}>
                    <BsGrid1X2Fill className='icon'/> Dashboard
                </button>
            </li>
            <li className={`sidebar-list-item ${isActive('products')}`}>
                <button className="sidebar-link-button" onClick={() => handleNavigation('products')}>
                    <BsFillArchiveFill className='icon'/> Products
                </button>
            </li>
            <li className={`sidebar-list-item ${isActive('categories')}`}>
                <button className="sidebar-link-button" onClick={() => handleNavigation('categories')}>
                    <BsFillGrid3X3GapFill className='icon'/> Categories
                </button>
            </li>
            <li className={`sidebar-list-item ${isActive('customers')}`}>
                <button className="sidebar-link-button" onClick={() => handleNavigation('customers')}>
                    <BsPeopleFill className='icon'/> Customers
                </button>
            </li>
            <li className={`sidebar-list-item ${isActive('inventory')}`}>
                <button className="sidebar-link-button" onClick={() => handleNavigation('inventory')}>
                    <BsListCheck className='icon'/> Inventory
                </button>
            </li>

            <li className={`sidebar-list-item ${isActive('reports')}`}>
                <button className="sidebar-link-button" onClick={() => handleNavigation('reports')}>
                    <BsMenuButtonWideFill className='icon'/> Reports
                </button>
            </li>
            <li className={`sidebar-list-item ${isActive('settings')}`}>
                <button className="sidebar-link-button" onClick={() => handleNavigation('settings')}>
                    <BsFillGearFill className='icon'/> Setting
                </button>
            </li>
        </ul>
    </aside>
  )
}

export default AdminSidebar
