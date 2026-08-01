// Lecture Schedule & Timetable Component tailored for Uni Vadodara CSE Sem-V (BATCH A)

export const INITIAL_SCHEDULE = [
  {
    id: "kpgu-batchA-mon-1",
    subject: "Ethical Hacking",
    code: "EH",
    professor: "Ms. Hiral Patel (HP)",
    day: "Monday",
    startTime: "11:30",
    endTime: "12:25",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#6366F1",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-mon-2",
    subject: "Design & Analysis of Algorithms",
    code: "DAA",
    professor: "Ms. Nisha Parmar (NP)",
    day: "Monday",
    startTime: "12:25",
    endTime: "13:20",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#06B6D4",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-mon-3",
    subject: "Software Engineering",
    code: "SE",
    professor: "Ms. Kajal Barot (KB)",
    day: "Monday",
    startTime: "13:45",
    endTime: "14:40",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#10B981",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-mon-4",
    subject: "Fundamental of Data Science",
    code: "FODS",
    professor: "Ms. Arohi Patel (AP)",
    day: "Monday",
    startTime: "14:40",
    endTime: "15:35",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#F59E0B",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-mon-5",
    subject: "Mini Project Lab (MP-A)",
    code: "MP-A (Lab)",
    professor: "Mr. Tushar Desai (TH)",
    day: "Monday",
    startTime: "15:50",
    endTime: "17:30",
    building: "Internet Lab (F-Block 2nd Floor)",
    room: "INT",
    color: "#EC4899",
    status: "upcoming",
    notes: "Batch A Mini Project Lab in INT (2nd Floor)"
  },
  {
    id: "kpgu-batchA-tue-1",
    subject: "Formal Languages & Automation Theory",
    code: "FLAT",
    professor: "Ms. Bharati Salimath (BS)",
    day: "Tuesday",
    startTime: "11:30",
    endTime: "12:25",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#8B5CF6",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-tue-2",
    subject: "Software Engineering",
    code: "SE",
    professor: "Ms. Kajal Barot (KB)",
    day: "Tuesday",
    startTime: "12:25",
    endTime: "13:20",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#10B981",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-tue-3",
    subject: "Computer Networks",
    code: "CN",
    professor: "Dr. Shivam Upadhyay (DSU)",
    day: "Tuesday",
    startTime: "13:45",
    endTime: "14:40",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#3B82F6",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-tue-4",
    subject: "Design & Analysis of Algorithms",
    code: "DAA",
    professor: "Ms. Nisha Parmar (NP)",
    day: "Tuesday",
    startTime: "14:40",
    endTime: "15:35",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#06B6D4",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-tue-5",
    subject: "Computer Networks Lab (CN-A)",
    code: "CN-A (Lab)",
    professor: "Ms. Nisha Rajodiya (NR)",
    day: "Tuesday",
    startTime: "15:50",
    endTime: "17:30",
    building: "Computer Labs (F-Block 1st Floor)",
    room: "F101/A1",
    color: "#EC4899",
    status: "upcoming",
    notes: "Batch A CN Lab in F101/A1 (1st Floor)"
  },
  {
    id: "kpgu-batchA-wed-1",
    subject: "Computer Networks",
    code: "CN",
    professor: "Dr. Shivam Upadhyay (DSU)",
    day: "Wednesday",
    startTime: "11:30",
    endTime: "12:25",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#3B82F6",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-wed-2",
    subject: "Software Engineering",
    code: "SE",
    professor: "Ms. Kajal Barot (KB)",
    day: "Wednesday",
    startTime: "12:25",
    endTime: "13:20",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#10B981",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-wed-3",
    subject: "Design & Analysis of Algorithms",
    code: "DAA",
    professor: "Ms. Nisha Parmar (NP)",
    day: "Wednesday",
    startTime: "13:45",
    endTime: "14:40",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#06B6D4",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-wed-4",
    subject: "Fundamental of Data Science",
    code: "FODS",
    professor: "Ms. Arohi Patel (AP)",
    day: "Wednesday",
    startTime: "14:40",
    endTime: "15:35",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#F59E0B",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-wed-5",
    subject: "Formal Languages & Automation Theory",
    code: "FLAT",
    professor: "Ms. Bharati Salimath (BS)",
    day: "Wednesday",
    startTime: "15:50",
    endTime: "16:40",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#8B5CF6",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-wed-6",
    subject: "Ethical Hacking",
    code: "EH",
    professor: "Ms. Hiral Patel (HP)",
    day: "Wednesday",
    startTime: "16:40",
    endTime: "17:30",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#6366F1",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-thu-1",
    subject: "Formal Languages & Automation Theory",
    code: "FLAT",
    professor: "Ms. Bharati Salimath (BS)",
    day: "Thursday",
    startTime: "11:30",
    endTime: "12:25",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#8B5CF6",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-thu-2",
    subject: "Computer Networks",
    code: "CN",
    professor: "Dr. Shivam Upadhyay (DSU)",
    day: "Thursday",
    startTime: "12:25",
    endTime: "13:20",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#3B82F6",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-thu-3",
    subject: "Software Engineering",
    code: "SE",
    professor: "Ms. Kajal Barot (KB)",
    day: "Thursday",
    startTime: "13:45",
    endTime: "14:40",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#10B981",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-thu-4",
    subject: "Fundamental of Data Science",
    code: "FODS",
    professor: "Ms. Arohi Patel (AP)",
    day: "Thursday",
    startTime: "14:40",
    endTime: "15:35",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#F59E0B",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-thu-5",
    subject: "Software Engineering Lab (SE-A)",
    code: "SE-A (Lab)",
    professor: "Mr. Tushar Desai (TD)",
    day: "Thursday",
    startTime: "15:50",
    endTime: "17:30",
    building: "Computer Labs (F-Block 1st Floor)",
    room: "F101/C2",
    color: "#EC4899",
    status: "upcoming",
    notes: "Batch A SE Lab in F101/C2 (1st Floor)"
  },
  {
    id: "kpgu-batchA-fri-1",
    subject: "Ethical Hacking",
    code: "EH",
    professor: "Ms. Hiral Patel (HP)",
    day: "Friday",
    startTime: "11:30",
    endTime: "12:25",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#6366F1",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-fri-2",
    subject: "Design & Analysis of Algorithms",
    code: "DAA",
    professor: "Ms. Nisha Parmar (NP)",
    day: "Friday",
    startTime: "12:25",
    endTime: "13:20",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#06B6D4",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-fri-3",
    subject: "Computer Networks",
    code: "CN",
    professor: "Dr. Shivam Upadhyay (DSU)",
    day: "Friday",
    startTime: "13:45",
    endTime: "14:40",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#3B82F6",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-fri-4",
    subject: "Formal Languages & Automation Theory",
    code: "FLAT",
    professor: "Ms. Bharati Salimath (BS)",
    day: "Friday",
    startTime: "14:40",
    endTime: "15:35",
    building: "KSET Engineering (J-Block)",
    room: "J002",
    color: "#8B5CF6",
    status: "upcoming",
    notes: "Classroom J002"
  },
  {
    id: "kpgu-batchA-fri-5",
    subject: "DAA Lab (DAA-A)",
    code: "DAA-A (Lab)",
    professor: "Mr. Dharmendra Chavda (DC)",
    day: "Friday",
    startTime: "15:50",
    endTime: "17:30",
    building: "Computer Labs (F-Block Ground)",
    room: "F001/A1",
    color: "#EC4899",
    status: "upcoming",
    notes: "Batch A DAA Lab in F001/A1 (Ground Floor)"
  }
];

