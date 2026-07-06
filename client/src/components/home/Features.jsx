import { FEATURES } from '../../constants/siteContent.js';

function Features() {
  return (
    <section id="features" className="bg-surface py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl md:text-3xl font-display text-navy-800 text-center">
          Everything the Institute Needs, in One Place
        </h2>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-white rounded-card shadow-card p-6">
              <div className="w-10 h-10 rounded-card bg-navy-100 text-navy-700 flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <p className="mt-4 font-display text-navy-800">{title}</p>
              <p className="mt-2 text-sm text-muted">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
