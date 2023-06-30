import Link from 'next/link';

export default function Home() {
  return (
    <div>
      <div className="p-6 font-mono">
        <div className="relative flex flex-wrap items-baseline pb-6 before:bg-black before:absolute before:-top-6 before:bottom-0 before:-left-60 before:-right-6">
          <h1 className="flex-none font-semibold mb-2 relative text-2xl text-white w-full">Guess the move</h1>
        </div>

        <p className="my-6">
          Improve your chess by studying master chess games.
        </p>

        <Link
          className="leading-10 inline-block px-6 h-12 uppercase font-semibold tracking-wider border-2 border-black border-b-4 border-r-4 bg-teal-400 text-black shadow-xl hover:shadow-sm hover:border-b-2 hover:border-r-2"
          href="/import"
        >Get started</Link>
        

        <div className="my-6">
          <h2 className="text-2xl mb-4">1. Import a game</h2>
          <p>Choose a master game to study.</p>
        </div>

        <div className="my-6">
          <h2 className="text-2xl mb-4">2. Guess the move</h2>
          <p>For each move, guess what the master played.</p>
          <p>See how your move compares to the master&apos;s move.</p>
        </div>

        <div className="my-6">
          <h2 className="text-2xl mb-4">3. See your game score</h2>
          <p className="mb-4">At the end of the game, see your:</p>
          <ul className="list-disc ml-4 mb-4">
            <li>inaccuracies</li>
            <li>mistakes</li>
            <li>blunders</li>
          </ul>
          <p>Keep studying more games and improve your score.</p>
        </div>
      </div>
  </div>
  )
}