export class ScheduleManager {
  constructor(onNavigateCallback, onDataChangeCallback) {
    localStorage.removeItem('edupulse_schedule');
    localStorage.removeItem('kpgu_schedule_v3');

    this.schedule = this.loadFromStorage();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayIndex = new Date().getDay();
    this.selectedDay = todayIndex === 0 ? 'Monday' : days[todayIndex];
    this.onNavigate = onNavigateCallback;
    this.onDataChange = onDataChangeCallback;
    this.fetchServerData();
  }

  loadFromStorage() {
    const saved = localStorage.getItem('uni_batchA_schedule_v4');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id.includes('batchA')) {
          return parsed;
        }
      } catch (e) { console.error(e); }
    }
    return INITIAL_SCHEDULE;
  }

  saveToStorage() {
    localStorage.setItem('uni_batchA_schedule_v4', JSON.stringify(this.schedule));
    this.syncToServer();
  }

  async fetchServerData() {
    try {
      const res = await fetch('./api/schedule');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          this.schedule = data;
          localStorage.setItem('uni_batchA_schedule_v4', JSON.stringify(this.schedule));
          if (this.onDataChange) this.onDataChange();
        }
      }
    } catch (e) {
      console.warn('Server sync offline, using local storage:', e);
    }
  }

  async syncToServer() {
    try {
      await fetch('./api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.schedule)
      });
    } catch (e) {
      console.warn('Failed to sync to server:', e);
    }
  }

  getTodayClasses() {
    return this.schedule.filter(s => s.day.toLowerCase() === this.selectedDay.toLowerCase())
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }

  getNextClass() {
    const todayClasses = this.getTodayClasses();
    if (todayClasses.length === 0) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const c of todayClasses) {
      const [h, m] = c.startTime.split(':').map(Number);
      const classStartMinutes = h * 60 + m;
      const [eh, em] = c.endTime.split(':').map(Number);
      const classEndMinutes = eh * 60 + em;

      if (currentMinutes < classEndMinutes) {
        return {
          ...c,
          isLiveNow: currentMinutes >= classStartMinutes && currentMinutes <= classEndMinutes
        };
      }
    }

    return todayClasses[0];
  }

  addLecture(lecture) {
    lecture.id = 'kpgu-batchA-' + Date.now();
    this.schedule.push(lecture);
    this.saveToStorage();
    if (this.onDataChange) this.onDataChange();
  }

  deleteLecture(id) {
    this.schedule = this.schedule.filter(s => s.id !== id);
    this.saveToStorage();
    if (this.onDataChange) this.onDataChange();
  }

  resetToDefaults() {
    this.schedule = INITIAL_SCHEDULE;
    this.saveToStorage();
    if (this.onDataChange) this.onDataChange();
  }

  renderScheduleList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const classes = this.getTodayClasses();

    container.innerHTML = `
      <div class="timeline-container">
        ${classes.length === 0 ? `
          <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p style="margin-top: 0.5rem;">No lectures scheduled for ${this.selectedDay} (Holiday / Seminar)</p>
          </div>
        ` : classes.map(c => `
          <div class="timeline-item" data-id="${c.id}" style="border-left: 4px solid ${c.color || 'var(--accent-primary)'};">
            <div class="timeline-time">
              ${c.startTime} - ${c.endTime}
            </div>
            <div class="timeline-info">
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span class="timeline-subject">${c.subject}</span>
                <span style="font-size: 0.75rem; background: rgba(255,255,255,0.08); padding: 0.15rem 0.4rem; border-radius: 4px; color: ${c.color}; font-weight: 700;">${c.code}</span>
              </div>
              <div class="timeline-location">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                ${c.building} &bull; Room ${c.room} &bull; ${c.professor}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <button class="nav-to-class-btn btn-secondary" style="padding: 0.4rem 0.65rem; font-size: 0.78rem;" data-building="${c.building}" data-room="${c.room}">
                📍 Locate
              </button>
              <button class="delete-lec-btn btn-danger" data-id="${c.id}">✕</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.nav-to-class-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const b = btn.getAttribute('data-building');
        const r = btn.getAttribute('data-room');
        if (this.onNavigate) this.onNavigate(b, r);
      });
    });

    container.querySelectorAll('.delete-lec-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        this.deleteLecture(id);
        this.renderScheduleList(containerId);
      });
    });
  }
}
