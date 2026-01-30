export function AnimatedBackground() {
  return (
    <>
      {/* Animated Orbs Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
        {/* Orb 1 */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-60 animate-float-slow"
          style={{
            background: `radial-gradient(circle, var(--orb-1, #2dd4bf) 0%, transparent 70%)`,
            filter: 'blur(80px)',
            top: '-100px',
            left: '-100px',
          }}
        />

        {/* Orb 2 */}
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-50 animate-float-medium"
          style={{
            background: `radial-gradient(circle, var(--orb-2, #f59e0b) 0%, transparent 70%)`,
            filter: 'blur(80px)',
            bottom: '-50px',
            right: '-50px',
          }}
        />

        {/* Orb 3 */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-40 animate-float-fast"
          style={{
            background: `radial-gradient(circle, var(--orb-3, #6366f1) 0%, transparent 70%)`,
            filter: 'blur(80px)',
            top: '40%',
            left: '30%',
          }}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none -z-5 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}
