# 🎬 Movie Explorer

Welcome to **Movie Explorer**, a frontend web application that lets you easily discover and explore movies! Built with pure HTML, CSS, and JavaScript, this app connects to the powerful OMDb API to bring comprehensive movie data right to your screen.

---

## ✨ Features

- **Search Movies**: Look up any movie by its title.
- **Filter & Sort**: Organize search results to easily find what you're looking for.
- **Favorites**: Save your top movies to a personalized favorites list.
- **Dark Mode**: Toggle a beautiful dark theme for comfortable nighttime browsing.
- **Detailed Views**: Click on a movie to view its poster, release year, ratings, and more.

## 🛠 Technologies Used

- **HTML5**: For semantic and accessible structure.
- **CSS3**: For custom styling, animations, and responsive design.
- **Vanilla JavaScript**: For logic, DOM manipulation, and handling asynchronous requests.
- **Fetch API**: To handle data retrieval from the RESTful API.

## 🔌 API Information

This project relies on the **[OMDb API](http://www.omdbapi.com/)** (The Open Movie Database) to fetch movie information. The Fetch API is used natively in JavaScript to make async `GET` requests to OMDb.

## 📁 Project Structure

```text
movie-explorer/
├── index.html    # The main HTML document
├── style.css     # The styling rules and dark mode variables
└── script.js     # The core application logic and API integration
```

## 🚀 Setup Instructions

Follow these steps to run the project locally on your machine:

1. **Clone the repository** (or download the source code):
   ```bash
   git clone <your-repo-url>
   cd movie-explorer
   ```

2. **Get an OMDb API Key**:
   - Go to [OMDb API](http://www.omdbapi.com/apikey.aspx) and sign up for a free API key.

3. **Add your API Key**:
   - Open `script.js` in your favorite code editor.
   - Locate the API key variable (e.g., `const API_KEY = 'your_api_key_here';`) and replace the placeholder with your actual key.

4. **Run the App**:
   - Simply open `index.html` in your web browser, or use a tool like [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in VS Code to run it on a local development server.

## 📸 Screenshots

Here is a preview of the Movie Explorer application in action:

| Home Page | Movie Details | Theme Toggle |
| :---: | :---: | :---: |
| ![Home Page](images/home.png) | ![Movie Details](images/details.png) | ![Theme Feature](images/theme.png) |

## 🔮 Future Improvements

- Add pagination or infinite scrolling for long lists of search results.
- Incorporate user authentication to sync favorites across devices.
- Fetch and display movie trailers.
- Expand movie details to include cast, crew, and external reviews.

## ✍️ Author

**Your Name**
- GitHub: [@yshravanipatangrao97](https://github.com/shravanipatangrao97-dotcom)
- LinkedIn: [Shravani Patangrao](www.linkedin.com/in/shravani-patangrao-745759376)

---
*Feel free to star ⭐ this repository if you found it helpful!*
