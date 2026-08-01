// Interactive Campus Map & Classroom Location Pathfinder Component for Uni Vadodara

export const BUILDINGS_DATA = {
  'KSET Engineering (J-Block)': {
    code: 'J-Block',
    name: 'KSET Engineering Dept (J-Block)',
    color: '#6366F1',
    svgX: 80, svgY: 100, width: 170, height: 120,
    floors: ['Ground Floor'],
    rooms: {
      'J002': { floor: 'Ground Floor', wing: 'CSE Lecture Wing', type: 'Classroom (Division-2)', capacity: 80, path: ['Enter J-Block Main Entrance', 'Walk straight down Ground Floor Corridor', 'Room J002 is on your Right'] },
      'J001': { floor: 'Ground Floor', wing: 'CSE Lecture Wing', type: 'Classroom', capacity: 80, path: ['Enter J-Block Main Entrance', 'Turn Left at Ground Floor Corridor', 'Room J001'] },
      'J003': { floor: 'Ground Floor', wing: 'CSE Lecture Wing', type: 'Classroom', capacity: 80, path: ['Enter J-Block Main Entrance', 'Room J003 is next to J002'] }
    }
  },
  'Computer Labs (F-Block Ground)': {
    code: 'F-Block G',
    name: 'Computer Labs (F-Block Ground)',
    color: '#06B6D4',
    svgX: 420, svgY: 100, width: 180, height: 110,
    floors: ['Ground Floor'],
    rooms: {
      'F001/A1': { floor: 'Ground Floor', wing: 'Lab Wing A', type: 'DAA & Programming Lab', capacity: 35, path: ['Enter F-Block Entrance', 'Turn Left into Lab Corridor', 'Computer Lab F001/A1'] },
      'F001/B1': { floor: 'Ground Floor', wing: 'Lab Wing B', type: 'CN & SE Lab', capacity: 35, path: ['Enter F-Block Entrance', 'Walk straight to Section B', 'Computer Lab F001/B1'] },
      'F001/D2': { floor: 'Ground Floor', wing: 'Lab Wing D', type: 'Mini Project Lab', capacity: 35, path: ['Enter F-Block Entrance', 'Turn Right down Wing D', 'Computer Lab F001/D2'] }
    }
  },
  'Computer Labs (F-Block 1st Floor)': {
    code: 'F-Block 1F',
    name: 'Computer Labs (F-Block 1st Floor)',
    color: '#10B981',
    svgX: 420, svgY: 220, width: 180, height: 100,
    floors: ['1st Floor'],
    rooms: {
      'F101/A1': { floor: '1st Floor', wing: 'Lab Wing A', type: 'CN Lab', capacity: 35, path: ['Take F-Block Stairs to 1st Floor', 'Turn Left at Landing', 'Lab F101/A1'] },
      'F101/B1': { floor: '1st Floor', wing: 'Lab Wing B', type: 'Mini Project Lab', capacity: 35, path: ['Take F-Block Stairs to 1st Floor', 'Go straight into Section B', 'Lab F101/B1'] },
      'F101/C2': { floor: '1st Floor', wing: 'Lab Wing C', type: 'SE Lab', capacity: 35, path: ['Take F-Block Stairs to 1st Floor', 'Turn Right into Wing C', 'Lab F101/C2'] }
    }
  },
  'Internet Lab (F-Block 2nd Floor)': {
    code: 'F-Block 2F',
    name: 'Advanced Labs (F-Block 2nd Floor)',
    color: '#EC4899',
    svgX: 420, svgY: 330, width: 180, height: 80,
    floors: ['2nd Floor'],
    rooms: {
      'INT': { floor: '2nd Floor', wing: 'High Performance Computing', type: 'Internet Lab', capacity: 60, path: ['Take F-Block Central Stairs to 2nd Floor', 'Turn Left into High-Tech Wing', 'Internet Lab (INT)'] }
    }
  },
  'A-Block Admin & Lecture Hall': {
    code: 'A-Block',
    name: 'Admin & Auditorium Block (A-Block)',
    color: '#F59E0B',
    svgX: 80, svgY: 330, width: 170, height: 80,
    floors: ['2nd Floor'],
    rooms: {
      'M201': { floor: '2nd Floor', wing: 'Main Academic Wing', type: 'Lecture Hall', capacity: 100, path: ['Enter A-Block Main Atrium', 'Take Elevator to Floor 2', 'Lecture Room M201'] }
    }
  },
  'Central Library & Canteen': {
    code: 'Central',
    name: 'Library & Canteen Plaza',
    color: '#8B5CF6',
    svgX: 270, svgY: 210, width: 130, height: 90,
    floors: ['Ground Floor'],
    rooms: {
      'LIB': { floor: 'Ground Floor', wing: 'Central Plaza', type: 'Reading Room', capacity: 150, path: ['Enter Central Plaza Building', 'Main Library is on your left'] }
    }
  },
  'Ayurved Hospital Block': {
    code: 'Hospital',
    name: 'Matrusri Davalba Ayurved Hospital',
    color: '#EF4444',
    svgX: 270, svgY: 315, width: 130, height: 95,
    floors: ['Ground Floor'],
    rooms: {
      'OPD': { floor: 'Ground Floor', wing: 'Hospital Wing A', type: 'OPD Reception', capacity: 100, path: ['Enter Hospital Main Gate', 'OPD Registration counter is directly ahead'] }
    }
  },
  'Hostels & Sports Complex': {
    code: 'Hostel',
    name: 'KPGU Student Hostels & Grounds',
    color: '#3B82F6',
    svgX: 80, svgY: 20, width: 520, height: 60,
    floors: ['Ground Floor'],
    rooms: {
      'HOSTEL': { floor: 'Ground Floor', wing: 'Boys Hostel', type: 'Hostel Rooms Block', capacity: 200, path: ['Take North road towards hostels area', 'Hostel Block A is on the left'] }
    }
  }
};

