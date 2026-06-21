/**
 * DEADLINE BUDDY AI - SMART ASSIGNMENT COMMAND CENTER
 * ES6+ Vanilla JavaScript Core Logic
 */

// ==========================================================================
// 1. STATE & DATA MODELS
// ==========================================================================

// Default Subjects list if none in localStorage
const DEFAULT_SUBJECTS = [
  { id: "sub-cs", name: "Computer Science", color: "#00f2fe" }, // Teal
  { id: "sub-math", name: "Mathematics", color: "#ff5e62" },   // Coral
  { id: "sub-phy", name: "Physics", color: "#ff9f1c" },       // Amber
  { id: "sub-lit", name: "Literature", color: "#a5b4fc" },    // Light Indigo
  { id: "sub-chem", name: "Chemistry", color: "#00f5d4" }     // Neon Mint
];

// Default Sample Assignments to showcase dashboard instantly
const DEFAULT_ASSIGNMENTS = [
  {
    id: "assign-1",
    title: "AI Neural Network Training Lab",
    subjectId: "sub-cs",
    difficulty: 3, // Hard
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Due in 4 hours
    desc: "Train a convolutional neural network on MNIST dataset and write a 2-page analysis report on accuracy constraints. Submit via LMS.",
    completed: false
  },
  {
    id: "assign-2",
    title: "Linear Algebra Homework 3",
    subjectId: "sub-math",
    difficulty: 2, // Medium
    dueDate: new Date(Date.now() + 42 * 60 * 60 * 1000).toISOString(), // Due in 1.75 days
    desc: "Solve chapter 5 problems on Eigenvalues and Eigenvectors. Hand in physical copy before lecture.",
    completed: false
  },
  {
    id: "assign-3",
    title: "Thermodynamics Simulation Lab",
    subjectId: "sub-phy",
    difficulty: 2, // Medium
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // Due in 5 days
    desc: "Simulate Carnot engine cycles in Jupyter Notebook. Export graphs and upload code to GitHub repository.",
    completed: false
  },
  {
    id: "assign-4",
    title: "Shakespeare Essay First Draft",
    subjectId: "sub-lit",
    difficulty: 1, // Easy
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // Due in 10 days
    desc: "Draft a 1000-word analysis on Hamlet's themes of existential delay. Peer review in class next Friday.",
    completed: true // Showcase completed state
  },
  {
    id: "assign-5",
    title: "Organic Synthesis Worksheet",
    subjectId: "sub-chem",
    difficulty: 1, // Easy
    dueDate: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // Overdue by 3 hours
    desc: "Draw reaction mechanisms for Benzene derivatives. (Demo of overdue logic penalty).",
    completed: false
  }
];

// Motivational Productivity Quotes
const PRODUCTIVITY_QUOTES = [
  { text: "Small progress every day leads to big results.", author: "Anonymous" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Your future self will thank you for the work you do today.", author: "Anonymous" },
  { text: "Deep work is the superpower of the 21st century.", author: "Cal Newport" },
  { text: "Done is better than perfect. Start now.", author: "Sheryl Sandberg" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Tomorrow is the only day that appeals to a lazy man.", author: "Jimmy Lyons" }
];

// App State Cache
let subjects = JSON.parse(localStorage.getItem("db_subjects")) || [];
let assignments = JSON.parse(localStorage.getItem("db_assignments")) || [];
let currentTheme = localStorage.getItem("db_theme") || "dark";
let authUser = JSON.parse(localStorage.getItem("db_auth_user")) || null;
let studentName = authUser ? authUser.name : "Developer Student";

// Check if we need to load defaults
if (subjects.length === 0) {
  subjects = [...DEFAULT_SUBJECTS];
  localStorage.setItem("db_subjects", JSON.stringify(subjects));
}
if (assignments.length === 0 && localStorage.getItem("db_has_used_before") === null) {
  assignments = [...DEFAULT_ASSIGNMENTS];
  localStorage.setItem("db_assignments", JSON.stringify(assignments));
  localStorage.setItem("db_has_used_before", "true");
}

// ==========================================================================
// 2. APP INITIALIZATION & THEME MANAGER
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  setupEventListeners();
  renderQuote();
  updateTime();
  setInterval(updateTime, 1000); // Clock tick
  setInterval(runRealtimeCountdown, 1000); // Priority countdown tick
  
  // Dynamic SPA routing boot
  if (authUser) {
    refreshStudentProfile();
    showView("view-dashboard");
  } else {
    showView("view-landing");
  }

  // Initial DOM loads for dashboard prep
  populateSubjectDropdowns();
  renderSubjectsList();
  renderDashboard();
  
  // Re-run icons compiler
  lucide.createIcons();
});

