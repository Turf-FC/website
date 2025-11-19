// API Service Layer
const API = {
  baseURL: "http://localhost:5000/api",

  // Get auth token
  getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token")
  },

  // Base fetch wrapper with auth
  async fetch(endpoint, options = {}) {
    const token = this.getToken()
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    try {
      const url = endpoint.startsWith("http") ? endpoint : `${this.baseURL}${endpoint}`
      //   console.log("API Request:", url, options)
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle unauthorized
      if (response.status === 401) {
        localStorage.removeItem("token")
        sessionStorage.removeItem("token")
        window.location.href = "login.html"
        return null
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      console.log("API Response:", url, data)

      return data
    } catch (error) {
      console.error("API Error:", error)
      throw error
    }
  },

  // Auth endpoints
  auth: {
    async login(username, password) {
      console.log("API.login called with:", { username, password })
      return API.fetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })
    },

    async check() {
      return API.fetch("/auth/check")
    },

    logout() {
      localStorage.removeItem("token")
      sessionStorage.removeItem("token")
      window.location.href = "login.html"
    },
  },

  // CRUD operations for competitions
  competitions: {
    async getAll(includeArchived = false) {
      return API.fetch(`/competitions?archived=${includeArchived}`)
    },

    async getById(id) {
      return API.fetch(`/competitions/${id}`)
    },

    async create(data) {
      return API.fetch("/competitions", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    async update(id, data) {
      return API.fetch(`/competitions/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      return API.fetch(`/competitions/${id}`, {
        method: "DELETE",
      })
    },

    async archive(id) {
      return API.fetch(`/competitions/${id}/archive`, {
        method: "PATCH",
      })
    },

    async restore(id) {
      return API.fetch(`/competitions/${id}/restore`, {
        method: "PATCH",
      })
    },
  },

  // CRUD operations for teams
  teams: {
    async getAll(includeArchived = false) {
      return API.fetch(`/teams?archived=${includeArchived}`)
    },

    async getById(id) {
      return API.fetch(`/teams/${id}`)
    },

    async create(data) {
      return API.fetch("/teams", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    async update(id, data) {
      return API.fetch(`/teams/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      return API.fetch(`/teams/${id}`, {
        method: "DELETE",
      })
    },

    async archive(id) {
      return API.fetch(`/teams/${id}/archive`, {
        method: "PATCH",
      })
    },

    async restore(id) {
      return API.fetch(`/teams/${id}/restore`, {
        method: "PATCH",
      })
    },
  },

  // CRUD operations for players
  players: {
    async getAll(includeArchived = false) {
      return API.fetch(`/players?archived=${includeArchived}`)
    },

    async getById(id) {
      return API.fetch(`/players/${id}`)
    },

    async create(data) {
      return API.fetch("/players", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    async update(id, data) {
      return API.fetch(`/players/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      return API.fetch(`/players/${id}`, {
        method: "DELETE",
      })
    },

    async archive(id) {
      return API.fetch(`/players/${id}/archive`, {
        method: "PATCH",
      })
    },

    async restore(id) {
      return API.fetch(`/players/${id}/restore`, {
        method: "PATCH",
      })
    },
  },

  // CRUD operations for fixtures
  fixtures: {
    async getAll(includeArchived = false) {
      return API.fetch(`/fixtures?archived=${includeArchived}`)
    },

    async getById(id) {
      return API.fetch(`/fixtures/${id}`)
    },

    async create(data) {
      return API.fetch("/fixtures", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    async update(id, data) {
      return API.fetch(`/fixtures/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      return API.fetch(`/fixtures/${id}`, {
        method: "DELETE",
      })
    },

    async archive(id) {
      return API.fetch(`/fixtures/${id}/archive`, {
        method: "PATCH",
      })
    },

    async restore(id) {
      return API.fetch(`/fixtures/${id}/restore`, {
        method: "PATCH",
      })
    },
  },

  // CRUD operations for events
  events: {
    async getAll(includeArchived = false) {
      return API.fetch(`/events?archived=${includeArchived}`)
    },

    async getById(id) {
      return API.fetch(`/events/${id}`)
    },

    async create(data) {
      return API.fetch("/events", {
        method: "POST",
        body: JSON.stringify(data),
      })
    },

    async update(id, data) {
      return API.fetch(`/events/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    },

    async delete(id) {
      return API.fetch(`/events/${id}`, {
        method: "DELETE",
      })
    },

    async archive(id) {
      return API.fetch(`/events/${id}/archive`, {
        method: "PATCH",
      })
    },

    async restore(id) {
      return API.fetch(`/events/${id}/restore`, {
        method: "PATCH",
      })
    },
  },
}
