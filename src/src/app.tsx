/** @jsx createElement */
import { createElement, render, Router, createRouter, Link } from '../LoomJS/dist/index.js';
import { Home } from './home.js';
import { About } from './about.js';

// Route to page components only
createRouter([
    { path: '/', component: Home },
    { path: '/about', component: About }
]);

// App is the layout wrapper
function App() {
    return (
        <div className="app">
            <header>
                <nav>
                    <Link to="/">Home</Link>
                    {' | '}
                    <Link to="/about">About</Link>
                </nav>
            </header>
            
            <main>
                <Router />  {/* Pages render here */}
            </main>
            
            <footer>
                <p>© 2025 My App</p>
            </footer>
        </div>
    );
}

const root = document.getElementById('root');
if (root) {
    render(<App />, root);
}