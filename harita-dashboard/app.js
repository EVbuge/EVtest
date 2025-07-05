import React, { useState, useEffect, useRef } from 'https://cdn.jsdelivr.net/npm/react@18.2.0/+esm';
import ReactDOM from 'https://cdn.jsdelivr.net/npm/react-dom@18.2.0/+esm';
import { MapContainer, TileLayer, GeoJSON } from 'https://cdn.jsdelivr.net/npm/react-leaflet@4.2.1/+esm';
import 'https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js';

function BarChart({ data }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    const chart = new Chart(canvasRef.current, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Density',
          data: data.map(d => d.value),
          backgroundColor: 'rgba(54, 162, 235, 0.5)'
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
    return () => chart.destroy();
  }, [data]);
  return <canvas ref={canvasRef} className="w-full h-48" />;
}

function PieChart({ data }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    if (!canvasRef.current || !window.Chart) return;
    const chart = new Chart(canvasRef.current, {
      type: 'pie',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(255, 205, 86, 0.5)'
          ]
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
    return () => chart.destroy();
  }, [data]);
  return <canvas ref={canvasRef} className="w-full h-48" />;
}

function App() {
  const [data, setData] = useState(null);
  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json')
      .then(r => r.json())
      .then(json => {
        setData(json);
        computeStats(json);
      })
      .catch(console.error);
  }, []);

  const computeStats = (json) => {
    if (!json.features) return;
    const sorted = [...json.features].sort((a, b) => (b.properties.density || 0) - (a.properties.density || 0));
    const top = sorted.slice(0, 5).map(f => ({ label: f.properties.name, value: f.properties.density }));
    setBarData(top);

    const cats = { Low: 0, Medium: 0, High: 0 };
    json.features.forEach(f => {
      const d = f.properties.density || 0;
      if (d < 50) cats.Low++; else if (d < 200) cats.Medium++; else cats.High++;
    });
    setPieData(Object.entries(cats).map(([label, value]) => ({ label, value })));
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        setData(json);
        computeStats(json);
      } catch (err) {
        console.error('Geçersiz JSON', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex h-full">
      <div className="w-1/4 p-4 overflow-auto bg-gray-100 space-y-4">
        <h2 className="font-bold">Density Categories</h2>
        <PieChart data={pieData} />
      </div>
      <div className="flex-1 relative">
        <MapContainer center={[41.026, 29.025]} zoom={13} className="h-full">
          <TileLayer
            attribution="&copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {data && <GeoJSON data={data} />}
        </MapContainer>
        <input type="file" accept="application/json" onChange={handleFile} className="absolute top-2 left-2 bg-white p-1" />
      </div>
      <div className="w-1/4 p-4 overflow-auto bg-gray-100 space-y-4">
        <h2 className="font-bold">Top Densities</h2>
        <BarChart data={barData} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
