import React from 'react';
import ReactDOM from 'react-dom/client';

function MiniApp() {
  const [count, setCount] = React.useState(0);
  
  return React.createElement('div', { style: { padding: '40px', textAlign: 'center' } },
    React.createElement('h1', { style: { color: '#16a34a' } }, 'Kattaqo\'rg\'on Bozori'),
    React.createElement('p', null, 'Agar bu matn ko\'rinayotgan bo\'lsa, React ishlayapti!'),
    React.createElement('button', {
      onClick: () => setCount(c => c + 1),
      style: { padding: '12px 24px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', marginTop: '20px', cursor: 'pointer' }
    }, `Bosildi: ${count} marta`),
    React.createElement('p', { style: { marginTop: '10px', color: '#666' } }, 'Telegram Desktop test versiyasi')
  );
}

try {
  const root = document.getElementById('root');
  ReactDOM.createRoot(root).render(React.createElement(React.StrictMode, null, React.createElement(MiniApp)));
} catch (e) {
  document.body.innerHTML = `<div style="color:red;padding:20px">Xatolik: ${e.message}</div>`;
}
