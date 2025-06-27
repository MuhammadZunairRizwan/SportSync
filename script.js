// DOM Elements
const elements = {
  // Sections
  authSection: document.getElementById("auth-section"),
  dashboardSection: document.getElementById("dashboard-section"),
  addGameSection: document.getElementById("add-game-section"),
  gameDetailsSection: document.getElementById("game-details-section"),

  // Auth
  loginBtn: document.getElementById("login-btn"),
  logoutBtn: document.getElementById("logout-btn"),
  usernameDisplay: document.getElementById("username-display"),
  loginForm: document.getElementById("login-form-element"),
  registerForm: document.getElementById("register-form-element"),
  tabBtns: document.querySelectorAll(".tab-btn"),

  // Dashboard
  gamesList: document.getElementById("games-list"),
  addGameBtn: document.getElementById("add-game-btn"),
  onlineCount: document.getElementById("online-count"),
  onlineUsersList: document.getElementById("online-users-list"),

  // Add Game
  addGameForm: document.getElementById("add-game-form"),
  cancelAddGameBtn: document.getElementById("cancel-add-game"),

  // Game Details
  backToGamesBtn: document.getElementById("back-to-games"),
  gameTitle: document.getElementById("game-title"),
  detailTeam1: document.getElementById("detail-team1"),
  detailTeam2: document.getElementById("detail-team2"),
  score1: document.getElementById("score1"),
  score2: document.getElementById("score2"),
  detailSport: document.getElementById("detail-sport"),
  detailTime: document.getElementById("detail-time"),
  detailStatus: document.getElementById("detail-status"),
  team1Votes: document.getElementById("team1-votes"),
  team1VotePercent: document.getElementById("team1-vote-percent"),
  team2VotePercent: document.getElementById("team2-vote-percent"),
  updatesContainer: document.getElementById("updates-container"),
  voteBtns: document.querySelectorAll(".vote-btn"),

  // Admin Controls
  adminControls: document.getElementById("admin-controls"),
  updateScore1: document.getElementById("update-score1"),
  updateScore2: document.getElementById("update-score2"),
  updateScoreBtn: document.getElementById("update-score-btn"),
  gameStatus: document.getElementById("game-status"),
  updateStatusBtn: document.getElementById("update-status-btn"),
  addUpdate: document.getElementById("add-update"),
  addUpdateBtn: document.getElementById("add-update-btn"),

  // Notification
  notification: document.getElementById("notification"),
}

// Global State
const state = {
  user: null,
  isAdmin: false,
  games: [],
  currentGame: null,
  onlineUsers: [],
  socket: null,
}

// Initialize the application
function init() {
  // Check if user is logged in
  checkSession()

  // Load games
  loadGames()

  // Setup WebSocket connection
  setupWebSocket()

  // Add event listeners
  setupEventListeners()
}

// Check if user is logged in via session
function checkSession() {
  fetch("api/check_session.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.loggedIn) {
        state.user = data.user
        state.isAdmin = data.isAdmin
        updateUIForLoggedInUser()
      }
    })
    .catch((error) => {
      console.error("Error checking session:", error)
    })
}

// Load games from the server
function loadGames() {
  fetch("api/games.php")
    .then((response) => response.json())
    .then((data) => {
      state.games = data
      renderGames()
    })
    .catch((error) => {
      console.error("Error loading games:", error)
      showNotification("Failed to load games", true)
    })
}

