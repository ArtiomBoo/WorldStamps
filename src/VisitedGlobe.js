import React, { useEffect, useState, useRef } from 'react';
import Globe from 'react-globe.gl';
import * as turf from '@turf/turf';
import BottomPopup from './BottomPopup';
import './css/VisitedGlobe.css';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { MdDarkMode, MdLightMode } from 'react-icons/md';

countries.registerLocale(enLocale);

function VisitedGlobe() {
    const [countryFeatures, setCountryFeatures] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [playOnTV, setPlayOnTV] = useState(true);
    const globeRef = useRef();

    const getInitialDarkMode = () => {
        const now = new Date();
        const osloHour = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            hour12: false,
            timeZone: 'Europe/Oslo'
        }).format(now);
        const hour = parseInt(osloHour, 10);
        return hour < 7 || hour >= 19; // dark mode before 7 and after 19
    };

    //const [isDarkMode, setIsDarkMode] = useState(true); //In case you want manualy change between dark and light mode
    const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode());
    const toggleDarkMode = () => setIsDarkMode(prev => !prev);

    useEffect(() => {
        document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    }, [isDarkMode]);

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
            <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 2000,
                cursor: 'pointer',
                fontSize: '24px'
            }} onClick={toggleDarkMode}>
                {isDarkMode ? <MdDarkMode color="white" /> : <MdLightMode color="black" />}
            </div>

            <Globe
                ref={globeRef}
                globeImageUrl={isDarkMode
                    ? '//unpkg.com/three-globe/example/img/earth-night.jpg'
                    : '//unpkg.com/three-globe/example/img/earth-blue-marble.jpg'}
                backgroundColor={isDarkMode ? 'black' : '#87CEEB'}

                // COUNTRY POLYGONS
                polygonsData={countryFeatures}
                polygonCapColor={d => d.properties.visitCount > 0 ? "#DBB6A6" : 'rgba(255, 255, 255, 0.1)'}
                polygonSideColor={() => 'rgba(0, 0, 0, 0.05)'}
                polygonStrokeColor={() => '#111'}
                polygonsTransitionDuration={300}
                polygonAltitude={() => 0.005}

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
                    darkMode={isDarkMode}
                />
            )}

        </div>
    );
}

export default VisitedGlobe;