// Theme Setup
function initTheme() {
  document.documentElement.setAttribute("data-theme", currentTheme);
  const themeToggles = document.querySelectorAll(".theme-toggle-btn");
  
  themeToggles.forEach(btn => {
    btn.addEventListener("click", () => {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", currentTheme);
      localStorage.setItem("db_theme", currentTheme);
    });
  });
}

// SPA Routing Views Manager
function showView(viewId) {
  document.querySelectorAll(".app-view").forEach(view => {
    view.classList.add("hidden");
  });
  const targetView = document.getElementById(viewId);
  if (targetView) {
    targetView.classList.remove("hidden");
  }
}

// Profile UI Greet Updater
function refreshStudentProfile() {
  const nameEl = document.getElementById("student-name");
  const initialsEl = document.getElementById("avatar-initials");
  
  const currentAuthUser = JSON.parse(localStorage.getItem("db_auth_user"));
  if (currentAuthUser) {
    const sName = currentAuthUser.name;
    if (nameEl) nameEl.textContent = sName;
    if (initialsEl) {
      const parts = sName.trim().split(/\s+/);
      const initials = parts.map(p => p[0]).join("").substring(0, 2).toUpperCase();
      initialsEl.textContent = initials || "ST";
    }
  }
}

// ==========================================================================
// 3. DATE/TIME & QUOTE ENGINES
// ==========================================================================

function updateTime() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateStr = now.toLocaleDateString('en-US', dateOptions);
  
  document.getElementById("current-time").textContent = timeStr;
  document.getElementById("current-date-text").textContent = dateStr;
}

function renderQuote() {
  const quoteEl = document.getElementById("motivational-quote");
  const authorEl = document.getElementById("quote-author");
  
  const randomIndex = Math.floor(Math.random() * PRODUCTIVITY_QUOTES.length);
  const quote = PRODUCTIVITY_QUOTES[randomIndex];
  
  quoteEl.textContent = `"${quote.text}"`;
  authorEl.textContent = `— ${quote.author}`;
}

// ==========================================================================
// 4. DYNAMIC PRIORITY ENGINE & SCHEDULER
// ==========================================================================

/**
 * Calculates the Urgency Score of an assignment (0 to 100+)
 * Formula:
 * Urgency = Time Factor + Difficulty Weight
 * - Overdue: 100+ points
 * - Due <= 24 hrs: Base 80-99 points depending on proximity
 * - Due <= 3 days: Base 50-79 points
 * - Due <= 7 days: Base 20-49 points
 * - Due > 7 days: Base 0-19 points
 * - Completed: 0 points
 */