// Setup WebSocket connection
function setupWebSocket() {
  // Create WebSocket connection
  state.socket = new WebSocket(`ws://${window.location.hostname}:8080`)

  // Connection opened
  state.socket.addEventListener("open", (event) => {
    console.log("Connected to WebSocket server")

    // Send user info if logged in
    if (state.user) {
      state.socket.send(
        JSON.stringify({
          type: "user_connected",
          username: state.user.username,
        }),
      )
    }
  })

  // Listen for messages
  state.socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data)

    switch (data.type) {
      case "online_users":
        updateOnlineUsers(data.users)
        break
      case "game_added":
        addGameToList(data.game)
        break
      case "score_update":
        updateGameScore(data.gameId, data.score1, data.score2)
        break
      case "status_update":
        updateGameStatus(data.gameId, data.status)
        break
      case "game_update":
        addGameUpdate(data.gameId, data.update)
        break
      case "vote_update":
        updateVotes(data.gameId, data.team1Votes, data.team2Votes)
        break
      case "game_deleted":
        // Remove game from list
        state.games = state.games.filter((game) => game.id != data.gameId)
        renderGames()

        // If currently viewing this game, go back to dashboard
        if (state.currentGame && state.currentGame.id == data.gameId) {
          showSection(elements.dashboardSection)
        }
        break
    }
  })

  // Connection closed
  state.socket.addEventListener("close", (event) => {
    console.log("Disconnected from WebSocket server")

    // Try to reconnect after 5 seconds
    setTimeout(setupWebSocket, 5000)
  })

  // Connection error
  state.socket.addEventListener("error", (event) => {
    console.error("WebSocket error:", event)
  })
}

// Setup event listeners
function setupEventListeners() {
  // Auth
  elements.loginBtn.addEventListener("click", () => {
    showSection(elements.authSection)
  })

  elements.logoutBtn.addEventListener("click", logout)

  elements.tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tabId = btn.getAttribute("data-tab")

      // Update active tab button
      elements.tabBtns.forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")

      // Show selected tab content
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active")
      })
      document.getElementById(`${tabId}-form`).classList.add("active")
    })
  })

  elements.loginForm.addEventListener("submit", (e) => {
    e.preventDefault()
    login()
  })

  elements.registerForm.addEventListener("submit", (e) => {
    e.preventDefault()
    register()
  })

  // Dashboard
  elements.addGameBtn.addEventListener("click", () => {
    if (!state.user) {
      showNotification("Please login to add a game", true)
      showSection(elements.authSection)
      return
    }

    showSection(elements.addGameSection)
  })

  // Add Game
  elements.addGameForm.addEventListener("submit", (e) => {
    e.preventDefault()
    addGame()
  })

  elements.cancelAddGameBtn.addEventListener("click", () => {
    showSection(elements.dashboardSection)
  })

  // Game Details
  elements.backToGamesBtn.addEventListener("click", () => {
    showSection(elements.dashboardSection)
  })

  elements.voteBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!state.user) {
        showNotification("Please login to vote", true)
        showSection(elements.authSection)
        return
      }

      const team = btn.getAttribute("data-team")
      voteForTeam(state.currentGame.id, team)
    })
  })

  // Admin Controls
  elements.updateScoreBtn.addEventListener("click", () => {
    updateScore(state.currentGame.id, elements.updateScore1.value, elements.updateScore2.value)
  })

  elements.updateStatusBtn.addEventListener("click", () => {
    updateStatus(state.currentGame.id, elements.gameStatus.value)
  })

  elements.addUpdateBtn.addEventListener("click", () => {
    addUpdate(state.currentGame.id, elements.addUpdate.value)
    elements.addUpdate.value = ""
  })

  // Delete Game
  elements.deleteGameBtn = document.getElementById("delete-game-btn")
  elements.adminHeaderControls = document.getElementById("admin-header-controls")

  elements.deleteGameBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete this game?")) {
      deleteGame(state.currentGame.id)
    }
  })
}

// Show a specific section and hide others
function showSection(section) {
  elements.authSection.classList.add("hidden")
  elements.dashboardSection.classList.add("hidden")
  elements.addGameSection.classList.add("hidden")
  elements.gameDetailsSection.classList.add("hidden")

  section.classList.remove("hidden")
}

