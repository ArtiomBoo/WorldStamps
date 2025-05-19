# Travel Globe + Smart Home Integration

![Globe Preview](http://artiom.no/images/projects/WorldStamps/globe_pc.png)

This was a one-day project where I decided to combine several of my favorite hobbies into a single project. I love to travel and capture everything I see — both through my FPV drone and camera. After each trip, I usually make a video to share with others. I'm also passionate about home automation. So, in this project, I brought all of these together.

## Demo
**[https://worldstamps-demo.artiom.no](https://worldstamps-demo.artiom.no)**
⚠️ Note: Casting to TV is disabled in demo mode. Switch to YouTube mode to open videos in your browser.

## The Idea

The goal was to create a local, self-hosted interactive "travel checklist" in the form of a 3D globe. When someone opens the webpage (or in my case, scans an NFC tag), they see a spinning Earth showing all the countries I've visited and how many times. Clicking a country opens a popup with links to my Instagram story highlight and YouTube videos from that location.

All links are easily configurable via the `countries.json` file.

## Features
- Interactive 3D globe showing visited countries
- Country popups with Instagram and YouTube links
- Automatic light/dark mode based on time of day
- Home Assistant integration to **cast YouTube videos directly to a TV**
- Toggle between opening YouTube in browser or casting to TV
- Designed to run smoothly even on a Raspberry Pi

![InfoScreen Preview](http://artiom.no/images/projects/WorldStamps/globe_mobile.png)

## 🛠️ Technologies Used
- React
- [react-globe.gl](https://github.com/vasturiano/react-globe.gl)
- Home Assistant API
- JSON for editable country data
- Hosted locally using `serve` or `npm start`