function calculateUrgencyScore(assignment) {
  if (assignment.completed) {
    return 0;
  }

  const now = new Date();
  const due = new Date(assignment.dueDate);
  const diffTimeMs = due - now;
  const diffHours = diffTimeMs / (1000 * 60 * 60);
  const diffDays = diffHours / 24;

  let baseScore = 0;

  if (diffHours <= 0) {
    // Overdue tasks
    baseScore = 100 + Math.abs(diffHours); // Higher score the longer it's overdue
  } else if (diffHours <= 24) {
    // Due today
    baseScore = 80 + ((24 - diffHours) / 24) * 19;
  } else if (diffHours <= 72) {
    // Due in 3 days
    baseScore = 50 + ((72 - diffHours) / 48) * 29;
  } else if (diffHours <= 168) {
    // Due in 7 days
    baseScore = 20 + ((168 - diffHours) / 96) * 29;
  } else {
    // Due later
    baseScore = Math.max(0, 19 - (diffDays - 7));
  }

  // Factor in Workload difficulty weight (1 = Easy, 2 = Medium, 3 = Hard)
  let difficultyBonus = 0;
  if (assignment.difficulty === 2) difficultyBonus = 5;
  if (assignment.difficulty === 3) difficultyBonus = 10;

  // Don't add bonus to completed or let it exceed 100 if not overdue
  let finalScore = baseScore + difficultyBonus;
  if (diffHours > 0 && finalScore > 100) {
    finalScore = 100;
  }

  return Math.round(finalScore * 10) / 10; // Round to 1 decimal
}

/**
 * Translates urgency scores to Priority Tag details
 */
function getPriorityDetails(score, completed) {
  if (completed) {
    return { label: "Low Priority", class: "low", icon: "check-circle-2" };
  }
  if (score >= 80) {
    return { label: "Critical", class: "critical", icon: "flame" };
  } else if (score >= 50) {
    return { label: "High Priority", class: "high", icon: "zap" };
  } else if (score >= 20) {
    return { label: "Medium Priority", class: "medium", icon: "pin" };
  } else {
    return { label: "Low Priority", class: "low", icon: "check" };
  }
}

/**
 * Returns Zone categorization based on time remaining
 */
function getZoneType(assignment) {
  if (assignment.completed) {
    return "safe"; // Completed assignments are safe
  }
  
  const now = new Date();
  const due = new Date(assignment.dueDate);
  const diffHours = (due - now) / (1000 * 60 * 60);
  
  if (diffHours <= 24) {
    return "critical"; // Overdue or due today
  } else if (diffHours <= 72) {
    return "attention"; // Due in 3 days
  } else {
    return "safe"; // Due in > 3 days
  }
}

/**
 * Renders Relative Countdown Text
 */
