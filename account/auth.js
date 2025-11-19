// Authentication Module
const Auth = {
  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken()
    return !!token
  },

  // Get stored token
  getToken() {
    return localStorage.getItem("token") || sessionStorage.getItem("token")
  },

  // Store token
  setToken(token, remember = false) {
    if (remember) {
      localStorage.setItem("token", token)
    } else {
      sessionStorage.setItem("token", token)
    }
  },

  // Clear token
  clearToken() {
    localStorage.removeItem("token")
    sessionStorage.removeItem("token")
  },

  // Check authentication on page load
  async checkAuth() {
    if (!this.isAuthenticated()) {
      if (!window.location.pathname.includes("login.html")) {
        window.location.href = "login.html"
      }
      return false
    }

    try {
      const result = await API.auth.check()
      if (!result || !result.valid) {
        this.clearToken()
        if (!window.location.pathname.includes("login.html")) {
          window.location.href = "login.html"
        }
        return false
      }
      return true
    } catch (error) {
      console.error("Auth check failed:", error)
      this.clearToken()
      if (!window.location.pathname.includes("login.html")) {
        window.location.href = "login.html"
      }
      return false
    }
  },

  // Logout
  logout() {
    this.clearToken()
    window.location.href = "login.html"
  },
}

// Login function
async function login(username, password, remember = false) {
  try {
    const result = await API.auth.login(username, password)

    if (result.token) {
      Auth.setToken(result.token, remember)
      return { success: true }
    } else {
      return {
        success: false,
        message: result?.message || "Invalid credentials",
      }
    }
  } catch (error) {
    console.error("Login error:", error)
    return {
      success: false,
      message: error.message || "Login failed. Please try again.",
    }
  }
}

// Initialize authentication check on non-login pages
if (!window.location.pathname.includes("login.html")) {
  document.addEventListener("DOMContentLoaded", async () => {
    const isValid = await Auth.checkAuth()
    if (!isValid) {
      return
    }

    // Set up logout button
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        Auth.logout()
      })
    }
  })
}
