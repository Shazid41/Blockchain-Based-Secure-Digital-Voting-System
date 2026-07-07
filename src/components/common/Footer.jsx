import { Link } from 'react-router-dom';
import { PROJECT } from '../../utils/constants.js';

const columns = [
  { title: 'About the Project', links: [['Overview', '/about'], ['How It Works', '/how-it-works']] },
  { title: 'Quick Links', links: [['Home', '/'], ['Login', '/login'], ['Register', '/register']] },
  { title: 'Help and Support', links: [['Security', '/security'], ['Accessibility', '/about']] },
  { title: 'Security Information', links: [['Privacy', '/security'], ['Terms', '/about'], ['GitHub Repository', '#']] },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-primary-dark text-white">
      <div className="container-page grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((column) => (
          <section key={column.title}>
            <h2 className="text-sm font-bold uppercase tracking-wide">{column.title}</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {column.links.map(([label, to]) => (
                <li key={label}>
                  <Link className="focus-ring rounded hover:text-white" to={to}>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <div className="border-t border-white/20">
        <div className="container-page py-4 text-sm text-white/80">
          This system is developed as an academic project for Web Engineering Lab. {PROJECT.university}.
        </div>
      </div>
    </footer>
  );
}