function getCountdownText(dueDateMs, completed) {
  if (completed) {
    return { text: "Completed", isOverdue: false, textClass: "green-text" };
  }

  const now = Date.now();
  const diff = dueDateMs - now;
  const isOverdue = diff < 0;
  const absDiff = Math.abs(diff);

  const secs = Math.floor(absDiff / 1000) % 60;
  const mins = Math.floor(absDiff / (1000 * 60)) % 60;
  const hours = Math.floor(absDiff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (isOverdue) {
    if (days > 0) {
      return { text: `Overdue by ${days}d ${hours}h`, isOverdue, textClass: "red-text" };
    } else if (hours > 0) {
      return { text: `Overdue by ${hours}h ${mins}m`, isOverdue, textClass: "red-text" };
    } else {
      return { text: `Overdue by ${mins}m ${secs}s`, isOverdue, textClass: "red-text" };
    }
  } else {
    // Due in future
    if (days > 3) {
      return { text: `${days} Days Left`, isOverdue, textClass: "text-muted" };
    } else if (days > 0) {
      return { text: `${days}d ${hours}h Left`, isOverdue, textClass: "yellow-text" };
    } else if (hours > 0) {
      return { text: `${hours}h ${mins}m Left`, isOverdue, textClass: "red-text" };
    } else {
      return { text: `${mins}m ${secs}s Left`, isOverdue, textClass: "red-text" };
    }
  }
}

// ==========================================================================
// 5. PRODUCTIVITY CALCULATOR & CIRCLE ANIMATOR
// ==========================================================================

function updateProductivityMeter() {
  const total = assignments.length;
  if (total === 0) {
    setProductivityUI(100, 0, 0);
    return;
  }

  const completed = assignments.filter(a => a.completed).length;
  
  // Calculate overdue counts
  const now = new Date();
  const overdue = assignments.filter(a => !a.completed && new Date(a.dueDate) < now).length;

  // Gamified Formula: (Completed/Total)*100 - OverduePenalty
  // Overdue tasks take away 15% each from the potential score
  let score = Math.round((completed / total) * 100);
  score = score - (overdue * 15);
  score = Math.max(0, Math.min(100, score)); // Clamp 0 - 100

  setProductivityUI(score, completed, overdue);
}

function setProductivityUI(score, completedCount, overdueCount) {
  document.getElementById("productivity-score").textContent = score;
  
  // Update breakdown descriptions
  document.getElementById("prod-completed-lbl").textContent = `${completedCount} Completed`;
  document.getElementById("prod-overdue-lbl").textContent = `${overdueCount} Overdue`;

  // Animate SVG circle
  const circle = document.getElementById("productivity-circle");
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius; // 314.16
  
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  const offset = circumference - (score / 100) * circumference;
  circle.style.strokeDashoffset = offset;
}

// ==========================================================================
// 6. RENDER LOGIC (DOM CONTROLLER)
// ==========================================================================

function renderDashboard() {
  // 1. Gather Search & Filter values
  const searchQuery = document.getElementById("search-input").value.toLowerCase().trim();
  const subjectFilter = document.getElementById("filter-subject").value;
  const sortCriteria = document.getElementById("sort-assignments").value;

  // 2. Filter Assignments
  let filtered = assignments.filter(assign => {
    // Subject filter
    const matchesSubject = (subjectFilter === "all" || assign.subjectId === subjectFilter);
    // Search query filter
    const titleMatch = assign.title.toLowerCase().includes(searchQuery);
    const descMatch = assign.desc ? assign.desc.toLowerCase().includes(searchQuery) : false;
    const matchesSearch = (searchQuery === "" || titleMatch || descMatch);

    return matchesSubject && matchesSearch;
  });

  // 3. Sort Assignments
  filtered.sort((a, b) => {
    const scoreA = calculateUrgencyScore(a);
    const scoreB = calculateUrgencyScore(b);
    
    if (sortCriteria === "urgency-desc") {
      return scoreB - scoreA;
    } else if (sortCriteria === "urgency-asc") {
      return scoreA - scoreB;
    } else if (sortCriteria === "due-asc") {
      return new Date(a.dueDate) - new Date(b.dueDate);
    } else if (sortCriteria === "due-desc") {
      return new Date(b.dueDate) - new Date(a.dueDate);
    }
    return 0;
  });

  // 4. Group by Radar Zones
  const zones = {
    critical: [],
    attention: [],
    safe: []
  };

  filtered.forEach(assign => {
    const zone = getZoneType(assign);
    zones[zone].push(assign);
  });

  // 5. Update Stats Panels
  updateStatsCounters();

  // 6. Handle Empty State
  const emptyStateEl = document.getElementById("radar-empty-state");
  const radarGridEl = document.getElementById("radar-zones-container");
  
  if (assignments.length === 0) {
    emptyStateEl.classList.remove("hidden");
    radarGridEl.classList.add("hidden");
  } else {
    emptyStateEl.classList.add("hidden");
    radarGridEl.classList.remove("hidden");
  }

  // 7. Inject Cards into columns
  renderZoneColumn("list-critical", "count-critical", zones.critical);
  renderZoneColumn("list-attention", "count-attention", zones.attention);
  renderZoneColumn("list-safe", "count-safe", zones.safe);

  // Recalculate productivity
  updateProductivityMeter();

  // Reinject Lucide Icons for dynamic HTML
  lucide.createIcons();
}

function renderZoneColumn(listId, badgeId, items) {
  const listEl = document.getElementById(listId);
  const badgeEl = document.getElementById(badgeId);
  
  badgeEl.textContent = items.length;
  listEl.innerHTML = "";

  if (items.length === 0) {
    listEl.innerHTML = `
      <div class="empty-column-placeholder text-muted" style="text-align:center; padding: 32px 10px; font-size: 0.8rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md); background: rgba(255,255,255,0.01);">
        No tasks in this zone
      </div>
    `;
    return;
  }

  items.forEach(assign => {
    const urgency = calculateUrgencyScore(assign);
    const priority = getPriorityDetails(urgency, assign.completed);
    const countdown = getCountdownText(new Date(assign.dueDate).getTime(), assign.completed);
    const subject = getSubjectById(assign.subjectId);
    
    // Checkbox configuration
    const checkIcon = assign.completed ? "check-square" : "square";
    const cardClass = `assignment-card card-${priority.class} ${assign.completed ? 'card-completed' : ''}`;

    const cardHtml = `
      <article class="${cardClass}" id="card-${assign.id}" data-id="${assign.id}">
        <div class="card-top">
          <span class="subject-badge" style="background-color: ${subject.color}15; color: ${subject.color}; border: 1px solid ${subject.color}30">
            ${subject.name}
          </span>
          <div class="card-actions">
            <button class="btn-card-action complete" onclick="toggleAssignmentCompletion('${assign.id}')" title="${assign.completed ? 'Mark Incomplete' : 'Mark Complete'}">
              <i data-lucide="${checkIcon}"></i>
            </button>
            <button class="btn-card-action edit" onclick="openEditAssignmentModal('${assign.id}')" title="Edit Assignment">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="btn-card-action delete" onclick="deleteAssignment('${assign.id}')" title="Delete Assignment">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </div>
        
        <h3 class="card-title" onclick="openEditAssignmentModal('${assign.id}')">${escapeHTML(assign.title)}</h3>
        ${assign.desc ? `<p class="card-desc">${escapeHTML(assign.desc)}</p>` : ''}
        
        <div class="card-footer">
          <div class="priority-indicator ${priority.class}">
            <i data-lucide="${priority.icon}"></i>
            <span>${priority.label}</span>
          </div>
          <time class="countdown-timer ${countdown.textClass}">
            <i data-lucide="clock"></i>
            <span>${countdown.text}</span>
          </time>
        </div>
      </article>
    `;
    listEl.innerHTML += cardHtml;
  });
}

function updateStatsCounters() {
  const totalCount = assignments.length;
  const completedCount = assignments.filter(a => a.completed).length;
  
  const now = new Date();
  const todayCount = assignments.filter(a => {
    if (a.completed) return false;
    const due = new Date(a.dueDate);
    const diffHours = (due - now) / (1000 * 60 * 60);
    return diffHours <= 24; // Overdue or due today
  }).length;

  const weekCount = assignments.filter(a => {
    if (a.completed) return false;
    const due = new Date(a.dueDate);
    const diffHours = (due - now) / (1000 * 60 * 60);
    return diffHours > 24 && diffHours <= 168; // Next 6 days
  }).length;

  document.getElementById("val-total").textContent = totalCount;
  document.getElementById("val-today").textContent = todayCount;
  document.getElementById("val-week").textContent = weekCount;
  document.getElementById("val-completed").textContent = completedCount;

  // Stats text footers update
  document.getElementById("footer-total").textContent = `${totalCount - completedCount} pending tasks`;
  document.getElementById("footer-today").textContent = todayCount > 0 ? `${todayCount} assignments urgent` : "All clear for today!";
  document.getElementById("footer-week").textContent = `${weekCount} tasks incoming`;
  
  const completedPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  document.getElementById("footer-completed").textContent = `${completedPercent}% success rate`;
}

// Loop to run every second and update countdown texts in real-time
function runRealtimeCountdown() {
  assignments.forEach(assign => {
    const cardEl = document.getElementById(`card-${assign.id}`);
    if (!cardEl) return;

    const timerSpan = cardEl.querySelector(".countdown-timer span");
    const timerIcon = cardEl.querySelector(".countdown-timer");
    const prioritySpan = cardEl.querySelector(".priority-indicator span");
    const priorityIcon = cardEl.querySelector(".priority-indicator");

    if (!timerSpan || !timerIcon) return;

    const urgency = calculateUrgencyScore(assign);
    const priority = getPriorityDetails(urgency, assign.completed);
    const countdown = getCountdownText(new Date(assign.dueDate).getTime(), assign.completed);

    // Update timer text and classes
    timerSpan.textContent = countdown.text;
    timerIcon.className = `countdown-timer ${countdown.textClass}`;

    // Update priority indicators
    if (prioritySpan && priorityIcon) {
      prioritySpan.textContent = priority.label;
      priorityIcon.className = `priority-indicator ${priority.class}`;
      // Note: We don't dynamically replace icons here to avoid DOM thrashing unless class labels change
    }
  });

  // Also update overall stats and productivity in case tasks just went overdue
  updateStatsCounters();
  updateProductivityMeter();
}

// ==========================================================================
// 7. CRUD & LOCALSTORAGE HANDLERS
// ==========================================================================

// --- Assignment CRUDS ---
function saveAssignmentsToStorage() {
  localStorage.setItem("db_assignments", JSON.stringify(assignments));
}

function addOrUpdateAssignment(id, title, subjectId, difficulty, dueDate, desc) {
  if (id) {
    // Update existing
    const idx = assignments.findIndex(a => a.id === id);
    if (idx !== -1) {
      assignments[idx].title = title;
      assignments[idx].subjectId = subjectId;
      assignments[idx].difficulty = parseInt(difficulty);
      assignments[idx].dueDate = new Date(dueDate).toISOString();
      assignments[idx].desc = desc;
    }
  } else {
    // Add new
    const newAssignment = {
      id: "assign-" + Date.now(),
      title,
      subjectId,
      difficulty: parseInt(difficulty),
      dueDate: new Date(dueDate).toISOString(),
      desc,
      completed: false
    };
    assignments.push(newAssignment);
  }
  
  saveAssignmentsToStorage();
  renderDashboard();
}

function toggleAssignmentCompletion(id) {
  const idx = assignments.findIndex(a => a.id === id);
  if (idx !== -1) {
    assignments[idx].completed = !assignments[idx].completed;
    saveAssignmentsToStorage();
    renderDashboard();
  }
}

function deleteAssignment(id) {
  assignments = assignments.filter(a => a.id !== id);
  saveAssignmentsToStorage();
  renderDashboard();
}

// --- Subject CRUDs ---
function saveSubjectsToStorage() {
  localStorage.setItem("db_subjects", JSON.stringify(subjects));
}

function addSubject(name, color) {
  const cleanedName = name.trim();
  if (!cleanedName) return false;
  
  // Prevent duplicate names case-insensitive
  const duplicate = subjects.some(s => s.name.toLowerCase() === cleanedName.toLowerCase());
  if (duplicate) {
    alert("This subject already exists.");
    return false;
  }

  const newSub = {
    id: "sub-" + Date.now(),
    name: cleanedName,
    color
  };

  subjects.push(newSub);
  saveSubjectsToStorage();
  
  // Update views
  populateSubjectDropdowns();
  renderSubjectsList();
  renderDashboard();
  return true;
}

function deleteSubject(subId) {
  // Check if subject is in use
  const inUse = assignments.some(a => a.subjectId === subId);
  if (inUse) {
    alert("Cannot delete subject. There are assignments currently assigned to it. Re-assign them first.");
    return;
  }

  // Prevent deleting all subjects
  if (subjects.length <= 1) {
    alert("You must keep at least one subject.");
    return;
  }

  subjects = subjects.filter(s => s.id !== subId);
  saveSubjectsToStorage();

  populateSubjectDropdowns();
  renderSubjectsList();
  renderDashboard();
}

// ==========================================================================
// 8. MODALS & FORMS MANAGER
// ==========================================================================

function setupEventListeners() {
  // Navigation Routing Triggers
  document.getElementById("btn-nav-login").addEventListener("click", () => showView("view-login"));
  document.getElementById("btn-nav-start").addEventListener("click", () => showView("view-login"));
  document.getElementById("btn-hero-start").addEventListener("click", () => showView("view-login"));
  document.getElementById("btn-login-back").addEventListener("click", () => showView("view-landing"));

  // Submit Login Profile Form
  document.getElementById("form-login").addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("login-student-name").value.trim();
    const major = document.getElementById("login-student-major").value.trim();

    if (!name) return;

    // Save profile state
    const userProfile = { name, major };
    localStorage.setItem("db_auth_user", JSON.stringify(userProfile));
    authUser = userProfile;
    studentName = name;

    // Initialize/Refresh views
    refreshStudentProfile();
    
    // Check if assignments exist. If it's a first time, load defaults
    if (assignments.length === 0 && localStorage.getItem("db_has_used_before") === null) {
      assignments = [...DEFAULT_ASSIGNMENTS];
      saveAssignmentsToStorage();
      localStorage.setItem("db_has_used_before", "true");
    }

    renderDashboard();
    showView("view-dashboard");
  });

  // Logout Trigger
  document.getElementById("btn-logout").addEventListener("click", () => {
    localStorage.removeItem("db_auth_user");
    authUser = null;
    studentName = "Developer Student";
    showView("view-landing");
  });

  // Open Assign Modal
  document.getElementById("btn-add-assignment").addEventListener("click", () => {
    openAssignmentModal();
  });
  document.getElementById("btn-empty-add").addEventListener("click", () => {
    openAssignmentModal();
  });

  // Load Samples
  document.getElementById("btn-load-samples").addEventListener("click", () => {
    assignments = [...DEFAULT_ASSIGNMENTS];
    saveAssignmentsToStorage();
    renderDashboard();
  });

  // Close Assign Modal
  document.getElementById("btn-close-assign-modal").addEventListener("click", closeAssignmentModal);
  document.getElementById("btn-cancel-assign").addEventListener("click", closeAssignmentModal);

  // Submit Assign Form
  document.getElementById("form-assignment").addEventListener("submit", (e) => {
    e.preventDefault();
    const id = document.getElementById("assignment-id").value;
    const title = document.getElementById("assign-title").value;
    const subjectId = document.getElementById("assign-subject").value;
    const difficulty = document.getElementById("assign-difficulty").value;
    const dueDate = document.getElementById("assign-due").value;
    const desc = document.getElementById("assign-desc").value;

    // Reject past dates
    const selectedDate = new Date(dueDate);
    if (selectedDate < new Date()) {
      alert("Due date cannot be in the past. Please choose a future deadline.");
      return;
    }

    addOrUpdateAssignment(id, title, subjectId, difficulty, dueDate, desc);
    closeAssignmentModal();
  });

  // Subject Modal controls
  document.getElementById("btn-manage-subjects").addEventListener("click", openSubjectsModal);
  document.getElementById("btn-close-sub-modal").addEventListener("click", closeSubjectsModal);
  document.getElementById("btn-close-sub-manager").addEventListener("click", closeSubjectsModal);

  // Submit Add Subject Form
  document.getElementById("form-add-subject").addEventListener("submit", (e) => {
    e.preventDefault();
    const subNameInput = document.getElementById("new-sub-name");
    const subColorInput = document.getElementById("new-sub-color");

    const success = addSubject(subNameInput.value, subColorInput.value);
    if (success) {
      subNameInput.value = "";
      subColorInput.value = "#8b5cf6"; // Reset to purple
    }
  });

  // Toolbar Search & Filters
  document.getElementById("search-input").addEventListener("input", renderDashboard);
  document.getElementById("filter-subject").addEventListener("change", renderDashboard);
  document.getElementById("sort-assignments").addEventListener("change", renderDashboard);
}

