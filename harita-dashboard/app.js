import React, { useState } from 'https://cdn.jsdelivr.net/npm/react@18.2.0/+esm';
import ReactDOM from 'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/+esm';
import { MapContainer, TileLayer, GeoJSON } from 'https://cdn.jsdelivr.net/npm/react-leaflet@4.2.1/+esm';
import 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';

function App() {
  const [data, setData] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        setData(json);
      } catch (err) {
        console.error('Ge\u00e7ersiz JSON', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col md:flex-row h-full">
      <div className="flex-1 h-1/2 md:h-full">
        <MapContainer center={[0,0]} zoom={2} className="h-full">
          <TileLayer
            attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data && <GeoJSON data={data} />}
        </MapContainer>
      </div>
      <div className="w-full md:w-1/3 overflow-auto p-4 bg-gray-100">
        <input type="file" accept="application/json" onChange={handleFile} className="mb-4" />
        {/* Grafik bilesenleri buraya eklenebilir */}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
