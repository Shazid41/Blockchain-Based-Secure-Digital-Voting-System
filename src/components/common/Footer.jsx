import { Link } from 'react-router-dom';
import useLanguage from '../../hooks/useLanguage.js';

export default function Footer() {
  const { t } = useLanguage();
  const columns = [
    { title: t('footerAbout'), links: [[t('overview'), '/about'], [t('howItWorks'), '/how-it-works']] },
    { title: t('footerQuick'), links: [[t('home'), '/'], [t('login'), '/login'], [t('register'), '/register']] },
    { title: t('footerHelp'), links: [[t('security'), '/security'], [t('accessibility'), '/about']] },
    { title: t('footerSecurity'), links: [[t('privacy'), '/security'], [t('terms'), '/about'], [t('voteVerification'), '/verify']] },
  ];

  return (
    <footer className="border-t border-white/20 bg-gradient-to-br from-primary-dark via-[#053B31] to-[#121C2A] text-white">
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
        <div className="container-page py-4 text-sm text-white/80">{t('footerNote')}</div>
      </div>
    </footer>
  );
}
