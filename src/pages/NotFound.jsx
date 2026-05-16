import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark-50 dark:bg-dark-950 px-4">
    <div className="text-center">
      <h1 className="text-8xl font-black gradient-text mb-4">404</h1>
      <p className="text-xl text-dark-600 dark:text-dark-400 mb-6">Page not found</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </div>
  </div>
);

export default NotFound;
