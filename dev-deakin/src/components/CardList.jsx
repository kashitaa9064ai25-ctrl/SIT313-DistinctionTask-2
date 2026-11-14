import React from 'react';

export default function CardList({ id, title, items = [], buttonText, onButtonClick }) {
  return (
    <section id={id} className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between pb-4 border-b border-gray-300 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {buttonText && (
          <button
            onClick={onButtonClick}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            {buttonText}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={item.id || index}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            {/* Card Image */}
            <div className="h-48 w-full bg-gray-200 overflow-hidden relative">
              <img
                src={item.image || `https://picsum.photos/seed/${index}/300/200`}
                alt={item.name || item.title}
                className="w-full h-full object-cover"
              />
              {/* Plan Badge */}
              {item.plan && (
                <span
                  className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow ${item.plan === 'Paid'
                      ? 'bg-amber-500 text-white'
                      : 'bg-teal-600 text-white'
                    }`}
                >
                  {item.plan}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1.5 line-clamp-1">
                  {item.name || item.title}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-3 mb-4">
                  {item.description || item.abstract || item.text}
                </p>
              </div>

              {/* Card Meta */}
              <div className="border-t pt-3 flex items-center justify-between text-xs text-gray-500">
                <span className="font-medium">
                  By {item.author || item.authorName || 'Dev Community'}
                </span>
                <span>⭐ {item.rating || '5.0'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}