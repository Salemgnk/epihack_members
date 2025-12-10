export default function MemberProfilePage({ params }: { params: { id: string } }) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="system-window p-6 rounded-lg">
                <h1 className="text-3xl font-rajdhani font-bold text-system-green mb-6">
                    Member Profile
                </h1>

                <div className="glass p-4 rounded-lg">
                    <p className="text-muted-foreground">
                        Public profile for member ID: {params.id}
                    </p>
                </div>
            </div>
        </div>
    );
}
