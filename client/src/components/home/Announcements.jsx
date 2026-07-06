import { Megaphone } from 'lucide-react';
import { SAMPLE_ANNOUNCEMENTS } from '../../constants/siteContent.js';

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

function Announcements() {
  return (
    <section className="bg-white py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-display text-navy-800">Latest Announcements</h2>

        <div className="mt-8 grid md:grid-cols-3 gap-6">
          {SAMPLE_ANNOUNCEMENTS.map((item) => (
            <div key={item.title} className="border border-navy-100 rounded-card p-6">
              <div className="flex items-center gap-2 text-sky-500">
                <Megaphone className="w-4 h-4" />
                <span className="text-xs font-medium">{formatDate(item.date)}</span>
              </div>
              <p className="mt-3 font-display text-navy-800">{item.title}</p>
              <p className="mt-2 text-sm text-muted">{item.excerpt}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Announcements;
