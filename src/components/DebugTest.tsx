
import React from 'react';

const DebugTest = () => {
  console.log('DebugTest component rendering');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'red', 
      color: 'white', 
      fontSize: '24px',
      textAlign: 'center'
    }}>
      <h1>DEBUG: React is working!</h1>
      <p>If you see this, React is rendering components correctly.</p>
    </div>
  );
};

export default DebugTest;
