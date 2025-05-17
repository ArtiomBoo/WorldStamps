import React from 'react';
import './css/BottomPopup.css';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import { FaYoutube, FaChromecast } from 'react-icons/fa';

countries.registerLocale(enLocale);

function isoToEmojiFlag(isoCode) {
    const codePoints = [...isoCode.toUpperCase()].map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
}

const castYouTubeVideo = async (youtubeUrl) => {
    try {
        const url = new URL(youtubeUrl);
        let videoId = url.searchParams.get("v");

        // Fallback for short links like https://youtu.be/abc123
        if (!videoId && url.hostname.includes("youtu.be")) {
            videoId = url.pathname.slice(1);
        }

        if (!videoId) {
            console.error("❌ Invalid YouTube URL:", youtubeUrl);
            return;
        }

        const payload = {
            entity_id: `media_player.${process.env.HA_CAST_DEVICE}`,
            media_content_id: JSON.stringify({
                app_name: "youtube",
                media_id: videoId
            }),
            media_content_type: "cast"
        };

        console.log("📤 Sending payload:", JSON.stringify(payload, null, 2));

        const res = await fetch(`${process.env.HA_URL}/api/services/media_player/play_media`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.HA_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const result = await res.text();
        console.log("✅ Home Assistant response:", result);
    } catch (err) {
        console.error("❌ Failed to cast video:", err);
    }
};

function BottomPopup({ country, onClose, playOnTV, onTogglePlayMode }) {
    const iso2 = countries.alpha3ToAlpha2(country.code || '');

    return (
        <div className="bottom-popup">
            <div className="popup-header">
                <div className="popup-title">
                    <span className="popup-flag">{iso2 ? isoToEmojiFlag(iso2) : '🌍'}</span>
                    <h2>{country.name}</h2>
                </div>

                <div className="popup-controls">
                    <label className="mode-toggle">
                        <input
                            type="checkbox"
                            checked={playOnTV}
                            onChange={onTogglePlayMode}
                        />
                        <span className={`slider-icon ${playOnTV ? 'tv' : 'youtube'}`}>
        {playOnTV ? <FaChromecast /> : <FaYoutube />}
      </span>
                    </label>

                    <button onClick={onClose}>✕</button>
                </div>
            </div>
            <div className="popup-separator"></div>

            <div className="popup-body">
                {country.instagram && (
                    <a href={country.instagram} target="_blank" rel="noopener noreferrer" className="instagram-link">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" fill="#e1306c" viewBox="0 0 50 50" style={{ verticalAlign: 'middle', marginRight: '6px' }}>
                            <path d="M 16 3 C 8.8324839 3 3 8.8324839 3 16 L 3 34 C 3 41.167516 8.8324839 47 16 47 L 34 47 C 41.167516 47 47 41.167516 47 34 L 47 16 C 47 8.8324839 41.167516 3 34 3 L 16 3 z M 16 5 L 34 5 C 40.086484 5 45 9.9135161 45 16 L 45 34 C 45 40.086484 40.086484 45 34 45 L 16 45 C 9.9135161 45 5 40.086484 5 34 L 5 16 C 5 9.9135161 9.9135161 5 16 5 z M 37 11 A 2 2 0 0 0 35 13 A 2 2 0 0 0 37 15 A 2 2 0 0 0 39 13 A 2 2 0 0 0 37 11 z M 25 14 C 18.936712 14 14 18.936712 14 25 C 14 31.063288 18.936712 36 25 36 C 31.063288 36 36 31.063288 36 25 C 36 18.936712 31.063288 14 25 14 z M 25 16 C 29.982407 16 34 20.017593 34 25 C 34 29.982407 29.982407 34 25 34 C 20.017593 34 16 29.982407 16 25 C 16 20.017593 20.017593 16 25 16 z"></path>
                        </svg>
                        View Instagram Story Highlight
                    </a>
                )}

                {country.youtube?.length > 0 && (
                    <div className="youtube-thumbnails">
                        {country.youtube.map((yt, i) => {
                            const id = yt.split('v=')[1]?.split('&')[0] ?? yt.split('/').pop();
                            const thumbnail = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;

                            return (
                                <a
                                    key={i}
                                    href={playOnTV ? undefined : yt}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => {
                                        if (playOnTV) {
                                            e.preventDefault();
                                            castYouTubeVideo(yt);
                                        }
                                    }}
                                >
                                    <img src={thumbnail} alt={`YouTube video ${i + 1}`} />
                                </a>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BottomPopup;