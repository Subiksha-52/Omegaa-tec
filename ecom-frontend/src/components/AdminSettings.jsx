import React, { useState } from 'react';

function AdminSettings() {
  const [settings, setSettings] = useState({
    storeName: 'Omegatec Shop',
    email: 'admin@omegatec.net',
    phone: '+91 99 43 991545',
    address: '22A, 7th Street, 70 Feet Road, Nggo Colony, Erode – 638009',
    currency: 'INR',
    taxRate: 18,
    shippingCost: 50
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveSettings = () => {
    // Here you would typically send the settings to the backend
    console.log('Saving settings:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <main className='main-container'>
      <div className='main-title'>
        <h3>SETTINGS</h3>
      </div>

      <div className='settings-form'>
        <div className='form-section'>
          <h4>Store Information</h4>
          <div className='form-group'>
            <label>Store Name</label>
            <input
              type='text'
              name='storeName'
              value={settings.storeName}
              onChange={handleInputChange}
            />
          </div>
          <div className='form-group'>
            <label>Email</label>
            <input
              type='email'
              name='email'
              value={settings.email}
              onChange={handleInputChange}
            />
          </div>
          <div className='form-group'>
            <label>Phone</label>
            <input
              type='text'
              name='phone'
              value={settings.phone}
              onChange={handleInputChange}
            />
          </div>
          <div className='form-group'>
            <label>Address</label>
            <textarea
              name='address'
              value={settings.address}
              onChange={handleInputChange}
              rows='3'
            />
          </div>
        </div>

        <div className='form-section'>
          <h4>Business Settings</h4>
          <div className='form-group'>
            <label>Currency</label>
            <select
              name='currency'
              value={settings.currency}
              onChange={handleInputChange}
            >
              <option value='INR'>Indian Rupee (₹)</option>
              <option value='USD'>US Dollar ($)</option>
              <option value='EUR'>Euro (€)</option>
            </select>
          </div>
          <div className='form-group'>
            <label>Tax Rate (%)</label>
            <input
              type='number'
              name='taxRate'
              value={settings.taxRate}
              onChange={handleInputChange}
              min='0'
              max='30'
            />
          </div>
          <div className='form-group'>
            <label>Shipping Cost (₹)</label>
            <input
              type='number'
              name='shippingCost'
              value={settings.shippingCost}
              onChange={handleInputChange}
              min='0'
            />
          </div>
        </div>

        <div className='form-actions'>
          <button className='btn-save' onClick={handleSaveSettings}>
            Save Settings
          </button>
        </div>
      </div>
    </main>
  );
}

export default AdminSettings;
