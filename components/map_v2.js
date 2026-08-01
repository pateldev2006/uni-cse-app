// Interactive Campus Map & Classroom Location Pathfinder Component for Uni Vadodara
// v2 - Google Maps Integrated with dynamic classroom locating

export const BUILDINGS_DATA = {
  'J-Block': {
    code: 'J-Block',
    name: 'KSET Engineering Dept (J-Block)',
    color: '#6366F1',
    mapQuery: '22.169420,73.188820', // J-Block Engineering coordinates
    floors: ['Ground Floor'],
    rooms: {
      'J002': { floor: 'Ground Floor', wing: 'CSE Lecture Wing', type: 'Classroom (Division-2)', capacity: 80, path: ['Enter J-Block Main Entrance', 'Walk straight down Ground Floor Corridor', 'Room J002 is on your Right'] },
      'J001': { floor: 'Ground Floor', wing: 'CSE Lecture Wing', type: 'Classroom', capacity: 80, path: ['Enter J-Block Main Entrance', 'Turn Left at Ground Floor Corridor', 'Room J001'] },
      'J003': { floor: 'Ground Floor', wing: 'CSE Lecture Wing', type: 'Classroom', capacity: 80, path: ['Enter J-Block Main Entrance', 'Room J003 is next to J002'] }
    }
  },
  'Computer Labs': {
    code: 'F-Block Labs',
    name: 'Computer Labs (F-Block)',
    color: '#06B6D4',
    mapQuery: '22.168950,73.190100', // F-Block Computer Labs coordinates
    floors: ['Ground Floor', '1st Floor'],
    rooms: {
      'F001/A1': { floor: 'Ground Floor', wing: 'Lab Wing A', type: 'DAA & Programming Lab', capacity: 35, path: ['Enter F-Block Entrance', 'Turn Left into Lab Corridor', 'Computer Lab F001/A1'] },
      'F001/B1': { floor: 'Ground Floor', wing: 'Lab Wing B', type: 'CN & SE Lab', capacity: 35, path: ['Enter F-Block Entrance', 'Walk straight to Section B', 'Computer Lab F001/B1'] },
      'F001/D2': { floor: 'Ground Floor', wing: 'Lab Wing D', type: 'Mini Project Lab', capacity: 35, path: ['Enter F-Block Entrance', 'Turn Right down Wing D', 'Computer Lab F001/D2'] },
      'F101/A1': { floor: '1st Floor', wing: 'Lab Wing A', type: 'CN Lab', capacity: 35, path: ['Take F-Block Stairs to 1st Floor', 'Turn Left at Landing', 'Lab F101/A1'] },
      'F101/B1': { floor: '1st Floor', wing: 'Lab Wing B', type: 'Mini Project Lab', capacity: 35, path: ['Take F-Block Stairs to 1st Floor', 'Go straight into Section B', 'Lab F101/B1'] },
      'F101/C2': { floor: '1st Floor', wing: 'Lab Wing C', type: 'SE Lab', capacity: 35, path: ['Take F-Block Stairs to 1st Floor', 'Turn Right into Wing C', 'Lab F101/C2'] }
    }
  },
  'Internet Lab': {
    code: 'F-Block 2F',
    name: 'Advanced Labs (F-Block 2nd Floor)',
    color: '#EC4899',
    mapQuery: '22.168950,73.190100', // F-Block 2nd floor (same location)
    floors: ['2nd Floor'],
    rooms: {
      'INT': { floor: '2nd Floor', wing: 'High Performance Computing', type: 'Internet Lab', capacity: 60, path: ['Take F-Block Central Stairs to 2nd Floor', 'Turn Left into High-Tech Wing', 'Internet Lab (INT)'] }
    }
  },
  'A-Block': {
    code: 'A-Block',
    name: 'Admin & Auditorium Block (A-Block)',
    color: '#F59E0B',
    mapQuery: '22.168500,73.189100', // Admin block coordinates
    floors: ['2nd Floor'],
    rooms: {
      'M201': { floor: '2nd Floor', wing: 'Main Academic Wing', type: 'Lecture Hall', capacity: 100, path: ['Enter A-Block Main Atrium', 'Take Elevator to Floor 2', 'Lecture Room M201'] }
    }
  },
  'Central': {
    code: 'Central',
    name: 'Library & Canteen Plaza',
    color: '#8B5CF6',
    mapQuery: '22.169150,73.189400', // Central Library coordinates
    floors: ['Ground Floor'],
    rooms: {
      'LIB': { floor: 'Ground Floor', wing: 'Central Plaza', type: 'Reading Room', capacity: 150, path: ['Enter Central Plaza Building', 'Main Library is on your left'] }
    }
  },
  'Hospital': {
    code: 'Hospital',
    name: 'Matrusri Davalba Ayurved Hospital',
    color: '#EF4444',
    mapQuery: '22.168100,73.189500', // Hospital coordinates
    floors: ['Ground Floor'],
    rooms: {
      'OPD': { floor: 'Ground Floor', wing: 'Hospital Wing A', type: 'OPD Reception', capacity: 100, path: ['Enter Hospital Main Gate', 'OPD Registration counter is directly ahead'] }
    }
  },
  'Hostel': {
    code: 'Hostel',
    name: 'KPGU Student Hostels & Grounds',
    color: '#3B82F6',
    mapQuery: '22.170500,73.189500', // Hostels coordinates
    floors: ['Ground Floor'],
    rooms: {
      'HOSTEL': { floor: 'Ground Floor', wing: 'Boys Hostel', type: 'Hostel Rooms Block', capacity: 200, path: ['Take North road towards hostels area', 'Hostel Block A is on the left'] }
    }
  }
};

