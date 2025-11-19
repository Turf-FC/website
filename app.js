// Main application logic for Competition Tracker

// Application state
const appState = {
  currentView: "competitions",
  competitions: [],
  teams: [],
  players: [],
  fixtures: [],
  selectedCompetition: null,
  selectedTeam: null,
  selectedFixture: null,
  competitionTab: "standings", // Track active tab in competition detail
  searchTerm: "",
  filters: {
    status: "all",
    year: "all",
  },
}

// Router object for navigation
const router = {
  navigate(view, params = {}) {
    appState.currentView = view

    // Update URL without reload
    const url = new URL(window.location)
    url.searchParams.set("view", view)
    if (params.id) {
      url.searchParams.set("id", params.id)
    }
    window.history.pushState({}, "", url)

    // Update navigation active state
    document.querySelectorAll(".nav-link").forEach((link) => {
      link.classList.remove("active")
      if (link.textContent.toLowerCase().includes(view.toLowerCase())) {
        link.classList.add("active")
      }
    })

    // Render the view
    renderView(view, params)
  },

  init() {
    // Handle browser back/forward buttons
    window.addEventListener("popstate", () => {
      const params = new URLSearchParams(window.location.search)
      const view = params.get("view") || "competitions"
      const id = params.get("id")
      this.navigate(view, { id })
    })

    // Initialize with current URL params or default
    const params = new URLSearchParams(window.location.search)
    const view = params.get("view") || "competitions"
    const id = params.get("id")
    this.navigate(view, { id })
  },
}

// View rendering functions
async function renderView(view, params = {}) {
  const app = document.getElementById("app")
  utils.showLoading()

  try {
    switch (view) {
      case "competitions":
        await renderCompetitions()
        break
      case "competition":
        await renderCompetitionDetail(params.id)
        break
      case "teams":
        await renderTeams()
        break
      case "team":
        await renderTeamDetail(params.id)
        break
      case "players":
        await renderPlayers()
        break
      case "fixtures":
        await renderFixtures()
        break
      case "fixture":
        await renderFixtureDetail(params.id)
        break
      default:
        await renderCompetitions()
    }
  } catch (error) {
    console.error("Error rendering view:", error)
    utils.showToast("Error loading view", "error")
  } finally {
    utils.hideLoading()
  }
}