// Assignment Modal operations
function openAssignmentModal(assignmentId = null) {
  const modal = document.getElementById("modal-assignment");
  const form = document.getElementById("form-assignment");
  const titleHeader = document.getElementById("modal-assign-title");
  
  form.reset();

  // Restrict past dates selection in HTML picker dynamically
  const dueInput = document.getElementById("assign-due");
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  const localISOString = new Date(now.getTime() - tzOffset).toISOString().slice(0, 16);
  if (dueInput) {
    dueInput.setAttribute("min", localISOString);
  }
  
  if (assignmentId) {
    titleHeader.textContent = "Edit Assignment";
    const assign = assignments.find(a => a.id === assignmentId);
    if (assign) {
      document.getElementById("assignment-id").value = assign.id;
      document.getElementById("assign-title").value = assign.title;
      document.getElementById("assign-subject").value = assign.subjectId;
      document.getElementById("assign-difficulty").value = assign.difficulty;
      
      // Convert ISO to local datetime string format required by datetime-local input
      const localDueDate = new Date(assign.dueDate);
      const tzOffset = localDueDate.getTimezoneOffset() * 60000;
      const formattedDate = new Date(localDueDate.getTime() - tzOffset).toISOString().slice(0, 16);
      
      document.getElementById("assign-due").value = formattedDate;
      document.getElementById("assign-desc").value = assign.desc || "";
    }
  } else {
    titleHeader.textContent = "New Assignment";
    document.getElementById("assignment-id").value = "";
    
    // Set default datetime to tomorrow at 12:00 PM local
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(12, 0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    const formattedDate = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
    document.getElementById("assign-due").value = formattedDate;
  }

  modal.classList.remove("hidden");
}

function closeAssignmentModal() {
  document.getElementById("modal-assignment").classList.add("hidden");
}

function openSubjectsModal() {
  document.getElementById("modal-subjects").classList.remove("hidden");
}

function closeSubjectsModal() {
  document.getElementById("modal-subjects").classList.add("hidden");
}

// Expose open edit modal globally so inline onclick handlers work
window.openEditAssignmentModal = openAssignmentModal;
window.toggleAssignmentCompletion = toggleAssignmentCompletion;
window.deleteAssignment = deleteAssignment;
window.deleteSubject = deleteSubject;

// ==========================================================================
// 9. HELPER FUNCTIONS
// ==========================================================================

function getSubjectById(subjectId) {
  const sub = subjects.find(s => s.id === subjectId);
  return sub || { name: "Unknown", color: "#64748b" };
}

function populateSubjectDropdowns() {
  const filterSelect = document.getElementById("filter-subject");
  const formSelect = document.getElementById("assign-subject");
  
  // Store current values to restore them
  const prevFilterVal = filterSelect.value;
  const prevFormVal = formSelect.value;

  filterSelect.innerHTML = `<option value="all">All Subjects</option>`;
  formSelect.innerHTML = "";

  subjects.forEach(sub => {
    const opt = `<option value="${sub.id}">${escapeHTML(sub.name)}</option>`;
    filterSelect.innerHTML += opt;
    formSelect.innerHTML += opt;
  });

  // Restore values
  filterSelect.value = prevFilterVal || "all";
  formSelect.value = prevFormVal || (subjects[0] ? subjects[0].id : "");
}

function renderSubjectsList() {
  const ul = document.getElementById("subjects-ul-list");
  ul.innerHTML = "";

  subjects.forEach(sub => {
    const li = `
      <li class="subject-item-row">
        <div class="subject-item-left">
          <span class="color-dot-indicator" style="background-color: ${sub.color}; box-shadow: 0 0 6px ${sub.color}60;"></span>
          <span class="subject-item-name">${escapeHTML(sub.name)}</span>
        </div>
        <button class="btn-delete-subject" onclick="deleteSubject('${sub.id}')" title="Delete Subject">
          <i data-lucide="trash-2"></i>
        </button>
      </li>
    `;
    ul.innerHTML += li;
  });
  lucide.createIcons();
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