// Login function
function login() {
  const username = document.getElementById("login-username").value
  const password = document.getElementById("login-password").value

  const formData = new FormData()
  formData.append("username", username)
  formData.append("password", password)

  fetch("api/login.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        state.user = data.user
        state.isAdmin = data.isAdmin
        updateUIForLoggedInUser()
        showSection(elements.dashboardSection)
        showNotification("Login successful")

        // Notify WebSocket server
        if (state.socket && state.socket.readyState === WebSocket.OPEN) {
          state.socket.send(
            JSON.stringify({
              type: "user_connected",
              username: state.user.username,
            }),
          )
        }
      } else {
        showNotification(data.message, true)
      }
    })
    .catch((error) => {
      console.error("Error logging in:", error)
      showNotification("Login failed", true)
    })
}

// Register function
function register() {
  const username = document.getElementById("register-username").value
  const password = document.getElementById("register-password").value
  const confirmPassword = document.getElementById("register-confirm-password").value

  if (password !== confirmPassword) {
    showNotification("Passwords do not match", true)
    return
  }

  const formData = new FormData()
  formData.append("username", username)
  formData.append("password", password)

  fetch("api/register.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showNotification("Registration successful, please login")

        // Switch to login tab
        elements.tabBtns.forEach((btn) => {
          if (btn.getAttribute("data-tab") === "login") {
            btn.click()
          }
        })

        // Clear register form
        document.getElementById("register-username").value = ""
        document.getElementById("register-password").value = ""
        document.getElementById("register-confirm-password").value = ""
      } else {
        showNotification(data.message, true)
      }
    })
    .catch((error) => {
      console.error("Error registering:", error)
      showNotification("Registration failed", true)
    })
}

// Logout function
function logout() {
  fetch("api/logout.php")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        state.user = null
        state.isAdmin = false
        updateUIForLoggedOutUser()
        showSection(elements.dashboardSection)
        showNotification("Logout successful")

        // Notify WebSocket server
        if (state.socket && state.socket.readyState === WebSocket.OPEN) {
          state.socket.send(
            JSON.stringify({
              type: "user_disconnected",
            }),
          )
        }
      }
    })
    .catch((error) => {
      console.error("Error logging out:", error)
      showNotification("Logout failed", true)
    })
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
  elements.loginBtn.classList.add("hidden")
  elements.logoutBtn.classList.remove("hidden")
  elements.usernameDisplay.textContent = state.user.username

  if (state.isAdmin) {
    elements.adminControls.classList.remove("hidden")
    elements.addGameBtn.classList.remove("hidden")
  } else {
    elements.addGameBtn.classList.add("hidden")
  }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
  elements.loginBtn.classList.remove("hidden")
  elements.logoutBtn.classList.add("hidden")
  elements.usernameDisplay.textContent = "Guest"
  elements.adminControls.classList.add("hidden")
  elements.addGameBtn.classList.add("hidden")
}

// Render games list
function renderGames() {
  elements.gamesList.innerHTML = ""

  if (state.games.length === 0) {
    elements.gamesList.innerHTML = '<div class="card">No games available</div>'
    return
  }

  state.games.forEach((game) => {
    const gameCard = createGameCard(game)
    elements.gamesList.appendChild(gameCard)
  })
}

// Create a game card element
function createGameCard(game) {
  const gameCard = document.createElement("div")
  gameCard.className = "game-card"
  gameCard.setAttribute("data-id", game.id)

  const statusClass = `status-${game.status}`
  const statusText = game.status.charAt(0).toUpperCase() + game.status.slice(1)

  gameCard.innerHTML = `
        <div class="game-card-header">
            <span class="sport-tag">${game.sport}</span>
            <span class="game-status ${statusClass}">${statusText}</span>
        </div>
        <div class="game-card-body">
            <div class="teams-display">
                <span class="team-name">${game.team1}</span>
                <span class="vs">VS</span>
                <span class="team-name">${game.team2}</span>
            </div>
            <div class="game-meta">
                <div>${formatDate(game.time)}</div>
            </div>
        </div>
    `

  gameCard.addEventListener("click", () => {
    showGameDetails(game)
  })

  return gameCard
}

