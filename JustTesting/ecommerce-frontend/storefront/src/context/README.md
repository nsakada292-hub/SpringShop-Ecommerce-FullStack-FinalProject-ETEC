# context/

Global state, provided once in App.jsx and consumed via the matching
hook in src/hooks/.

- `AuthContext.jsx`       current user, isAuthenticated, isAdmin, login/logout
- `CartContext.jsx`       bag items, add/remove/update qty, computed total
- `WishlistContext.jsx`   love-list product ids, toggle helper
- `ThemeContext.jsx`      dark/light mode, persisted to localStorage
