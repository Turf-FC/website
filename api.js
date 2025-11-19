// API communication functions for Competition Tracker

const API = {
  // Base API URL
  baseURL: "http://107.174.249.39:5000/api",

  // Helper function for making API requests
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      console.error(`API Request Failed: ${endpoint}`, error)
      return {
        success: false,
        error: error.message || "Network error occurred",
      }
    }
  },

  // Competition endpoints
  competitions: {
    // Get all competitions
    async getAll() {
      const result = await API.request("/competitions")
      if (result.success) {
        // Process competitions to ensure proper structure
        result.data = result.data.map((comp) => ({
          ...comp,
          teams: comp.teams || [],
          fixtures: comp.fixtures || [],
        }))
      }
      return result
    },

    // Get single competition by ID
    async getById(id) {
      const result = await API.request(`/competitions/${id}`)
      if (result.success) {
        // Ensure nested data is properly structured
        result.data = {
          ...result.data,
          teams: result.data.teams || [],
          fixtures: result.data.fixtures || [],
        }
      }
      return result
    },

    // Create new competition
    async create(competitionData) {
      return await API.request("/competitions", {
        method: "POST",
        body: JSON.stringify(competitionData),
      })
    },

    // Update competition
    async update(id, competitionData) {
      return await API.request(`/competitions/${id}`, {
        method: "PUT",
        body: JSON.stringify(competitionData),
      })
    },

    // Delete competition
    async delete(id) {
      return await API.request(`/competitions/${id}`, {
        method: "DELETE",
      })
    },
  },

  // Team endpoints
  teams: {
    // Get all teams
    async getAll() {
      const result = await API.request("/teams")
      if (result.success) {
        // Process teams to ensure proper structure
        result.data = result.data.map((team) => ({
          ...team,
          players: team.players || [],
        }))
      }
      return result
    },

    // Get single team by ID
    async getById(id) {
      const result = await API.request(`/teams/${id}`)
      if (result.success) {
        result.data = {
          ...result.data,
          players: result.data.players || [],
        }
      }
      return result
    },

    // Get teams by competition ID
    async getByCompetition(competitionId) {
      const result = await API.request(`/competitions/${competitionId}/teams`)
      if (result.success) {
        result.data = result.data.map((team) => ({
          ...team,
          players: team.players || [],
        }))
      }
      return result
    },

    // Create new team
    async create(teamData) {
      return await API.request("/teams", {
        method: "POST",
        body: JSON.stringify(teamData),
      })
    },

    // Update team
    async update(id, teamData) {
      return await API.request(`/teams/${id}`, {
        method: "PUT",
        body: JSON.stringify(teamData),
      })
    },

    // Delete team
    async delete(id) {
      return await API.request(`/teams/${id}`, {
        method: "DELETE",
      })
    },
  },

  // Player endpoints
  players: {
    // Get all players
    async getAll() {
      return await API.request("/players")
    },

    // Get single player by ID
    async getById(id) {
      return await API.request(`/players/${id}`)
    },

    // Get players by team ID
    async getByTeam(teamId) {
      return await API.request(`/teams/${teamId}/players`)
    },

    // Create new player
    async create(playerData) {
      return await API.request("/players", {
        method: "POST",
        body: JSON.stringify(playerData),
      })
    },

    // Update player
    async update(id, playerData) {
      return await API.request(`/players/${id}`, {
        method: "PUT",
        body: JSON.stringify(playerData),
      })
    },

    // Delete player
    async delete(id) {
      return await API.request(`/players/${id}`, {
        method: "DELETE",
      })
    },
  },

  // Fixture endpoints
  fixtures: {
    // Get all fixtures
    async getAll() {
      const result = await API.request("/fixtures")
      if (result.success) {
        // Process fixtures to ensure proper structure
        result.data = result.data.map((fixture) => ({
          ...fixture,
          participants: fixture.participants || [],
          events: fixture.events || [],
          finalScore: fixture.finalScore || null,
        }))
      }
      return result
    },

    // Get single fixture by ID
    async getById(id) {
      const result = await API.request(`/fixtures/${id}`)
      if (result.success) {
        result.data = {
          ...result.data,
          participants: result.data.participants || [],
          events: result.data.events || [],
          finalScore: result.data.finalScore || null,
        }
      }
      return result
    },

    // Get fixtures by competition ID
    async getByCompetition(competitionId) {
      const result = await API.request(`/competitions/${competitionId}/fixtures`)
      if (result.success) {
        result.data = result.data.map((fixture) => ({
          ...fixture,
          participants: fixture.participants || [],
          events: fixture.events || [],
          finalScore: fixture.finalScore || null,
        }))
      }
      return result
    },

    // Create new fixture
    async create(fixtureData) {
      return await API.request("/fixtures", {
        method: "POST",
        body: JSON.stringify(fixtureData),
      })
    },

    // Update fixture
    async update(id, fixtureData) {
      return await API.request(`/fixtures/${id}`, {
        method: "PUT",
        body: JSON.stringify(fixtureData),
      })
    },

    // Delete fixture
    async delete(id) {
      return await API.request(`/fixtures/${id}`, {
        method: "DELETE",
      })
    },
  },

  // Event endpoints
  events: {
    // Get all events
    async getAll() {
      const result = await API.request("/events")
      if (result.success) {
        // Process events to ensure proper structure
        result.data = result.data.map((event) => ({
          ...event,
          participants: event.participants || [],
        }))
      }
      return result
    },

    // Get single event by ID
    async getById(id) {
      const result = await API.request(`/events/${id}`)
      if (result.success) {
        result.data = {
          ...result.data,
          participants: result.data.participants || [],
        }
      }
      return result
    },

    // Get events by fixture ID
    async getByFixture(fixtureId) {
      const result = await API.request(`/fixtures/${fixtureId}/events`)
      if (result.success) {
        result.data = result.data.map((event) => ({
          ...event,
          participants: event.participants || [],
        }))
      }
      return result
    },

    // Create new event
    async create(eventData) {
      return await API.request("/events", {
        method: "POST",
        body: JSON.stringify(eventData),
      })
    },

    // Update event
    async update(id, eventData) {
      return await API.request(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(eventData),
      })
    },

    // Delete event
    async delete(id) {
      return await API.request(`/events/${id}`, {
        method: "DELETE",
      })
    },
  },

  // Initialize API with mock data fallback
  async initialize() {
    // Try to fetch real data, fall back to mock if API is not available
    const testResult = await this.competitions.getAll()
    if (!testResult.success) {
      console.log("API not available, using mock data")
      // Override the request method to return mock data
      this.useMockData = true

      // Override request method for mock data
      this.request = async (endpoint) => {
        if (endpoint === "/competitions") {
          return { success: true, data: this.mockData.competitions }
        } else if (endpoint === "/teams") {
          const teams = this.mockData.competitions.flatMap((c) => c.teams)
          return { success: true, data: teams }
        } else if (endpoint === "/players") {
          const players = this.mockData.competitions.flatMap((c) => c.teams.flatMap((t) => t.players))
          return { success: true, data: players }
        } else if (endpoint === "/fixtures") {
          const fixtures = this.mockData.competitions.flatMap((c) => c.fixtures)
          return { success: true, data: fixtures }
        } else if (endpoint === "/events") {
          const events = this.mockData.competitions.flatMap((c) => c.fixtures.flatMap((f) => f.events))
          return { success: true, data: events }
        } else if (endpoint.includes("/competitions/")) {
          const id = endpoint.split("/").pop()
          const comp = this.mockData.competitions.find((c) => c.id === id)
          return { success: true, data: comp }
        }
        return { success: false, error: "Endpoint not found" }
      }
    }
  },
}