// Show game details
function showGameDetails(game) {
  state.currentGame = game

  // Update UI with game details
  elements.gameTitle.textContent = `${game.team1} vs ${game.team2}`
  elements.detailTeam1.textContent = game.team1
  elements.detailTeam2.textContent = game.team2
  elements.score1.textContent = game.score1
  elements.score2.textContent = game.score2
  elements.detailSport.textContent = game.sport
  elements.detailTime.textContent = formatDate(game.time)
  elements.detailStatus.textContent = game.status.charAt(0).toUpperCase() + game.status.slice(1)

  // Update votes
  updateVotesUI(game.team1Votes, game.team2Votes)

  // Load updates
  loadGameUpdates(game.id)

  // Update admin controls
  if (state.isAdmin) {
    elements.updateScore1.value = game.score1
    elements.updateScore2.value = game.score2
    elements.gameStatus.value = game.status
    elements.adminControls.classList.remove("hidden")
    elements.adminHeaderControls.classList.remove("hidden")
  } else {
    elements.adminControls.classList.add("hidden")
    elements.adminHeaderControls.classList.add("hidden")
  }

  showSection(elements.gameDetailsSection)
}

// Load game updates
function loadGameUpdates(gameId) {
  fetch(`api/updates.php?gameId=${gameId}`)
    .then((response) => response.json())
    .then((data) => {
      renderGameUpdates(data)
    })
    .catch((error) => {
      console.error("Error loading game updates:", error)
      showNotification("Failed to load game updates", true)
    })
}

// Render game updates
function renderGameUpdates(updates) {
  elements.updatesContainer.innerHTML = ""

  if (updates.length === 0) {
    elements.updatesContainer.innerHTML = '<div class="update-item">No updates yet</div>'
    return
  }

  updates.forEach((update) => {
    const updateItem = document.createElement("div")
    updateItem.className = "update-item"
    updateItem.innerHTML = `
            <div>${update.content}</div>
            <div class="update-time">${formatDate(update.timestamp)}</div>
        `
    elements.updatesContainer.appendChild(updateItem)
  })

  // Scroll to bottom
  elements.updatesContainer.scrollTop = elements.updatesContainer.scrollHeight
}

// Add a new game
function addGame() {
  const sport = document.getElementById("sport-type").value
  const team1 = document.getElementById("team1").value
  const team2 = document.getElementById("team2").value
  const gameTime = document.getElementById("game-time").value

  const formData = new FormData()
  formData.append("sport", sport)
  formData.append("team1", team1)
  formData.append("team2", team2)
  formData.append("time", gameTime)

  fetch("api/add_game.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showNotification("Game added successfully")
        showSection(elements.dashboardSection)

        // Clear form
        document.getElementById("team1").value = ""
        document.getElementById("team2").value = ""
        document.getElementById("game-time").value = ""

        // Add game to list
        addGameToList(data.game)

        // Notify WebSocket clients
        if (state.socket && state.socket.readyState === WebSocket.OPEN) {
          state.socket.send(
            JSON.stringify({
              type: "game_added",
              game: data.game,
            }),
          )
        }
      } else {
        showNotification(data.message, true)
      }
    })
    .catch((error) => {
      console.error("Error adding game:", error)
      showNotification("Failed to add game", true)
    })
}

// Add a game to the list
function addGameToList(game) {
  state.games.push(game)
  renderGames()
}

// Vote for a team
function voteForTeam(gameId, team) {
  const formData = new FormData()
  formData.append("gameId", gameId)
  formData.append("team", team)

  fetch("api/vote.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showNotification("Vote recorded")

        // Update votes UI
        updateVotesUI(data.team1Votes, data.team2Votes)

        // Update game in state
        const gameIndex = state.games.findIndex((g) => g.id === gameId)
        if (gameIndex !== -1) {
          state.games[gameIndex].team1Votes = data.team1Votes
          state.games[gameIndex].team2Votes = data.team2Votes
        }

        // Notify WebSocket clients
        if (state.socket && state.socket.readyState === WebSocket.OPEN) {
          state.socket.send(
            JSON.stringify({
              type: "vote_update",
              gameId: gameId,
              team1Votes: data.team1Votes,
              team2Votes: data.team2Votes,
            }),
          )
        }
      } else {
        showNotification(data.message, true)
      }
    })
    .catch((error) => {
      console.error("Error voting:", error)
      showNotification("Failed to record vote", true)
    })
}

