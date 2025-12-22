# Script pour insérer la section récurrence
$file = "app\admin\quests\create\page.tsx"
$content = Get-Content $file -Raw

# Trouver la position d'insertion (avant {/* Submit */})
$marker = "                {/* Submit */}"
$insertionPoint = $content.IndexOf($marker)

if ($insertionPoint -eq -1) {
    Write-Host "Marker not found!" -ForegroundColor Red
    exit 1
}

# Code à insérer
$recurrenceSection = @"

                {/* Recurrence Section */}
                <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-rajdhani font-bold text-lg text-white">
                                🔄 RÉCURRENCE
                            </h3>
                            <p className="text-xs font-tech text-muted-foreground mt-1">
                                Quête répétitive (daily/weekly/monthly)
                            </p>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.recurrence_enabled}
                                onChange={(e) => setFormData({ ...formData, recurrence_enabled: e.target.checked })}
                                className="w-5 h-5 rounded border-white/20 bg-black checked:bg-system-green checked:border-system-green focus:ring-system-green focus:ring-offset-0"
                            />
                            <span className="font-tech text-sm text-white">ACTIVER</span>
                        </label>
                    </div>

                    {formData.recurrence_enabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-4 border-l-2 border-system-green/30">
                            <div>
                                <label className="block font-tech text-sm text-muted-foreground mb-2">
                                    TYPE DE RÉCURRENCE *
                                </label>
                                <select
                                    value={formData.recurrence_type}
                                    onChange={(e) => setFormData({ ...formData, recurrence_type: e.target.value as any })}
                                    className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white focus:border-system-green focus:ring-1 focus:ring-system-green outline-none"
                                >
                                    <option value="none">Aucune</option>
                                    <option value="daily">📅 Quotidienne (chaque jour)</option>
                                    <option value="weekly">📆 Hebdomadaire (chaque semaine)</option>
                                    <option value="monthly">🗓️ Mensuelle (chaque mois)</option>
                                </select>
                                <p className="mt-2 text-xs font-tech text-muted-foreground">
                                    {formData.recurrence_type === 'daily' && '⏰ Reset chaque jour à minuit UTC'}
                                    {formData.recurrence_type === 'weekly' && '⏰ Reset chaque semaine'}
                                    {formData.recurrence_type === 'monthly' && '⏰ Reset chaque mois'}
                                </p>
                            </div>

                            {formData.recurrence_type === 'weekly' && (
                                <div>
                                    <label className="block font-tech text-sm text-muted-foreground mb-2">
                                        JOUR DE RESET *
                                    </label>
                                    <select
                                        value={formData.recurrence_reset_day}
                                        onChange={(e) => setFormData({ ...formData, recurrence_reset_day: parseInt(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white focus:border-system-green focus:ring-1 focus:ring-system-green outline-none"
                                    >
                                        <option value="1">Lundi</option>
                                        <option value="2">Mardi</option>
                                        <option value="3">Mercredi</option>
                                        <option value="4">Jeudi</option>
                                        <option value="5">Vendredi</option>
                                        <option value="6">Samedi</option>
                                        <option value="7">Dimanche</option>
                                    </select>
                                </div>
                            )}

                            {formData.recurrence_type === 'monthly' && (
                                <div>
                                    <label className="block font-tech text-sm text-muted-foreground mb-2">
                                        JOUR DU MOIS *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="31"
                                        value={formData.recurrence_reset_day}
                                        onChange={(e) => setFormData({ ...formData, recurrence_reset_day: parseInt(e.target.value) })}
                                        className="w-full bg-black/40 border border-white/10 rounded p-3 font-tech text-white focus:border-system-green focus:ring-1 focus:ring-system-green outline-none"
                                    />
                                    <p className="mt-2 text-xs font-tech text-muted-foreground">
                                        Jour du mois (1-31) pour le reset
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

"@

# Insérer le code
$newContent = $content.Insert($insertionPoint, $recurrenceSection)

# Sauvegarder
Set-Content -Path $file -Value $newContent -NoNewline

Write-Host "✅ Section récurrence insérée avec succès!" -ForegroundColor Green
Write-Host "Fichier modifié: $file" -ForegroundColor Cyan
