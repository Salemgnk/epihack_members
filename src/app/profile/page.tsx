export default function ProfilePage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="system-window p-6 rounded-lg">
                <h1 className="text-3xl font-rajdhani font-bold text-system-green mb-6">
                    My Profile
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Info */}
                    <div className="lg:col-span-1">
                        <div className="glass p-6 rounded-lg">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-muted mb-4"></div>
                                <h2 className="text-xl font-rajdhani font-bold text-foreground">
                                    Username
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Member since 2025
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="lg:col-span-2">
                        <div className="glass p-6 rounded-lg mb-6">
                            <h3 className="text-xl font-rajdhani font-semibold text-system-blue mb-4">
                                Statistics
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Points</p>
                                    <p className="text-2xl font-mono text-system-green">0</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Badges</p>
                                    <p className="text-2xl font-mono text-system-green">0</p>
                                </div>
                            </div>
                        </div>

                        {/* HTB Integration */}
                        <div className="glass p-6 rounded-lg">
                            <h3 className="text-xl font-rajdhani font-semibold text-system-blue mb-4">
                                HackTheBox Account
                            </h3>
                            <p className="text-muted-foreground">
                                Link your HTB account to sync stats
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
