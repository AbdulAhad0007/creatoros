import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity, BarChart, Server, ActivitySquare, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 p-4 md:p-8 max-w-[1600px] mx-auto min-h-screen relative">
      {/* Background Blur Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      
      <div className="relative z-10 glass-card p-6 md:p-8 border-white/5 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground drop-shadow-sm">System Overview</h1>
        <p className="text-lg text-muted-foreground mt-2 font-medium">CreatorOS AI ecosystem status and metrics.</p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 relative z-10">
        <Card className="glass-card border-white/10 group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 bg-blue-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Total Users</CardTitle>
            <Users className="h-5 w-5 text-blue-400 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-blue-400 group-hover:scale-105 transition-transform origin-left">1,248</div>
            <p className="text-sm font-medium text-muted-foreground mt-2 bg-white/5 inline-block px-2 py-1 rounded-md border border-white/5">+18% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10 group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 bg-amber-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Active Sessions</CardTitle>
            <Activity className="h-5 w-5 text-amber-400 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-amber-400 group-hover:scale-105 transition-transform origin-left">42</div>
            <p className="text-sm font-medium text-muted-foreground mt-2 bg-white/5 inline-block px-2 py-1 rounded-md border border-white/5">Currently logged in</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10 group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 bg-purple-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">API Usage</CardTitle>
            <BarChart className="h-5 w-5 text-purple-400 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-purple-400 group-hover:scale-105 transition-transform origin-left">45.2k</div>
            <p className="text-sm font-medium text-muted-foreground mt-2 bg-white/5 inline-block px-2 py-1 rounded-md border border-white/5">Requests this month</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-white/10 group overflow-hidden relative">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 bg-green-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">System Health</CardTitle>
            <Server className="h-5 w-5 text-green-400 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold text-green-400 group-hover:scale-105 transition-transform origin-left drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">99.9%</div>
            <p className="text-sm font-medium text-muted-foreground mt-2 bg-green-500/10 text-green-400 inline-block px-2 py-1 rounded-md border border-green-500/20">All services operational</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-7 relative z-10">
        <Card className="col-span-1 lg:col-span-4 glass-card border-white/10">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <ActivitySquare className="h-6 w-6 text-primary" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-sm font-medium">Latest actions across the platform.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 glass p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-all hover:bg-white/5 group">
                  <div className="flex-1 space-y-1">
                    <p className="text-base font-bold leading-none text-foreground group-hover:text-primary transition-colors">User Registration</p>
                    <p className="text-sm font-medium text-muted-foreground">New user signed up from US region.</p>
                  </div>
                  <div className="font-bold text-xs uppercase tracking-wider text-muted-foreground bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 self-start sm:self-auto">
                    10m ago
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1 lg:col-span-3 glass-card border-white/10 relative overflow-hidden">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none"></div>
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <Server className="h-6 w-6 text-primary" />
              API Provider Status
            </CardTitle>
            <CardDescription className="text-sm font-medium">Current integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <div className="flex items-center justify-between glass p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">Gemini</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Content Generation</p>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-lg shadow-sm">
                <CheckCircle className="h-3 w-3" /> Active
              </div>
            </div>
            
            <div className="flex items-center justify-between glass p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all">
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">ElevenLabs</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Voice Synthesis</p>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-green-500/20 border border-green-500/30 text-green-400 px-3 py-1.5 rounded-lg shadow-sm">
                <CheckCircle className="h-3 w-3" /> Active
              </div>
            </div>
            
            <div className="flex items-center justify-between glass p-4 rounded-xl border border-white/5 hover:bg-white/5 transition-all opacity-70">
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">HeyGen</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Avatar Video</p>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-muted border border-muted-foreground/30 text-muted-foreground px-3 py-1.5 rounded-lg">
                <XCircle className="h-3 w-3" /> Disabled
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
