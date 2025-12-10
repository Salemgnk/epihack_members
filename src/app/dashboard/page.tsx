export default function DashboardPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="system-window p-6 rounded-lg">
                <h1 className="text-3xl font-rajdhani font-bold text-system-green mb-6">
                    Dashboard
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats cards will go here */}
                    <div className="glass p-4 rounded-lg">
                        <h3 className="text-lg font-rajdhani font-semibold text-system-blue mb-2">
                            Total Points
                        </h3>
                        <p className="text-3xl font-mono text-foreground">
                            Loading...
                        </p>
                    </div>

                    <div className="glass p-4 rounded-lg">
                        <h3 className="text-lg font-rajdhani font-semibold text-system-blue mb-2">
                            Badges Earned
                        </h3>
                        <p className="text-3xl font-mono text-foreground">
                            Loading...
                        </p>
                    </div>

                    <div className="glass p-4 rounded-lg">
                        <h3 className="text-lg font-rajdhani font-semibold text-system-blue mb-2">
                            Rank
                        </h3>
                        <p className="text-3xl font-mono text-foreground">
                            Loading...
                        </p>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-2xl font-rajdhani font-bold text-foreground mb-4">
                        Recent Activity
                    </h2>
                    <div className="glass p-4 rounded-lg">
                        <p className="text-muted-foreground">
                            No recent activity
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
