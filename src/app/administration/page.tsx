export default function AdministrationPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="system-window p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-2 h-8 bg-system-red"></div>
                    <h1 className="text-3xl font-rajdhani font-bold text-system-red">
                        Administration
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <div className="glass p-4 rounded-lg">
                        <h3 className="text-sm text-muted-foreground mb-1">Total Members</h3>
                        <p className="text-2xl font-mono text-foreground">0</p>
                    </div>
                    <div className="glass p-4 rounded-lg">
                        <h3 className="text-sm text-muted-foreground mb-1">Total Challenges</h3>
                        <p className="text-2xl font-mono text-foreground">0</p>
                    </div>
                    <div className="glass p-4 rounded-lg">
                        <h3 className="text-sm text-muted-foreground mb-1">Active Duels</h3>
                        <p className="text-2xl font-mono text-foreground">0</p>
                    </div>
                    <div className="glass p-4 rounded-lg">
                        <h3 className="text-sm text-muted-foreground mb-1">Pending Assignments</h3>
                        <p className="text-2xl font-mono text-foreground">0</p>
                    </div>
                </div>

                <div className="glass p-6 rounded-lg">
                    <h2 className="text-xl font-rajdhani font-bold text-foreground mb-4">
                        Quick Actions
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button className="px-4 py-3 bg-system-panel border border-system-blue text-system-blue rounded font-rajdhani font-semibold hover:bg-system-blue/10">
                            Manage Members
                        </button>
                        <button className="px-4 py-3 bg-system-panel border border-system-green text-system-green rounded font-rajdhani font-semibold hover:bg-system-green/10">
                            Create Challenge
                        </button>
                        <button className="px-4 py-3 bg-system-panel border border-border text-foreground rounded font-rajdhani font-semibold hover:bg-muted">
                            View Assignments
                        </button>
                        <button className="px-4 py-3 bg-system-panel border border-border text-foreground rounded font-rajdhani font-semibold hover:bg-muted">
                            Badge Management
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
