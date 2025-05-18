import React, { useEffect, useState } from 'react';

function AdminPanel() {
    const [visitData, setVisitData] = useState([]);
    const [newCountry, setNewCountry] = useState({
        code: '',
        count: 0,
        instagram: '',
        youtube: ''
    });

    useEffect(() => {
        fetch('/data/countries.json')
            .then(res => res.text())
            .then(text => {
                console.log("Raw response:", text);
                const data = JSON.parse(text);
                setVisitData(data);
            })
            .catch(err => console.error("Failed to load countries.json", err));
    }, []);

    const handleAddCountry = (e) => {
        e.preventDefault();

        const newEntry = {
            code: newCountry.code.trim().toUpperCase(),
            count: newCountry.count,
            instagram: newCountry.instagram.trim(),
            youtube: newCountry.youtube
                .split(',')
                .map(link => link.trim())
                .filter(link => !!link)
        };

        setVisitData(prev => [...prev, newEntry]);
        setNewCountry({ code: '', count: 0, instagram: '', youtube: '' });
    };

    const downloadJson = () => {
        const blob = new Blob([JSON.stringify(visitData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'countries.json';
        a.click();
    };

    return (
        <div>
            <h1>Admin Panel</h1>
            {visitData.map((item, index) => (
                <div key={index}>
                    <strong>{item.code}</strong> - Visits: {item.count}
                    <br />
                    Instagram: <a href={item.instagram}>{item.instagram}</a>
                    <br />
                    YouTube: {item.youtube.join(', ')}
                    <hr />
                </div>
            ))}

            <h2>Add New Country</h2>
            <form onSubmit={handleAddCountry}>
                <input
                    type="text"
                    placeholder="ISO Code (e.g. NOR)"
                    value={newCountry.code}
                    onChange={e => setNewCountry({ ...newCountry, code: e.target.value })}
                    required
                />
                <input
                    type="number"
                    placeholder="Visit Count"
                    value={newCountry.count}
                    onChange={e => setNewCountry({ ...newCountry, count: parseInt(e.target.value, 10) })}
                    required
                />
                <input
                    type="url"
                    placeholder="Instagram URL"
                    value={newCountry.instagram}
                    onChange={e => setNewCountry({ ...newCountry, instagram: e.target.value })}
                />
                <textarea
                    placeholder="YouTube URLs (comma-separated)"
                    value={newCountry.youtube}
                    onChange={e => setNewCountry({ ...newCountry, youtube: e.target.value })}
                />
                <button onClick={downloadJson}>💾 Export JSON</button>
            </form>
        </div>
    );
}

export default AdminPanel;