// Update score
function updateScore(gameId, score1, score2) {
  const formData = new FormData()
  formData.append("gameId", gameId)
  formData.append("score1", score1)
  formData.append("score2", score2)

  fetch("api/update_score.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showNotification("Score updated")

        // Update UI
        elements.score1.textContent = score1
        elements.score2.textContent = score2

        // Update game in state
        updateGameScore(gameId, score1, score2)

        // Notify WebSocket clients
        if (state.socket && state.socket.readyState === WebSocket.OPEN) {
          state.socket.send(
            JSON.stringify({
              type: "score_update",
              gameId: gameId,
              score1: score1,
              score2: score2,
            }),
          )
        }
      } else {
        showNotification(data.message, true)
      }
    })
    .catch((error) => {
      console.error("Error updating score:", error)
      showNotification("Failed to update score", true)
    })
}

// Update game status
function updateStatus(gameId, status) {
  const formData = new FormData()
  formData.append("gameId", gameId)
  formData.append("status", status)

  fetch("api/update_status.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showNotification("Status updated")

        // Update UI
        elements.detailStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1)

        // Update game in state
        updateGameStatus(gameId, status)

        // Notify WebSocket clients
        if (state.socket && state.socket.readyState === WebSocket.OPEN) {
          state.socket.send(
            JSON.stringify({
              type: "status_update",
              gameId: gameId,
              status: status,
            }),
          )
        }
      } else {
        showNotification(data.message, true)
      }
    })
    .catch((error) => {
      console.error("Error updating status:", error)
      showNotification("Failed to update status", true)
    })
}

// Add a game update
function addUpdate(gameId, content) {
  if (!content.trim()) {
    showNotification("Update cannot be empty", true)
    return
  }

  const formData = new FormData()
  formData.append("gameId", gameId)
  formData.append("content", content)

  fetch("api/add_update.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showNotification("Update added")

        // Add update to UI
        addGameUpdate(gameId, data.update)

        // Notify WebSocket clients
        if (state.socket && state.socket.readyState === WebSocket.OPEN) {
          state.socket.send(
            JSON.stringify({
              type: "game_update",
              gameId: gameId,
              update: data.update,
            }),
          )
        }
      } else {
        showNotification(data.message, true)
      }
    })
    .catch((error) => {
      console.error("Error adding update:", error)
      showNotification("Failed to add update", true)
    })
}

// Delete a game
function deleteGame(gameId) {
  const formData = new FormData()
  formData.append("gameId", gameId)

  fetch("api/delete_game.php", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showNotification("Game deleted successfully")

        // Remove game from state
        state.games = state.games.filter((game) => game.id != gameId)

        // Go back to dashboard
        showSection(elements.dashboardSection)

        // Render games
        renderGames()

        // Notify WebSocket clients
        if (state.socket && state.socket.readyState === WebSocket.OPEN) {
          state.socket.send(
            JSON.stringify({
              type: "game_deleted",
              gameId: gameId,
            }),
          )
        }
      } else {
        showNotification(data.message, true)
      }
    })
    .catch((error) => {
      console.error("Error deleting game:", error)
      showNotification("Failed to delete game", true)
    })
}

// Update game score in state and UI
function updateGameScore(gameId, score1, score2) {
  // Update game in state
  const gameIndex = state.games.findIndex((g) => g.id === gameId)
  if (gameIndex !== -1) {
    state.games[gameIndex].score1 = score1
    state.games[gameIndex].score2 = score2
  }

  // Update current game if it's the same
  if (state.currentGame && state.currentGame.id === gameId) {
    state.currentGame.score1 = score1
    state.currentGame.score2 = score2
    elements.score1.textContent = score1
    elements.score2.textContent = score2
  }
}

