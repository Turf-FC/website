// Main Application JavaScript
const App = {
  currentEntity: "competitions",
  currentData: [],
  editingId: null,
  showArchived: false,
  searchQuery: "",
  multiSelects: {},

  // Entity configurations
  entities: {
    competitions: {
      title: "Competitions",
      description: "Manage your sports competitions",
      columns: ["ID", "Year", "Start Date", "Format", "Actions"],
      fields: [
        { name: "year", type: "number", label: "Year", required: true },
        { name: "starts", type: "datetime", label: "Start Date", required: true },
        {
          name: "format",
          type: "select",
          label: "Format",
          required: true,
          options: [
            { value: "Round Robin: Single Legs", label: "Round Robin: Single Legs" },
            { value: "Round Robin: Double Legs", label: "Round Robin: Double Legs" },
            { value: "Knockout: Finals", label: "Knockout: Finals" },
            { value: "Knockout: With Group Stage", label: "Knockout: With Group Stage" },
          ],
        },
        {
          name: "teams",
          type: "multi-select",
          label: "Teams",
          required: false,
          maxSelections: 100,
          options: [],
        },
      ],
    },

    teams: {
      title: "Teams",
      description: "Manage your teams",
      columns: ["ID", "Letter", "Name", "Color", "Actions"],
      fields: [
        { name: "letter", type: "text", label: "Team Letter", required: true, placeholder: "e.g., A" },
        { name: "alias", type: "text", label: "Team Name", required: true, placeholder: "e.g., Virgins FC" },
        { name: "color", type: "color", label: "Team Color", required: true, default: "#3B82F6" },
      ],
    },

    players: {
      title: "Players",
      description: "Manage your players",
      columns: ["ID", "First Name", "Last Name", "Alias", "Primary Position", "Actions"],
      fields: [
        { name: "firstName", type: "text", label: "First Name", required: true },
        { name: "lastName", type: "text", label: "Last Name", required: true },
        { name: "alias", type: "text", label: "Alias/Nickname", required: false },
        {
          name: "primaryPosition",
          type: "select",
          label: "Primary Position",
          required: true,
          options: [],
        },
        {
          name: "alternatePositions",
          type: "multi-select",
          label: "Alternate Positions",
          required: false,
          maxSelections: 4,
          options: [],
        },
        { name: "imageUrl", type: "text", label: "Image URL", required: false, placeholder: "https://example.com/image.jpg" },
      ],
    },

    fixtures: {
      title: "Fixtures",
      description: "Manage your fixtures",
      columns: ["ID", "Kick-off Time", "Venue", "Referee", "Final Score", "Actions"],
      fields: [
        { name: "homeTeam", type: "select", label: "Home Team", required: true, dataSource: "teams" },
        { name: "awayTeam", type: "select", label: "Away Team", required: true, dataSource: "teams" },
        { name: "kickoffTime", type: "datetime", label: "Kick-off Time", required: true },
        { name: "referee", type: "text", label: "Referee", required: false },
        { name: "hasHalves", type: "checkbox", label: "Has Halves?", required: false },
        { name: "venue", type: "text", label: "Venue", required: false, default: "Mo Arena" },
        { name: "finalScore", type: "text", label: "Final Score", required: false, placeholder: "e.g., 2-1" },
      ],
    },

    events: {
      title: "Events",
      description: "Manage match events",
      columns: ["ID", "Title", "Description", "Actions"],
      fields: [
        { name: "fixture", type: "select", label: "Fixture", required: true, dataSource: "fixtures" },
        { name: "eventTitle", type: "text", label: "Event Title", required: true, placeholder: "e.g., Goal, Yellow Card" },
        { name: "description", type: "textarea", label: "Description", required: false, rows: 3 },
        { name: "participants", type: "multi-select", label: "Participants", required: false, dataSource: "players" },
      ],
    },
  },

  // Initialize application
  async init() {
    // Check authentication
    if (!Auth.isAuthenticated()) {
      window.location.href = "login.html"
      return
    }

    // Set up event listeners
    this.setupEventListeners()

    this.initializePositionOptions()

    this.initializeTeamOptions()

    // Load initial entity
    await this.switchEntity(this.currentEntity)
  },

  // Set up event listeners
  setupEventListeners() {
    // Navigation clicks
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", async (e) => {
        e.preventDefault()
        const entity = item.dataset.entity
        if (entity) {
          await this.switchEntity(entity)
        }
      })
    })

    // Show archived toggle
    const showArchived = document.getElementById("showArchived")
    if (showArchived) {
      showArchived.addEventListener("change", (e) => {
        this.showArchived = e.target.checked
        this.loadData()
      })
    }

    // Refresh button
    const refreshBtn = document.getElementById("refreshBtn")
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        this.loadData()
        showToast("Data refreshed", "success")
      })
    }

    // Search input
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
      searchInput.addEventListener(
        "input",
        debounce((e) => {
          this.searchQuery = e.target.value.toLowerCase()
          this.renderTable()
        }, 300)
      )
    }

    // Form submit
    const form = document.getElementById("entityForm")
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
        this.saveEntity()
      })

      form.addEventListener("reset", () => {
        this.resetForm()
      })
    }
  },

  // Switch entity
  async switchEntity(entity) {
    this.currentEntity = entity
    this.editingId = null
    this.searchQuery = ""

    // Update navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
      if (item.dataset.entity === entity) {
        item.classList.add("active")
      }
    })

    // Update header
    const config = this.entities[entity]
    document.getElementById("entityTitle").textContent = config.title
    document.getElementById("entityDescription").textContent = config.description

    // Clear search
    const searchInput = document.getElementById("searchInput")
    if (searchInput) {
      searchInput.value = ""
    }

    // Render form
    this.renderForm()

    // Load data
    await this.loadData()
  },

  // Load data from API
  async loadData() {
    try {
      updateConnectionStatus("connecting")
      const allData = await API[this.currentEntity].getAll(this.showArchived)
      console.log("Loaded data for", allData)
      this.currentData = allData
      updateConnectionStatus("connected")
      this.renderTable()
    } catch (error) {
      console.error("Error loading data:", error)
      updateConnectionStatus("disconnected")
      showToast("Failed to load data", "error")
    }
  },

  // Render table
  renderTable() {
    const config = this.entities[this.currentEntity]
    const tableHeader = document.getElementById("tableHeader")
    const tableBody = document.getElementById("tableBody")
    const emptyState = document.getElementById("emptyState")

    // Render headers
    tableHeader.innerHTML = `
            <tr>
                ${config.columns.map((col) => `<th>${col}</th>`).join("")}
            </tr>
        `

    // Filter data based on search
    let filteredData = this.currentData
    if (this.searchQuery) {
      filteredData = this.currentData.filter((item) => {
        const searchStr = JSON.stringify(item).toLowerCase()
        return searchStr.includes(this.searchQuery)
      })
    }

    // Show empty state if no data
    if (filteredData.length === 0) {
      tableBody.innerHTML = ""
      emptyState.classList.remove("hidden")
      return
    }

    emptyState.classList.add("hidden")

    // Render rows
    tableBody.innerHTML = filteredData
      .map((item) => {
        const rowClass = item.archived ? "archived" : ""
        return `
                <tr class="${rowClass}">
                    ${this.renderRowData(item)}
                    <td>
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="App.editEntity('${item.id}')" title="Edit">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </button>
                            ${
                              item.archived
                                ? `
                                <button class="action-btn restore" onclick="App.restoreEntity(${item.id})" title="Restore">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                </button>
                            `
                                : `
                                <button class="action-btn archive" onclick="App.archiveEntity(${item.id})" title="Archive">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                                    </svg>
                                </button>
                            `
                            }
                            <button class="action-btn delete" onclick="App.deleteEntity('${item.id}')" title="Delete">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `
      })
      .join("")
  },

  // Render row data based on entity type
  renderRowData(item) {
    switch (this.currentEntity) {
      case "competitions":
        return `
                    <td>${item.id}</td>
                    <td>${item.year}</td>
                    <td>${formatDate(item.starts)}</td>
                    <td>${item.format}</td>
                `
      case "teams":
        return `
                    <td>${item.id}</td>
                    <td>${item.letter}</td>
                    <td>${item.alias}</td>
                    <td><span class="color-badge" style="background-color: ${item.color}"></span></td>
                `
      case "players":
        return `
                    <td>${item.id}</td>
                    <td>${item.firstName}</td>
                    <td>${item.lastName}</td>
                    <td>${item.alias || "-"}</td>
                    <td>${item.primaryPosition}</td>
                `
      case "fixtures":
        return `
                    <td>${item.id}</td>
                    <td>${formatDateTime(item.kickoffTime)}</td>
                    <td>${item.venue || "-"}</td>
                    <td>${item.referee || "-"}</td>
                    <td>${item.finalScore || "-"}</td>
                `
      case "events":
        return `
                    <td>${item.id}</td>
                    <td>${item.eventTitle}</td>
                    <td>${item.description || "-"}</td>
                `
      default:
        return `<td colspan="5">Unknown entity</td>`
    }
  },

  // Render form
  async renderForm() {
    const config = this.entities[this.currentEntity]
    const formFields = document.getElementById("formFields")
    const formTitle = document.getElementById("formTitle")

    formTitle.textContent = this.editingId ? "Edit" : "Add New"

    // Load data sources for select fields
    const dataSources = {}
    for (const field of config.fields) {
      if (field.dataSource) {
        try {
          dataSources[field.dataSource] = await API[field.dataSource].getAll(false)
        } catch (error) {
          console.error(`Error loading ${field.dataSource}:`, error)
          dataSources[field.dataSource] = []
        }
      }
    }

    // Clear existing multi-selects
    this.multiSelects = {}

    // Render fields
    formFields.innerHTML = config.fields
      .map((field) => {
        const required = field.required ? "required" : ""
        let input = ""

        switch (field.type) {
          case "text":
            input = `<input type="text" id="${field.name}" name="${field.name}" class="form-input" ${required} placeholder="${field.placeholder || ""}">`
            break

          case "number":
            input = `<input type="number" id="${field.name}" name="${field.name}" class="form-input" ${required}>`
            break

          case "datetime":
            input = `<input type="datetime-local" id="${field.name}" name="${field.name}" class="form-input" ${required}>`
            break

          case "color":
            input = `<input type="color" id="${field.name}" name="${field.name}" class="form-input" ${required} value="${field.default || "#000000"}">`
            break

          case "select":
            let options = field.options || []
            if (field.dataSource && dataSources[field.dataSource]) {
              options = dataSources[field.dataSource].map((item) => {
                if (field.dataSource === "teams") {
                  return { value: item.id, label: `${item.teamLetter} - ${item.teamName}` }
                } else if (field.dataSource === "players") {
                  return { value: item.id, label: `${item.firstName} ${item.lastName}` }
                } else if (field.dataSource === "fixtures") {
                  return { value: item.id, label: `Fixture ${item.id} - ${formatDateTime(item.kickoffTime)}` }
                }
                return { value: item.id, label: item.name || item.title || `Item ${item.id}` }
              })
            }
            input = `
                        <select id="${field.name}" name="${field.name}" class="form-select" ${required}>
                            <option value="">Select ${field.label}</option>
                            ${options.map((opt) => `<option value="${opt.value}">${opt.label}</option>`).join("")}
                        </select>
                    `
            break

          case "multi-select":
            input = `<div id="${field.name}" class="multi-select-container" data-field="${field.name}"></div>`
            break

          case "checkbox":
            input = `
                        <label class="flex items-center">
                            <input type="checkbox" id="${field.name}" name="${field.name}" class="form-checkbox">
                            <span class="ml-2 text-sm">Yes</span>
                        </label>
                    `
            break

          case "textarea":
            input = `<textarea id="${field.name}" name="${field.name}" class="form-textarea" rows="${field.rows || 3}" ${required} placeholder="${field.placeholder || ""}"></textarea>`
            break

          default:
            input = `<input type="text" id="${field.name}" name="${field.name}" class="form-input" ${required}>`
        }

        return `
                <div>
                    ${field.type !== "checkbox" ? `<label for="${field.name}" class="block text-sm font-medium mb-1">${field.label}</label>` : ""}
                    ${input}
                </div>
            `
      })
      .join("")

    // Initialize multi-selects
    config.fields.forEach((field) => {
      if (field.type === "multi-select") {
        const container = document.getElementById(field.name)
        if (container) {
          let options = field.options || []
          if (field.dataSource && dataSources[field.dataSource]) {
            options = dataSources[field.dataSource].map((item) => {
              if (field.dataSource === "players") {
                return { value: item.id, label: `${item.firstName} ${item.lastName}` }
              }
              return { value: item.id, label: item.name || item.title || `Item ${item.id}` }
            })
          }
          this.multiSelects[field.name] = createMultiSelect(container, options, [], field.maxSelections)
        }
      }
    })

    // Set default values
    config.fields.forEach((field) => {
      if (field.default && !this.editingId) {
        const element = document.getElementById(field.name)
        if (element) {
          element.value = field.default
        }
      }
    })
  },

  // Edit entity
  async editEntity(id) {
    try {
      const item = await API[this.currentEntity].getById(id)
      if (!item) {
        showToast("Item not found", "error")
        return
      }

      this.editingId = id
      const config = this.entities[this.currentEntity]

      // Update form title
      document.getElementById("formTitle").textContent = "Edit"

      // Populate form fields
      config.fields.forEach((field) => {
        const element = document.getElementById(field.name)
        if (element) {
          if (field.type === "datetime") {
            element.value = fromISO(item[field.name])
          } else if (field.type === "checkbox") {
            element.checked = item[field.name] || false
          } else if (field.type === "multi-select") {
            if (this.multiSelects[field.name]) {
              this.multiSelects[field.name].setSelected(item[field.name] || [])
            }
          } else {
            element.value = item[field.name] || ""
          }
        }
      })

      // Scroll to form
      document.getElementById("entityForm").scrollIntoView({ behavior: "smooth" })
    } catch (error) {
      console.error("Error editing entity:", error)
      showToast("Failed to load item", "error")
    }
  },

  // Save entity
  async saveEntity() {
    const config = this.entities[this.currentEntity]
    const formData = {}

    // Collect form data
    for (const field of config.fields) {
      const element = document.getElementById(field.name)
      if (element) {
        if (field.type === "datetime") {
          formData[field.name] = toISO(element.value)
        } else if (field.type === "checkbox") {
          formData[field.name] = element.checked
        } else if (field.type === "number") {
          formData[field.name] = element.value ? parseInt(element.value) : null
        } else if (field.type === "multi-select") {
          formData[field.name] = this.multiSelects[field.name]?.getSelected() || []
        } else {
          formData[field.name] = element.value
        }
      }
    }

    try {
      if (this.editingId) {
        await API[this.currentEntity].update(this.editingId, formData)
        showToast("Item updated successfully", "success")
      } else {
        console.log("Creating item with data:", formData)
        await API[this.currentEntity].create(formData)
        showToast("Item created successfully", "success")
      }

      this.resetForm()
      await this.loadData()
    } catch (error) {
      console.error("Error saving entity:", error)
      showToast("Failed to save item", "error")
    }
  },

  // Archive entity
  async archiveEntity(id) {
    if (await showConfirm("Are you sure you want to archive this item?")) {
      try {
        await API[this.currentEntity].archive(id)
        showToast("Item archived successfully", "success")
        await this.loadData()
      } catch (error) {
        console.error("Error archiving entity:", error)
        showToast("Failed to archive item", "error")
      }
    }
  },

  // Restore entity
  async restoreEntity(id) {
    try {
      await API[this.currentEntity].restore(id)
      showToast("Item restored successfully", "success")
      await this.loadData()
    } catch (error) {
      console.error("Error restoring entity:", error)
      showToast("Failed to restore item", "error")
    }
  },

  // Delete entity
  async deleteEntity(id) {
    if (await showConfirm("Are you sure you want to permanently delete this item? This action cannot be undone.")) {
      try {
        await API[this.currentEntity].delete(id)
        showToast("Item deleted successfully", "success")
        await this.loadData()
      } catch (error) {
        console.error("Error deleting entity:", error)
        showToast("Failed to delete item", "error")
      }
    }
  },

  // Reset form
  resetForm() {
    this.editingId = null
    document.getElementById("formTitle").textContent = "Add New"
    document.getElementById("entityForm").reset()

    // Clear multi-selects
    Object.values(this.multiSelects).forEach((multiSelect) => {
      multiSelect.clear()
    })

    // Restore default values
    const config = this.entities[this.currentEntity]
    config.fields.forEach((field) => {
      if (field.default) {
        const element = document.getElementById(field.name)
        if (element) {
          element.value = field.default
        }
      }
    })
  },

  // Get position options for players
  getPositionOptions() {
    return [
      { value: "GK", label: "GK - Goalkeeper" },
      { value: "CB", label: "CB - Center Back" },
      { value: "RCB", label: "RCB - Right Center Back" },
      { value: "LCB", label: "LCB - Left Center Back" },
      { value: "RB", label: "RB - Right Back" },
      { value: "LB", label: "LB - Left Back" },
      { value: "RWB", label: "RWB - Right Wing Back" },
      { value: "LWB", label: "LWB - Left Wing Back" },
      { value: "CDM", label: "CDM - Defensive Midfielder" },
      { value: "CM", label: "CM - Central Midfielder" },
      { value: "LCM", label: "LCM - Left Central Midfielder" },
      { value: "RCM", label: "RCM - Right Central Midfielder" },
      { value: "CAM", label: "CAM - Attacking Midfielder" },
      { value: "LM", label: "LM - Left Midfielder" },
      { value: "RM", label: "RM - Right Midfielder" },
      { value: "LAM", label: "LAM - Left Attacking Midfielder" },
      { value: "RAM", label: "RAM - Right Attacking Midfielder" },
      { value: "CF", label: "CF - Center Forward" },
      { value: "ST", label: "ST - Striker" },
    ]
  },

  // Initialize position options after App is loaded
  initializePositionOptions() {
    const positionOptions = this.getPositionOptions()
    this.entities.players.fields[3].options = positionOptions // primaryPosition
    this.entities.players.fields[4].options = positionOptions // alternatePositions
  },
}

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init()
})