export class CampusMapManager {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedBuilding = 'KSET Engineering (J-Block)';
    this.selectedRoom = 'J002';
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="glass-card map-visualizer-card">
        <div class="glass-card-header">
          <div class="card-title-group">
            <div class="card-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>
            </div>
            <div>
              <h3>Uni Campus & Lab Navigator</h3>
              <p class="brand-subtitle">Find classrooms, computer labs, and indoor paths</p>
            </div>
          </div>
        </div>

        <div class="map-toolbar">
          <div class="search-input-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" id="map-room-search" placeholder="Search room (e.g. J002, F001/A1, INT)...">
          </div>
          
          <select id="map-building-filter" class="form-control" style="width: auto; min-width: 170px;">
            ${Object.keys(BUILDINGS_DATA).map(b => `<option value="${b}" ${b === this.selectedBuilding ? 'selected' : ''}>${b}</option>`).join('')}
          </select>
        </div>

        <div class="svg-map-wrapper">
          <svg class="campus-svg" viewBox="0 0 700 450" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#0B101D"/>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <!-- Campus Pathway -->
            <path d="M 250 50 L 250 400 M 100 220 L 600 220 M 350 140 L 350 330" stroke="#1E293B" stroke-width="18" stroke-linecap="round"/>
            <path d="M 250 50 L 250 400 M 100 220 L 600 220 M 350 140 L 350 330" stroke="#334155" stroke-width="4" stroke-dasharray="8 8"/>
            
            <text x="250" y="430" fill="#9CA3AF" font-size="11" font-weight="bold" text-anchor="middle">Uni MAIN GATE ⬇</text>

            ${Object.entries(BUILDINGS_DATA).map(([name, b]) => {
              const isSelected = name === this.selectedBuilding;
              return `
                <g class="building-group ${isSelected ? 'active-target' : ''}" data-building="${name}">
                  <rect x="${b.svgX}" y="${b.svgY}" width="${b.width}" height="${b.height}" rx="12" 
                        fill="${b.color}" fill-opacity="${isSelected ? '0.35' : '0.15'}" 
                        stroke="${b.color}" stroke-width="${isSelected ? '3' : '1.5'}"/>
                  <text x="${b.svgX + b.width/2}" y="${b.svgY + b.height/2 - 8}" fill="#FFFFFF" font-size="12" font-weight="700" text-anchor="middle">${b.name}</text>
                  <text x="${b.svgX + b.width/2}" y="${b.svgY + b.height/2 + 10}" fill="${b.color}" font-size="11" font-weight="600" text-anchor="middle">${b.code}</text>
                  
                  ${isSelected ? `
                    <circle cx="${b.svgX + b.width/2}" cy="${b.svgY + b.height/2 + 28}" r="7" fill="#10B981">
                      <animate attributeName="r" values="5;9;5" dur="1.5s" repeatCount="indefinite"/>
                    </circle>
                  ` : ''}
                </g>
              `;
            }).join('')}
          </svg>
        </div>

        <div id="wayfinding-details-box" class="wayfinding-box">
          ${this.getWayfindingHTML()}
        </div>
      </div>
    `;

    this.attachEvents();
  }

  getWayfindingHTML() {
    const buildingInfo = BUILDINGS_DATA[this.selectedBuilding];
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
    const groups = this.container.querySelectorAll('.building-group');
    groups.forEach(g => {
      g.addEventListener('click', () => {
        this.selectedBuilding = g.getAttribute('data-building');
        const bData = BUILDINGS_DATA[this.selectedBuilding];
        if (bData && bData.rooms) {
          this.selectedRoom = Object.keys(bData.rooms)[0] || 'J002';
        }
        this.render();
      });
    });

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