export class CampusMapManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedBuilding = 'J-Block';
    this.selectedRoom = 'J002';
  }

  render() {
    if (!this.container) return;

    const buildingInfo = BUILDINGS_DATA[this.selectedBuilding] || BUILDINGS_DATA['J-Block'];
    const mapQuery = buildingInfo.mapQuery;

    this.container.innerHTML = `
      <div class="glass-card map-visualizer-card">
        <div class="glass-card-header">
          <div class="card-title-group">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
            </div>
            <div>
              <h3>Uni Campus & Lab Locator</h3>
              <p class="brand-subtitle">Google Maps Navigation + Indoor Path Finder</p>
            </div>
          </div>
        </div>

        <div class="map-toolbar">
          <div class="search-input-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="map-room-search" placeholder="Search room (e.g. J002, F001/A1, INT)...">
          </div>
          
          <select id="map-building-filter" class="form-control" style="width: auto; min-width: 170px;">
            ${Object.keys(BUILDINGS_DATA).map(b => `<option value="${b}" ${b === this.selectedBuilding ? 'selected' : ''}>${BUILDINGS_DATA[b].name}</option>`).join('')}
          </select>
        </div>

        <!-- Current Building Name -->
        <div style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-md); padding: 0.6rem 0.8rem; margin-bottom: 0.8rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.4rem;">
            <span style="font-size: 1.1rem;">📍</span>
            <span style="font-size: 0.8rem; font-weight: 700; color: white;">${buildingInfo.name}</span>
          </div>
          <a href="https://www.google.com/maps/search/?api=1&query=${mapQuery}" target="_blank" class="btn-primary" style="font-size: 0.72rem; padding: 0.35rem 0.6rem; text-decoration: none; display: flex; align-items: center; gap: 0.3rem;">
            🗺️ Open App directions
          </a>
        </div>

        <!-- Google Maps Embed Card -->
        <div class="google-map-wrapper" style="width: 100%; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-glass); margin-bottom: 1.2rem; height: 320px; position: relative;">
          <iframe 
            src="https://maps.google.com/maps?q=${mapQuery}&z=19&ie=UTF8&iwloc=&output=embed" 
            width="100%" 
            height="100%" 
            style="border:0; background: #0b101d;" 
            allowfullscreen="" 
            loading="lazy" 
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>
        </div>

        <div id="wayfinding-details-box" class="wayfinding-box">
          ${this.getWayfindingHTML()}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  getWayfindingHTML() {
    const buildingInfo = BUILDINGS_DATA[this.selectedBuilding] || BUILDINGS_DATA['J-Block'];
    if (!buildingInfo) return '<p class="text-muted">Select a location to view directions</p>';

    const roomInfo = buildingInfo.rooms[this.selectedRoom] || Object.values(buildingInfo.rooms)[0] || {
      floor: 'Ground Floor',
      wing: 'CSE Wing',
      type: 'Classroom',
      capacity: 60,
      path: ['Enter Building', 'Follow room signs']
    };

    return `
      <div class="direction-info-card">
        <h4 style="font-family: var(--font-title); font-size: 0.95rem; font-weight: 700; margin-bottom: 0.6rem; display: flex; align-items: center; gap: 0.4rem; color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
          Room Path: ${this.selectedRoom} (${roomInfo.floor})
        </h4>
        
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 0.8rem; font-size: 0.76rem; color: var(--text-muted); border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 0.5rem;">
          <span><strong>Wing:</strong> ${roomInfo.wing}</span>
          <span><strong>Type:</strong> ${roomInfo.type}</span>
          <span><strong>Capacity:</strong> ${roomInfo.capacity} Students</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          ${roomInfo.path.map((step, idx) => `
            <div class="direction-step">
              <div class="step-num">${idx + 1}</div>
              <div class="step-text">${step}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  attachEvents() {
    const selectEl = this.container.querySelector('#map-building-filter');
    if (selectEl) {
      selectEl.addEventListener('change', (e) => {
        this.selectedBuilding = e.target.value;
        const bData = BUILDINGS_DATA[this.selectedBuilding];
        if (bData && bData.rooms) {
          this.selectedRoom = Object.keys(bData.rooms)[0] || 'J002';
        }
        this.render();
      });
    }

    const searchInput = this.container.querySelector('#map-room-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) return;

        for (const [bName, bData] of Object.entries(BUILDINGS_DATA)) {
          if (bName.toLowerCase().includes(query)) {
            this.selectedBuilding = bName;
            this.render();
            break;
          }
          for (const rNum of Object.keys(bData.rooms)) {
            if (rNum.toLowerCase().includes(query)) {
              this.selectedBuilding = bName;
              this.selectedRoom = rNum;
              this.render();
              return;
            }
          }
        }
      });
    }
  }

  highlightLocation(building, room) {
    if (BUILDINGS_DATA[building]) {
      this.selectedBuilding = building;
      this.selectedRoom = room;
      this.render();
    }
  }
}
