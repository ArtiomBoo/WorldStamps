import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as turf from '@turf/turf';
import BottomPopup from './BottomPopup';
import './css/VisitedGlobe.css';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(enLocale);

function VisitedGlobe() {
    const [countryFeatures, setCountryFeatures] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [playOnTV, setPlayOnTV] = useState(true);
    const globeRef = useRef();

    useEffect(() => {
        Promise.all([
            fetch('/data/world.geojson').then(res => res.json()),
            fetch('/data/countries.json').then(res => res.json())
        ])
            .then(([worldData, visitData]) => {
                const visitMap = Object.fromEntries(visitData.map(d => [d.code, d]));
                console.log('Matched country codes:', Object.keys(visitMap));
                worldData.features.forEach(f => {
                    const code = f.id;
                    if (!code) return;

                    const visit = visitMap[code];

                    f.properties.visitCount = visit?.count || 0;
                    f.properties.instagram = visit?.instagram || null;
                    f.properties.youtube = visit?.youtube || [];

                    const center = turf.centroid(f);
                    f.properties.lat = center.geometry.coordinates[1];
                    f.properties.lng = center.geometry.coordinates[0];
                });

                setCountryFeatures(worldData.features);
            });
    }, []);

    useEffect(() => {
        if (countryFeatures.length > 0 && globeRef.current) {
            globeRef.current.pointOfView({ lat: 50, lng: 10, altitude: 1.5 }, 500);
        }
    }, [countryFeatures]);

    return (
        <div style={{ height: '100vh', width: '100%' }}>
            <Globe
                ref={globeRef}
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                backgroundColor="black"

                // COUNTRY POLYGONS
                polygonsData={countryFeatures}
                polygonCapColor={d => d.properties.visitCount > 0 ? "#DBB6A6" : 'rgba(255, 255, 255, 0.1)'}
                polygonSideColor={() => 'rgba(0, 0, 0, 0.05)'}
                polygonStrokeColor={() => '#111'}
                polygonsTransitionDuration={300}

                htmlElementsData={countryFeatures.filter(d => d.properties.visitCount > 0)}
                htmlLat={d => d.properties.lat}
                htmlLng={d => d.properties.lng}
                htmlElement={d => {
                    const iso2 = countries.alpha3ToAlpha2(d.id || '');
                    const el = document.createElement('div');
                    el.className = 'country-count-badge';
                    el.style.backgroundImage = `url("https://flagcdn.com/w40/${iso2.toLowerCase()}.png")`;

                    const textSpan = document.createElement('span');
                    textSpan.textContent = d.properties.visitCount;
                    textSpan.className = 'badge-text';
                    el.appendChild(textSpan);
                    return el;
                }}

                // CLICK HANDLER
                onPolygonClick={d => {
                    if (d.properties.visitCount > 0) {
                        setSelectedCountry({
                            name: d.properties.name,
                            code: d.id,
                            instagram: d.properties.instagram,
                            youtube: d.properties.youtube
                        });
                    }
                }}
            />

            {selectedCountry && (
                <BottomPopup
                    country={selectedCountry}
                    playOnTV={playOnTV}
                    onTogglePlayMode={() => setPlayOnTV(prev => !prev)}
                    onClose={() => setSelectedCountry(null)}
                />
            )}

        </div>
    );
}

export default VisitedGlobe;