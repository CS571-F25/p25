// src/components/pages/AboutPage.jsx

export default function AboutPage() {
  return (
    <div>
      <h1>About Weather Smart Wardrobe</h1>
      <p className="mt-3">
        Weather Smart Wardrobe is a class project that helps you decide what to wear
        based on the forecast. Enter a city and a date within the next week and the
        site will look up the expected conditions, summarize the weather, and suggest
        outfits that are appropriate for the temperature and precipitation.
      </p>
      <p className="mt-3">
        You can save recommended items to your basket, mark them as purchased, and
        review what you've bought on the Past Purchases page. All data is stored
        in your browser, so there's no login or account required.
      </p>
    </div>
  );
}
