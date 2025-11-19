# Professional Sports Competition Admin Dashboard

A comprehensive admin dashboard for managing sports competitions, teams, players, fixtures, and events with full CRUD operations, light/dark theme support, and JWT authentication.

## Features

- 🎨 **Theme System**: Seamless light/dark mode switching with persistent preferences
- 🔐 **Authentication**: JWT-based login system with token management
- 📊 **Entity Management**: Full CRUD operations for:
  - Competitions (year, dates, format)
  - Teams (letters, names, colors)
  - Players (names, positions, images)
  - Fixtures (teams, times, venues, scores)
  - Events (match events with participants)
- 🗄️ **Archive System**: Soft delete with archive/restore functionality
- 🔍 **Search & Filter**: Real-time search with archived items toggle
- 🎯 **Form Validation**: Client-side validation with error states
- 📱 **Responsive Design**: Mobile-friendly with collapsible sidebar
- 🔔 **Toast Notifications**: Visual feedback for all user actions

## Files Included

- `index.html` - Main dashboard interface
- `login.html` - Authentication page
- `styles.css` - Custom CSS with theme variables
- `app.js` - Main application logic
- `auth.js` - Authentication module
- `api.js` - API service layer with mock data
- `utils.js` - Utility functions and helpers

## Quick Start (Mock Mode)

The dashboard includes a mock API for immediate testing without a backend:

1. Open `login.html` in your web browser
2. Use the demo credentials:
   - Username: `admin`
   - Password: `password123`
3. Explore the dashboard features

## Color Scheme

- **Primary**: #37238d (Purple)
- **Success**: #6eb553 (Green)
- **Error**: #c63035 (Red)
- **Warning**: #eee248 (Yellow)
- **Grays**: Full spectrum from #f5f5f5 to #171717

## Production Setup

To connect to a real backend:

1. Update the `API.baseURL` in `api.js` to your backend URL
2. Remove or comment out the mock API section at the bottom of `api.js`
3. Implement the following endpoints on your backend:

### Required API Endpoints

#### Authentication
- `POST /api/auth/login` - Login with username/password
- `GET /api/auth/check` - Validate JWT token

#### CRUD Endpoints (for each entity)
- `GET /api/{entity}?archived=false` - Get all items
- `GET /api/{entity}/{id}` - Get single item
- `POST /api/{entity}` - Create new item
- `PUT /api/{entity}/{id}` - Update item
- `DELETE /api/{entity}/{id}` - Delete item
- `PATCH /api/{entity}/{id}/archive` - Archive item
- `PATCH /api/{entity}/{id}/restore` - Restore item

## Entity Schemas

### Competitions
```javascript
{
  year: number,
  startDate: ISO datetime string,
  endDate: ISO datetime string (optional),
  format: string (enum)
}
```

### Teams
```javascript
{
  teamLetter: string,
  teamName: string,
  teamColor: hex color string
}
```

### Players
```javascript
{
  firstName: string,
  lastName: string,
  alias: string (optional),
  primaryPosition: string,
  alternatePositions: array of strings (max 4),
  imageUrl: string (optional)
}
```

### Fixtures
```javascript
{
  homeTeam: team ID,
  awayTeam: team ID,
  kickoffTime: ISO datetime string,
  referee: string (optional),
  hasHalves: boolean,
  venue: string (default: "Mo Arena"),
  finalScore: string (optional, format: "2-1")
}
```

### Events
```javascript
{
  fixture: fixture ID,
  eventTitle: string,
  description: string (optional),
  participants: array of player IDs
}
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technologies Used

- HTML5 with semantic structure
- Tailwind CSS (via CDN)
- Vanilla JavaScript (ES6+)
- CSS Custom Properties for theming
- LocalStorage for preferences

## Customization

### Theme Colors
Edit the CSS variables in `styles.css`:
```css
:root {
  --primary: #37238d;
  --success: #6eb553;
  --error: #c63035;
  --warning: #eee248;
  /* ... */
}
```

### Add New Entities
Add configuration to `App.entities` in `app.js`:
```javascript
newEntity: {
  title: 'New Entity',
  description: 'Manage new entities',
  columns: ['ID', 'Name', 'Actions'],
  fields: [
    { name: 'name', type: 'text', label: 'Name', required: true }
  ]
}
```

## License

This project is provided as-is for use in your sports competition management system.

## Support

For issues or questions, please refer to the inline documentation in the source files or customize as needed for your specific requirements.