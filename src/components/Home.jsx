import ClothingCard from './ClothingCard'

const sampleItems = [
    { id: 'coat-1', title: 'Raincoat', description: 'Waterproof raincoat for wet days.', link: '#'},
    { id: 'sweater-1', title: 'Cozy Sweater', description: 'Warm sweater for cool temperatures.', link: '#'},
    { id: 'tank-1', title: 'Tank Top', description: 'Light tank top for warm days.', link: '#'},
]

export default function Home(props) {
        return <div>
                <h1>Home</h1>
                <p>Enter a city and date to receive outfit suggestions (work in progress).</p>
                <div className="d-flex flex-wrap gap-3">
                    {sampleItems.map(it => (
                        <ClothingCard key={it.id} item={it} />
                    ))}
                </div>
        </div>
}