// Update game status in state and UI
function updateGameStatus(gameId, status) {
  // Update game in state
  const gameIndex = state.games.findIndex((g) => g.id === gameId)
  if (gameIndex !== -1) {
    state.games[gameIndex].status = status
  }

  // Update current game if it's the same
  if (state.currentGame && state.currentGame.id === gameId) {
    state.currentGame.status = status
    elements.detailStatus.textContent = status.charAt(0).toUpperCase() + status.slice(1)
  }

  // Update game card if visible
  const gameCard = document.querySelector(`.game-card[data-id="${gameId}"]`)
  if (gameCard) {
    const statusElement = gameCard.querySelector(".game-status")
    statusElement.className = `game-status status-${status}`
    statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1)
  }
}

// Add game update to UI
function addGameUpdate(gameId, update) {
  // Only update UI if we're viewing this game
  if (state.currentGame && state.currentGame.id === gameId) {
    const updateItem = document.createElement("div")
    updateItem.className = "update-item"
    updateItem.innerHTML = `
            <div>${update.content}</div>
            <div class="update-time">${formatDate(update.timestamp)}</div>
        `

    elements.updatesContainer.appendChild(updateItem)

    // Scroll to bottom
    elements.updatesContainer.scrollTop = elements.updatesContainer.scrollHeight
  }
}

// Update votes UI
function updateVotesUI(team1Votes, team2Votes) {
  const total = Number.parseInt(team1Votes) + Number.parseInt(team2Votes)

  if (total === 0) {
    elements.team1Votes.style.width = "50%"
    elements.team1VotePercent.textContent = "0%"
    elements.team2VotePercent.textContent = "0%"
    return
  }

  const team1Percent = Math.round((team1Votes / total) * 100)
  const team2Percent = 100 - team1Percent

  elements.team1Votes.style.width = `${team1Percent}%`
  elements.team1VotePercent.textContent = `${team1Percent}%`
  elements.team2VotePercent.textContent = `${team2Percent}%`
}

// Update votes in state
function updateVotes(gameId, team1Votes, team2Votes) {
  // Update game in state
  const gameIndex = state.games.findIndex((g) => g.id === gameId)
  if (gameIndex !== -1) {
    state.games[gameIndex].team1Votes = team1Votes
    state.games[gameIndex].team2Votes = team2Votes
  }

  // Update current game if it's the same
  if (state.currentGame && state.currentGame.id === gameId) {
    state.currentGame.team1Votes = team1Votes
    state.currentGame.team2Votes = team2Votes
    updateVotesUI(team1Votes, team2Votes)
  }
}

// Update online users
function updateOnlineUsers(users) {
  state.onlineUsers = users
  elements.onlineCount.textContent = users.length

  // Update user bubbles
  elements.onlineUsersList.innerHTML = ""

  // Only show up to 5 users
  const displayUsers = users.slice(0, 5)

  displayUsers.forEach((user) => {
    const userBubble = document.createElement("div")
    userBubble.className = "user-bubble"
    userBubble.textContent = user.username.charAt(0).toUpperCase()
    userBubble.title = user.username
    elements.onlineUsersList.appendChild(userBubble)
  })

  // Add +X more if there are more users
  if (users.length > 5) {
    const moreBubble = document.createElement("div")
    moreBubble.className = "user-bubble"
    moreBubble.textContent = `+${users.length - 5}`
    moreBubble.title = `${users.length - 5} more users online`
    elements.onlineUsersList.appendChild(moreBubble)
  }
}

// Show notification
function showNotification(message, isError = false) {
  elements.notification.textContent = message
  elements.notification.className = "notification"

  if (isError) {
    elements.notification.classList.add("error")
  }

  elements.notification.classList.add("show")

  setTimeout(() => {
    elements.notification.classList.remove("show")
  }, 3000)
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString()
}

// Initialize the application
document.addEventListener("DOMContentLoaded", init)
