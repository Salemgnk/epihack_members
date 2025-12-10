export default function ScoreboardPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="system-window p-6 rounded-lg">
                <h1 className="text-3xl font-rajdhani font-bold text-system-green mb-6">
                    Global Scoreboard
                </h1>

                <div className="flex gap-4 mb-6">
                    <button className="px-4 py-2 bg-system-green/20 text-system-green rounded font-rajdhani font-semibold">
                        Overall
                    </button>
                    <button className="px-4 py-2 glass rounded font-rajdhani font-semibold hover:bg-system-blue/10">
                        HTB
                    </button>
                    <button className="px-4 py-2 glass rounded font-rajdhani font-semibold hover:bg-system-blue/10">
                        Discord
                    </button>
                    <button className="px-4 py-2 glass rounded font-rajdhani font-semibold hover:bg-system-blue/10">
                        GitHub
                    </button>
                    <button className="px-4 py-2 glass rounded font-rajdhani font-semibold hover:bg-system-blue/10">
                        picoCTF
                    </button>
                </div>

                <div className="glass p-4 rounded-lg">
                    <p className="text-muted-foreground">
                        Scoreboard data will display here
                    </p>
                </div>
            </div>
        </div>
    );
}