// Render competitions list view
async function renderCompetitions() {
  const result = await API.competitions.getAll()

  if (!result.success) {
    document.getElementById("app").innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500">Failed to load competitions: ${result.error}</p>
                <button onclick="router.navigate('competitions')" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Retry
                </button>
            </div>
        `
    return
  }

  appState.competitions = result.data

  const app = document.getElementById("app")
  app.innerHTML = `
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-100 mb-4">Competitions</h2>
            
            <!-- Search and Filters -->
            <div class="bg-gray-800 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input 
                        type="text" 
                        id="competition-search"
                        placeholder="Search competitions..." 
                        class="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        value="${appState.searchTerm}"
                    >
                    <select 
                        id="status-filter"
                        class="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Status</option>
                        <option value="upcoming">Upcoming</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                    </select>
                    <select 
                        id="year-filter"
                        class="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Years</option>
                        ${[...new Set(appState.competitions.map((c) => c.year))]
                          .sort((a, b) => b - a)
                          .map((year) => `<option value="${year}">${year}</option>`)
                          .join("")}
                    </select>
                </div>
            </div>
            
            <!-- Competitions Grid -->
            <div id="competitions-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${renderCompetitionCards(appState.competitions)}
            </div>
        </div>
    `

  // Setup search and filter handlers
  setupCompetitionFilters()
}

// Render competition cards
function renderCompetitionCards(competitions) {
  if (!competitions || competitions.length === 0) {
    return `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-400">No competitions found</p>
            </div>
        `
  }

  return competitions
    .map((comp) => {
      const status = utils.getCompetitionStatus(comp.starts, comp.ends)
      const teamCount = comp.teams ? comp.teams.length : 0
      const fixtureCount = comp.fixtures ? comp.fixtures.length : 0

      return `
            <div class="bg-gray-800 rounded-lg p-6 card-hover cursor-pointer" onclick="router.navigate('competition', {id: '${comp.id}'})">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-100">${comp.id}</h3>
                        <p class="text-gray-400">${comp.year}</p>
                    </div>
                    <span class="status-badge ${status.class}">${status.label}</span>
                </div>
                
                <div class="space-y-2 mb-4">
                    <p class="text-gray-300">
                        <span class="text-gray-500">Format:</span> ${comp.format}
                    </p>
                    <p class="text-gray-300">
                        <span class="text-gray-500">Dates:</span> ${utils.formatDateRange(comp.starts, comp.ends)}
                    </p>
                </div>
                
                <div class="flex justify-between text-sm">
                    <span class="text-gray-400">
                        <span class="text-green-500 font-semibold">${teamCount}</span> Teams
                    </span>
                    <span class="text-gray-400">
                        <span class="text-green-500 font-semibold">${fixtureCount}</span> Fixtures
                    </span>
                </div>
            </div>
        `
    })
    .join("")
}

// Setup competition filters
function setupCompetitionFilters() {
  const searchInput = document.getElementById("competition-search")
  const statusFilter = document.getElementById("status-filter")
  const yearFilter = document.getElementById("year-filter")

  const applyFilters = () => {
    let filtered = appState.competitions

    // Apply search
    if (appState.searchTerm) {
      filtered = utils.filterBySearch(filtered, appState.searchTerm, ["id", "format"])
    }

    // Apply status filter
    if (appState.filters.status !== "all") {
      filtered = filtered.filter((comp) => {
        const status = utils.getCompetitionStatus(comp.starts, comp.ends)
        return status.status === appState.filters.status
      })
    }

    // Apply year filter
    if (appState.filters.year !== "all") {
      filtered = filtered.filter((comp) => comp.year.toString() === appState.filters.year)
    }

    // Update grid
    document.getElementById("competitions-grid").innerHTML = renderCompetitionCards(filtered)
  }

  searchInput.addEventListener(
    "input",
    utils.debounce((e) => {
      appState.searchTerm = e.target.value
      applyFilters()
    }, 300)
  )

  statusFilter.addEventListener("change", (e) => {
    appState.filters.status = e.target.value
    applyFilters()
  })

  yearFilter.addEventListener("change", (e) => {
    appState.filters.year = e.target.value
    applyFilters()
  })
}

// Render competition detail view
async function renderCompetitionDetail(id) {
  if (!id) {
    router.navigate("competitions")
    return
  }

  const result = await API.competitions.getById(id)

  if (!result.success) {
    utils.showToast("Failed to load competition details", "error")
    router.navigate("competitions")
    return
  }

  const competition = result.data
  appState.selectedCompetition = competition
  appState.competitionTab = "standings" // Default to standings tab

  const status = utils.getCompetitionStatus(competition.starts, competition.ends)

  const app = document.getElementById("app")
  app.innerHTML = `
        <div class="mb-8">
            <!-- Header -->
            <div class="bg-gray-800 rounded-lg p-6 mb-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-3xl font-bold text-gray-100">${competition.id}</h2>
                        <p class="text-xl text-gray-400">${competition.year}</p>
                    </div>
                    <div class="text-right">
                        <span class="status-badge ${status.class}">${status.label}</span>
                        <button onclick="router.navigate('competitions')" class="ml-4 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600">
                            Back
                        </button>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p class="text-gray-500 text-sm">Format</p>
                        <p class="text-gray-200">${competition.format}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm">Start Date</p>
                        <p class="text-gray-200">${utils.formatDate(competition.starts)}</p>
                    </div>
                    <div>
                        <p class="text-gray-500 text-sm">End Date</p>
                        <p class="text-gray-200">${utils.formatDate(competition.ends)}</p>
                    </div>
                </div>
            </div>
            
            <!-- Tabs Navigation -->
            <div class="bg-gray-800 rounded-lg p-1 mb-6 flex flex-wrap">
                <button 
                    id="tab-standings" 
                    onclick="switchCompetitionTab('standings')"
                    class="flex-1 min-w-[120px] px-4 py-2 rounded-md font-medium transition-colors bg-gray-700 text-white"
                >
                    📊 Standings
                </button>
                <button 
                    id="tab-teams" 
                    onclick="switchCompetitionTab('teams')"
                    class="flex-1 min-w-[120px] px-4 py-2 rounded-md font-medium transition-colors text-gray-400 hover:bg-gray-700"
                >
                    👥 Teams (${competition.teams ? competition.teams.length : 0})
                </button>
                <button 
                    id="tab-fixtures" 
                    onclick="switchCompetitionTab('fixtures')"
                    class="flex-1 min-w-[120px] px-4 py-2 rounded-md font-medium transition-colors text-gray-400 hover:bg-gray-700"
                >
                    ⚽ Fixtures (${competition.fixtures ? competition.fixtures.length : 0})
                </button>
            </div>
            
            <!-- Tab Content -->
            <div id="tab-content">
                <!-- Standings Table (Default) -->
                <div id="standings-content">
                    <div class="bg-gray-800 rounded-lg p-6">
                        <h3 class="text-2xl font-semibold text-gray-100 mb-6">League Table</h3>
                        ${renderStandingsTable(competition.teams || [], competition.fixtures || [])}
                    </div>
                </div>
            </div>
        </div>
    `
}

// Function to switch between competition tabs
function switchCompetitionTab(tab) {
  appState.competitionTab = tab
  const competition = appState.selectedCompetition

  // Update tab buttons
  document.querySelectorAll('[id^="tab-"]').forEach((btn) => {
    btn.classList.remove("bg-gray-700", "text-white")
    btn.classList.add("text-gray-400", "hover:bg-gray-700")
  })
  document.getElementById(`tab-${tab}`).classList.remove("text-gray-400", "hover:bg-gray-700")
  document.getElementById(`tab-${tab}`).classList.add("bg-gray-700", "text-white")

  // Update content
  const contentDiv = document.getElementById("tab-content")

  switch (tab) {
    case "standings":
      contentDiv.innerHTML = `
                <div id="standings-content">
                    <div class="bg-gray-800 rounded-lg p-6">
                        <h3 class="text-2xl font-semibold text-gray-100 mb-6">League Table</h3>
                        ${renderStandingsTable(competition.teams || [], competition.fixtures || [])}
                    </div>
                </div>
            `
      break

    case "teams":
      contentDiv.innerHTML = `
                <div id="teams-content">
                    <h3 class="text-2xl font-semibold text-gray-100 mb-4">Teams</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${renderTeamCards(competition.teams || [])}
                    </div>
                </div>
            `
      break

    case "fixtures":
      contentDiv.innerHTML = `
                <div id="fixtures-content">
                    <h3 class="text-2xl font-semibold text-gray-100 mb-4">Fixtures</h3>
                    <div class="space-y-4">
                        ${renderFixtureCards(competition.fixtures || [])}
                    </div>
                </div>
            `
      break
  }
}

// Render team cards
function renderTeamCards(teams) {
  if (!teams || teams.length === 0) {
    return `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-400">No teams found</p>
            </div>
        `
  }

  return teams
    .map((team) => {
      const playerCount = team.players ? team.players.length : 0

      return `
            <div class="bg-gray-700 rounded-lg p-4 card-hover cursor-pointer" onclick="showTeamModal('${team.id}')">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-3xl font-bold text-green-500">${team.letter}</span>
                    <span class="text-sm text-gray-400">${playerCount} players</span>
                </div>
                <h4 class="text-lg font-medium text-gray-100">${team.alias}</h4>
                <p class="text-sm text-gray-400">ID: ${team.id}</p>
            </div>
        `
    })
    .join("")
}

// Render fixture cards
function renderFixtureCards(fixtures) {
  if (!fixtures || fixtures.length === 0) {
    return `
            <div class="text-center py-8">
                <p class="text-gray-400">No fixtures found</p>
            </div>
        `
  }

  return fixtures
    .map((fixture) => {
      const status = utils.getFixtureStatus(fixture.starts, fixture.finalScore)
      const homeTeam = fixture.participants[0] || { alias: "TBD" }
      const awayTeam = fixture.participants[1] || { alias: "TBD" }

      return `
            <div class="bg-gray-800 rounded-lg p-6 card-hover cursor-pointer" onclick="showFixtureModal('${fixture.id}')">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-4 mb-2">
                            <span class="text-lg font-medium text-gray-100">${homeTeam.alias}</span>
                            <span class="score-display">${utils.formatScore(fixture.finalScore)}</span>
                            <span class="text-lg font-medium text-gray-100">${awayTeam.alias}</span>
                        </div>
                        <div class="text-sm text-gray-400">
                            <span>${utils.formatDateTime(fixture.starts)}</span>
                            ${fixture.venue ? `<span class="ml-4">📍 ${fixture.venue}</span>` : ""}
                            ${fixture.referee ? `<span class="ml-4">🎯 ${fixture.referee}</span>` : ""}
                        </div>
                    </div>
                    <div class="mt-4 md:mt-0">
                        <span class="status-badge ${status.status === "completed" ? "status-completed" : status.status === "live" ? "status-active" : "status-upcoming"}">
                            ${status.label}
                        </span>
                    </div>
                </div>
                ${
                  fixture.events && fixture.events.length > 0
                    ? `
                    <div class="mt-4 pt-4 border-t border-gray-700">
                        <p class="text-sm text-gray-400">${fixture.events.length} events</p>
                    </div>
                `
                    : ""
                }
            </div>
        `
    })
    .join("")
}

// Render teams view
async function renderTeams() {
  const result = await API.teams.getAll()

  if (!result.success) {
    document.getElementById("app").innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500">Failed to load teams: ${result.error}</p>
                <button onclick="router.navigate('teams')" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Retry
                </button>
            </div>
        `
    return
  }

  appState.teams = result.data

  const app = document.getElementById("app")
  app.innerHTML = `
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-100 mb-4">Teams</h2>
            
            <!-- Search -->
            <div class="bg-gray-800 rounded-lg p-4 mb-6">
                <input 
                    type="text" 
                    id="team-search"
                    placeholder="Search teams..." 
                    class="w-full bg-gray-700 text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
            </div>
            
            <!-- Teams Grid -->
            <div id="teams-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${renderAllTeamCards(appState.teams)}
            </div>
        </div>
    `

  // Setup search
  document.getElementById("team-search").addEventListener(
    "input",
    utils.debounce((e) => {
      const filtered = utils.filterBySearch(appState.teams, e.target.value, ["alias", "letter"])
      document.getElementById("teams-grid").innerHTML = renderAllTeamCards(filtered)
    }, 300)
  )
}

// Render all team cards for teams view
function renderAllTeamCards(teams) {
  if (!teams || teams.length === 0) {
    return `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-400">No teams found</p>
            </div>
        `
  }

  return teams
    .map((team) => {
      const playerCount = team.players ? team.players.length : 0

      return `
            <div class="bg-gray-800 rounded-lg p-6 card-hover cursor-pointer" onclick="showTeamModal('${team.id}')">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <span class="text-4xl font-bold text-green-500">${team.letter}</span>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-100">${team.alias}</h3>
                            <p class="text-sm text-gray-400">ID: ${team.id}</p>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-center justify-between">
                    <span class="text-gray-400">
                        <span class="text-green-500 font-semibold">${playerCount}</span> Players
                    </span>
                    <button class="text-green-500 hover:text-green-400">
                        View Roster →
                    </button>
                </div>
            </div>
        `
    })
    .join("")
}

// Render players view
async function renderPlayers() {
  const result = await API.players.getAll()

  if (!result.success) {
    document.getElementById("app").innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500">Failed to load players: ${result.error}</p>
                <button onclick="router.navigate('players')" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Retry
                </button>
            </div>
        `
    return
  }

  appState.players = result.data

  const app = document.getElementById("app")
  app.innerHTML = `
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-100 mb-4">Players</h2>
            
            <!-- Search and Filters -->
            <div class="bg-gray-800 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        id="player-search"
                        placeholder="Search players..." 
                        class="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                    <select 
                        id="position-filter"
                        class="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Positions</option>
                        <option value="GK">Goalkeeper</option>
                        <option value="CB">Center Back</option>
                        <option value="RB">Right Back</option>
                        <option value="LB">Left Back</option>
                        <option value="CDM">Defensive Midfielder</option>
                        <option value="CM">Central Midfielder</option>
                        <option value="CAM">Attacking Midfielder</option>
                        <option value="RW">Right Winger</option>
                        <option value="LW">Left Winger</option>
                        <option value="ST">Striker</option>
                        <option value="SS">Second Striker</option>
                    </select>
                </div>
            </div>
            
            <!-- Players Grid -->
            <div id="players-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${renderPlayerCards(appState.players)}
            </div>
        </div>
    `

  // Setup filters
  setupPlayerFilters()
}

// Render player cards
function renderPlayerCards(players) {
  if (!players || players.length === 0) {
    return `
            <div class="col-span-full text-center py-8">
                <p class="text-gray-400">No players found</p>
            </div>
        `
  }

  return players
    .map((player) => {
      return `
            <div class="bg-gray-800 rounded-lg overflow-hidden card-hover">
                ${utils.getPlayerImage(player.imageUrl)}
                <div class="p-4">
                    <h4 class="text-lg font-semibold text-gray-100 mb-1">
                        ${player.firstName} ${player.lastName}
                    </h4>
                    ${player.alias ? `<p class="text-sm text-green-500 mb-2">"${player.alias}"</p>` : ""}
                    
                    <div class="space-y-2">
                        <div>
                            <span class="position-badge position-primary">${player.primaryPosition}</span>
                        </div>
                        ${
                          player.alternatePositions && player.alternatePositions.length > 0
                            ? `
                            <div class="flex flex-wrap gap-1">
                                ${player.alternatePositions.map((pos) => `<span class="position-badge">${pos}</span>`).join("")}
                            </div>
                        `
                            : ""
                        }
                    </div>
                </div>
            </div>
        `
    })
    .join("")
}

// Setup player filters
function setupPlayerFilters() {
  const searchInput = document.getElementById("player-search")
  const positionFilter = document.getElementById("position-filter")

  const applyFilters = () => {
    let filtered = appState.players

    // Apply search
    if (searchInput.value) {
      filtered = utils.filterBySearch(filtered, searchInput.value, ["firstName", "lastName", "alias"])
    }

    // Apply position filter
    if (positionFilter.value !== "all") {
      filtered = filtered.filter((player) => player.primaryPosition === positionFilter.value || (player.alternatePositions && player.alternatePositions.includes(positionFilter.value)))
    }

    // Update grid
    document.getElementById("players-grid").innerHTML = renderPlayerCards(filtered)
  }

  searchInput.addEventListener("input", utils.debounce(applyFilters, 300))
  positionFilter.addEventListener("change", applyFilters)
}

// Render fixtures view
async function renderFixtures() {
  const result = await API.fixtures.getAll()

  if (!result.success) {
    document.getElementById("app").innerHTML = `
            <div class="text-center py-8">
                <p class="text-red-500">Failed to load fixtures: ${result.error}</p>
                <button onclick="router.navigate('fixtures')" class="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Retry
                </button>
            </div>
        `
    return
  }

  appState.fixtures = result.data

  const app = document.getElementById("app")
  app.innerHTML = `
        <div class="mb-8">
            <h2 class="text-3xl font-bold text-gray-100 mb-4">Fixtures</h2>
            
            <!-- Filters -->
            <div class="bg-gray-800 rounded-lg p-4 mb-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        type="text" 
                        id="fixture-search"
                        placeholder="Search by team or venue..." 
                        class="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                    <select 
                        id="fixture-status-filter"
                        class="bg-gray-700 text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        <option value="all">All Status</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="live">Live</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>
            
            <!-- Fixtures List -->
            <div id="fixtures-list" class="space-y-4">
                ${renderAllFixtureCards(appState.fixtures)}
            </div>
        </div>
    `

  // Setup filters
  setupFixtureFilters()
}

// Render all fixture cards for fixtures view
function renderAllFixtureCards(fixtures) {
  if (!fixtures || fixtures.length === 0) {
    return `
            <div class="text-center py-8">
                <p class="text-gray-400">No fixtures found</p>
            </div>
        `
  }

  // Sort fixtures by date
  const sorted = utils.sortBy(fixtures, "starts", false)

  return sorted
    .map((fixture) => {
      const status = utils.getFixtureStatus(fixture.starts, fixture.finalScore)
      const homeTeam = fixture.participants[0] || { alias: "TBD" }
      const awayTeam = fixture.participants[1] || { alias: "TBD" }

      return `
            <div class="bg-gray-800 rounded-lg p-6 card-hover cursor-pointer" onclick="showFixtureModal('${fixture.id}')">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-4 mb-3">
                            <div class="flex-1 text-right">
                                <span class="text-xl font-medium text-gray-100">${homeTeam.alias}</span>
                            </div>
                            <div class="score-display bg-gray-700">
                                ${
                                  fixture.finalScore
                                    ? `
                                    <span class="text-2xl">${fixture.finalScore[0]}</span>
                                    <span class="text-gray-500">-</span>
                                    <span class="text-2xl">${fixture.finalScore[1]}</span>
                                `
                                    : '<span class="text-gray-500">vs</span>'
                                }
                            </div>
                            <div class="flex-1">
                                <span class="text-xl font-medium text-gray-100">${awayTeam.alias}</span>
                            </div>
                        </div>
                        
                        <div class="text-sm text-gray-400 flex flex-wrap gap-4">
                            <span>📅 ${utils.formatDateTime(fixture.starts)}</span>
                            ${fixture.venue ? `<span>📍 ${fixture.venue}</span>` : ""}
                            ${fixture.referee ? `<span>🎯 ${fixture.referee}</span>` : ""}
                            ${fixture.events && fixture.events.length > 0 ? `<span>📊 ${fixture.events.length} events</span>` : ""}
                        </div>
                    </div>
                    
                    <div class="mt-4 lg:mt-0 lg:ml-6">
                        <span class="status-badge ${status.status === "completed" ? "status-completed" : status.status === "live" ? "status-active" : "status-upcoming"}">
                            ${status.label}
                        </span>
                    </div>
                </div>
            </div>
        `
    })
    .join("")
}

// Setup fixture filters
function setupFixtureFilters() {
  const searchInput = document.getElementById("fixture-search")
  const statusFilter = document.getElementById("fixture-status-filter")

  const applyFilters = () => {
    let filtered = appState.fixtures

    // Apply search
    if (searchInput.value) {
      const term = searchInput.value.toLowerCase()
      filtered = filtered.filter((fixture) => {
        const homeTeam = fixture.participants[0]
        const awayTeam = fixture.participants[1]
        return (homeTeam && homeTeam.alias.toLowerCase().includes(term)) || (awayTeam && awayTeam.alias.toLowerCase().includes(term)) || (fixture.venue && fixture.venue.toLowerCase().includes(term))
      })
    }

    // Apply status filter
    if (statusFilter.value !== "all") {
      filtered = filtered.filter((fixture) => {
        const status = utils.getFixtureStatus(fixture.starts, fixture.finalScore)
        return status.status === statusFilter.value
      })
    }

    // Update list
    document.getElementById("fixtures-list").innerHTML = renderAllFixtureCards(filtered)
  }

  searchInput.addEventListener("input", utils.debounce(applyFilters, 300))
  statusFilter.addEventListener("change", applyFilters)
}

// Show team modal
function showTeamModal(teamId) {
  const team = findTeamById(teamId)
  if (!team) {
    utils.showToast("Team not found", "error")
    return
  }

  const content = `
        <div class="space-y-4">
            <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex items-center space-x-4 mb-4">
                    <span class="text-5xl font-bold text-green-500">${team.letter}</span>
                    <div>
                        <h4 class="text-2xl font-semibold text-gray-100">${team.alias}</h4>
                        <p class="text-gray-400">Team ID: ${team.id}</p>
                    </div>
                </div>
            </div>
            
            <div>
                <h5 class="text-lg font-semibold text-gray-100 mb-3">Players (${team.players ? team.players.length : 0})</h5>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${
                      team.players && team.players.length > 0
                        ? team.players
                            .map(
                              (player) => `
                        <div class="bg-gray-700 rounded-lg p-4">
                            <h6 class="font-medium text-gray-100">
                                ${player.firstName} ${player.lastName}
                                ${player.alias ? `<span class="text-green-500">(${player.alias})</span>` : ""}
                            </h6>
                            <p class="text-sm text-gray-400 mt-1">
                                ${player.primaryPosition}
                                ${player.alternatePositions && player.alternatePositions.length > 0 ? ` | ${player.alternatePositions.join(", ")}` : ""}
                            </p>
                        </div>
                    `
                            )
                            .join("")
                        : '<p class="text-gray-400">No players in this team</p>'
                    }
                </div>
            </div>
        </div>
    `

  utils.createModal(`Team: ${team.alias}`, content, "large")
}

// Show fixture modal
function showFixtureModal(fixtureId) {
  const fixture = findFixtureById(fixtureId)
  if (!fixture) {
    utils.showToast("Fixture not found", "error")
    return
  }

  const status = utils.getFixtureStatus(fixture.starts, fixture.finalScore)
  const homeTeam = fixture.participants[0] || { alias: "TBD" }
  const awayTeam = fixture.participants[1] || { alias: "TBD" }

  const content = `
        <div class="space-y-6">
            <!-- Match Header -->
            <div class="bg-gray-700 rounded-lg p-6">
                <div class="flex items-center justify-between mb-4">
                    <span class="status-badge ${status.status === "completed" ? "status-completed" : status.status === "live" ? "status-active" : "status-upcoming"}">
                        ${status.label}
                    </span>
                    <span class="text-gray-400">${utils.formatDateTime(fixture.starts)}</span>
                </div>
                
                <div class="flex items-center justify-center space-x-8">
                    <div class="text-center">
                        <h4 class="text-2xl font-semibold text-gray-100">${homeTeam.alias}</h4>
                    </div>
                    <div class="score-display bg-gray-800 text-3xl">
                        ${
                          fixture.finalScore
                            ? `
                            <span>${fixture.finalScore[0]}</span>
                            <span class="text-gray-500">-</span>
                            <span>${fixture.finalScore[1]}</span>
                        `
                            : '<span class="text-gray-500">vs</span>'
                        }
                    </div>
                    <div class="text-center">
                        <h4 class="text-2xl font-semibold text-gray-100">${awayTeam.alias}</h4>
                    </div>
                </div>
                
                <div class="mt-4 pt-4 border-t border-gray-600 grid grid-cols-2 gap-4 text-sm">
                    ${
                      fixture.venue
                        ? `
                        <div>
                            <span class="text-gray-500">Venue:</span>
                            <span class="text-gray-300 ml-2">${fixture.venue}</span>
                        </div>
                    `
                        : ""
                    }
                    ${
                      fixture.referee
                        ? `
                        <div>
                            <span class="text-gray-500">Referee:</span>
                            <span class="text-gray-300 ml-2">${fixture.referee}</span>
                        </div>
                    `
                        : ""
                    }
                    <div>
                        <span class="text-gray-500">Format:</span>
                        <span class="text-gray-300 ml-2">${fixture.hasHalves ? "Two Halves" : "Continuous"}</span>
                    </div>
                </div>
            </div>
            
            <!-- Events Timeline -->
            ${
              fixture.events && fixture.events.length > 0
                ? `
                <div>
                    <h5 class="text-lg font-semibold text-gray-100 mb-4">Match Events</h5>
                    <div class="event-timeline">
                        ${fixture.events.map((event) => renderEventItem(event)).join("")}
                    </div>
                </div>
            `
                : '<p class="text-center text-gray-400">No events recorded for this fixture</p>'
            }
        </div>
    `

  utils.createModal("Fixture Details", content, "large")
}

// Render event item
function renderEventItem(event) {
  const icon = utils.getEventIcon(event.title)
  const color = utils.getEventColor(event.title)

  let participantsText = ""
  if (event.title.toLowerCase() === "goal" && event.participants.length === 2) {
    participantsText = `
            <span class="font-medium">${utils.formatPlayerName(event.participants[0])}</span>
            <span class="text-gray-500 text-sm ml-2">(Assist: ${utils.formatPlayerName(event.participants[1])})</span>
        `
  } else if (event.participants.length === 1) {
    participantsText = `<span class="font-medium">${utils.formatPlayerName(event.participants[0])}</span>`
  } else {
    participantsText = event.participants.map((p) => utils.formatPlayerName(p)).join(", ")
  }

  return `
        <div class="event-item">
            <div class="bg-gray-700 rounded-lg p-4">
                <div class="flex items-start space-x-3">
                    <div class="${color}">${icon}</div>
                    <div class="flex-1">
                        <h6 class="font-medium text-gray-100">${event.title}</h6>
                        <p class="text-gray-300 mt-1">${participantsText}</p>
                        ${event.description ? `<p class="text-sm text-gray-400 mt-2">${event.description}</p>` : ""}
                    </div>
                </div>
            </div>
        </div>
    `
}

// Calculate standings from fixtures
function calculateStandings(teams, fixtures) {
  // Initialize standings for each team
  const standings = {}

  teams.forEach((team) => {
    standings[team.id] = {
      teamId: team.id,
      teamName: team.alias,
      teamLetter: team.letter,
      matchesPlayed: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsScored: 0,
      goalsConceded: 0,
      goalDifference: 0,
      points: 0,
    }
  })

  // Process each fixture that has been completed (has finalScore)
  fixtures.forEach((fixture) => {
    if (fixture.finalScore && fixture.finalScore.length === 2 && fixture.participants.length === 2) {
      const homeTeam = fixture.participants[0]
      const awayTeam = fixture.participants[1]
      const homeScore = fixture.finalScore[0]
      const awayScore = fixture.finalScore[1]

      // Update home team stats
      if (standings[homeTeam.id]) {
        standings[homeTeam.id].matchesPlayed++
        standings[homeTeam.id].goalsScored += homeScore
        standings[homeTeam.id].goalsConceded += awayScore

        if (homeScore > awayScore) {
          standings[homeTeam.id].wins++
          standings[homeTeam.id].points += 3
        } else if (homeScore === awayScore) {
          standings[homeTeam.id].draws++
          standings[homeTeam.id].points += 1
        } else {
          standings[homeTeam.id].losses++
        }
      }

      // Update away team stats
      if (standings[awayTeam.id]) {
        standings[awayTeam.id].matchesPlayed++
        standings[awayTeam.id].goalsScored += awayScore
        standings[awayTeam.id].goalsConceded += homeScore

        if (awayScore > homeScore) {
          standings[awayTeam.id].wins++
          standings[awayTeam.id].points += 3
        } else if (awayScore === homeScore) {
          standings[awayTeam.id].draws++
          standings[awayTeam.id].points += 1
        } else {
          standings[awayTeam.id].losses++
        }
      }
    }
  })

  // Calculate goal difference
  Object.values(standings).forEach((team) => {
    team.goalDifference = team.goalsScored - team.goalsConceded
  })

  // Convert to array and sort by points, then goal difference, then goals scored
  const sortedStandings = Object.values(standings).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
    if (b.goalsScored !== a.goalsScored) return b.goalsScored - a.goalsScored
    return a.teamName.localeCompare(b.teamName)
  })

  return sortedStandings
}

// Render standings table
function renderStandingsTable(teams, fixtures) {
  const standings = calculateStandings(teams, fixtures)

  if (standings.length === 0) {
    return `
            <div class="text-center py-8">
                <p class="text-gray-400">No standings data available</p>
            </div>
        `
  }

  return `
        <div class="overflow-x-auto">
            <table class="w-full text-left">
                <thead>
                    <tr class="border-b border-gray-700">
                        <th class="px-4 py-3 text-gray-400 font-medium text-sm">#</th>
                        <th class="px-4 py-3 text-gray-400 font-medium text-sm">Team</th>
                        <th class="px-4 py-3 text-gray-400 font-medium text-sm text-center">MP</th>
                        <th class="px-4 py-3 text-gray-400 font-medium text-sm text-center">W</th>
                        <th class="px-4 py-3 text-gray-400 font-medium text-sm text-center">D</th>
                        <th class="px-4 py-3 text-gray-400 font-medium text-sm text-center">L</th>
                        <th class="px-4 py-3 text-gray-400 font-medium text-sm text-center">GS:GC</th>
                        <th class="px-4 py-3 text-gray-400 font-medium text-sm text-center">GD</th>
                        <th class="px-4 py-3 text-gray-400 font-medium text-sm text-center">P</th>
                    </tr>
                </thead>
                <tbody>
                    ${standings
                      .map(
                        (team, index) => `
                        <tr class="border-b border-gray-700 hover:bg-gray-800 transition-colors ${index < 3 ? "bg-gray-800 bg-opacity-50" : ""}">
                            <td class="px-4 py-3 text-gray-400">
                                ${index + 1}
                                ${index === 0 ? '<span class="ml-1 text-yellow-500">🏆</span>' : ""}
                                ${index === 1 ? '<span class="ml-1 text-gray-400">🥈</span>' : ""}
                                ${index === 2 ? '<span class="ml-1 text-orange-600">🥉</span>' : ""}
                            </td>
                            <td class="px-4 py-3">
                                <div class="flex items-center space-x-2">
                                    <span class="text-green-500 font-bold">${team.teamLetter}</span>
                                    <span class="text-gray-100 font-medium">${team.teamName}</span>
                                </div>
                            </td>
                            <td class="px-4 py-3 text-center text-gray-300">${team.matchesPlayed}</td>
                            <td class="px-4 py-3 text-center text-green-500 font-medium">${team.wins}</td>
                            <td class="px-4 py-3 text-center text-yellow-500 font-medium">${team.draws}</td>
                            <td class="px-4 py-3 text-center text-red-500 font-medium">${team.losses}</td>
                            <td class="px-4 py-3 text-center text-gray-300">
                                <span class="text-green-400">${team.goalsScored}</span>:<span class="text-red-400">${team.goalsConceded}</span>
                            </td>
                            <td class="px-4 py-3 text-center font-medium ${team.goalDifference > 0 ? "text-green-400" : team.goalDifference < 0 ? "text-red-400" : "text-gray-400"}">
                                ${team.goalDifference > 0 ? "+" : ""}${team.goalDifference}
                            </td>
                            <td class="px-4 py-3 text-center text-gray-100 font-bold text-lg">${team.points}</td>
                        </tr>
                    `
                      )
                      .join("")}
                </tbody>
            </table>
        </div>
        <div class="mt-4 text-sm text-gray-500">
            <p><strong>Legend:</strong> MP = Matches Played, W = Wins, D = Draws, L = Losses, GS = Goals Scored, GC = Goals Conceded, GD = Goal Difference, P = Points</p>
            <p class="mt-1">Points: Win = 3, Draw = 1, Loss = 0</p>
        </div>
    `
}

// Helper functions to find items by ID
function findTeamById(id) {
  // First check in current state
  let team = appState.teams.find((t) => t.id === id)
  if (team) return team

  // Check in competitions
  for (const comp of appState.competitions) {
    if (comp.teams) {
      team = comp.teams.find((t) => t.id === id)
      if (team) return team
    }
  }

  // Check in selected competition
  if (appState.selectedCompetition && appState.selectedCompetition.teams) {
    team = appState.selectedCompetition.teams.find((t) => t.id === id)
    if (team) return team
  }

  return null
}

function findFixtureById(id) {
  // First check in current state
  let fixture = appState.fixtures.find((f) => f.id === id)
  if (fixture) return fixture

  // Check in competitions
  for (const comp of appState.competitions) {
    if (comp.fixtures) {
      fixture = comp.fixtures.find((f) => f.id === id)
      if (fixture) return fixture
    }
  }

  // Check in selected competition
  if (appState.selectedCompetition && appState.selectedCompetition.fixtures) {
    fixture = appState.selectedCompetition.fixtures.find((f) => f.id === id)
    if (fixture) return fixture
  }

  return null
}

// Initialize application
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize API
  await API.initialize()

  // Setup mobile menu
  const mobileMenuBtn = document.getElementById("mobile-menu-btn")
  const mobileMenu = document.getElementById("mobile-menu")

  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden")
  })

  // Initialize router
  router.init()

  // Show welcome message
  utils.showToast("Welcome to Competition Tracker!", "success")
})
