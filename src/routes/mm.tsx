import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  motion,
  useInView,
} from "framer-motion";
import { Nav } from "@/components/site/Nav";
import { ApplyModal } from "@/components/site/ApplyModal";
import { SectionLabel, SectionTitle } from "@/components/site/SectionTitle";
import { Reveal } from "@/components/site/Reveal";
import { MagneticButton } from "@/components/site/MagneticButton";
import { TiltCard } from "@/components/site/TiltCard";
import heroImg from "@/assets/hero.jpg";
import founderImg from "@/assets/founder-new.jpg";
import boardroomImg from "@/assets/boardroom.jpg";

export const Route = createFileRoute("/mm")({
  head: () => ({
    meta: [
      { title: "Мастермайнд — Инвестиционный клуб Гордость" },
      {
        name: "description",
        content:
          "Закрытый мастермайнд от инвестиционного клуба Гордость. Решите свою главную бизнес-задачу за 3 часа.",
      },
    ],
  }),
  component: MastermindPage,
});

/* ── Scroll-driven morphing background ── */
function ScrollMorphingBackground() {
  const { scrollYProgress } = useScroll();
  const isMobile = useRef(
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );

  const blob1Y = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const blob1X = useTransform(scrollYProgress, [0, 1], [-20, 30]);
  const blob1Scale = useTransform(scrollYProgress, [0, 1], [1, 1.3]);
  const blob1Color = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgba(30,40,80,0.5)", "rgba(50,50,60,0.4)", "rgba(80,65,30,0.45)"],
  );

  const blob2Y = useTransform(scrollYProgress, [0, 1], [-50, 100]);
  const blob2X = useTransform(scrollYProgress, [0, 1], [30, -20]);
  const blob2Scale = useTransform(scrollYProgress, [0, 1], [1.2, 0.9]);
  const blob2Color = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgba(60,50,20,0.3)", "rgba(40,40,50,0.35)", "rgba(100,85,50,0.4)"],
  );

  const blob3Y = useTransform(scrollYProgress, [0, 1], [80, -60]);
  const blob3Scale = useTransform(scrollYProgress, [0, 1], [0.8, 1.4]);
  const blob3X = useTransform(scrollYProgress, [0, 1], [-30, 40]);
  const blob3Color = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    ["rgba(40,55,90,0.3)", "rgba(50,50,55,0.3)", "rgba(90,75,40,0.35)"],
  );

  const blobs = [
    {
      y: blob1Y,
      x: blob1X,
      scale: blob1Scale,
      color: blob1Color,
      className: "top-[10%] -left-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px]",
    },
    {
      y: blob2Y,
      x: blob2X,
      scale: blob2Scale,
      color: blob2Color,
      className: "top-[40%] -right-[10%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px]",
    },
    {
      y: blob3Y,
      x: blob3X,
      scale: blob3Scale,
      color: blob3Color,
      className: "top-[70%] left-[20%] w-[30vw] h-[30vw] max-w-[450px] max-h-[450px]",
    },
  ];

  if (isMobile.current) {
    return (
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] -left-[10%] w-[40vw] h-[40vw] max-w-[600px] max-h-[600px] rounded-full bg-[rgba(30,40,80,0.5)] blur-[100px]" />
        <div className="absolute top-[40%] -right-[10%] w-[35vw] h-[35vw] max-w-[500px] max-h-[500px] rounded-full bg-[rgba(60,50,20,0.3)] blur-[90px]" />
        <div className="absolute top-[70%] left-[20%] w-[30vw] h-[30vw] max-w-[450px] max-h-[450px] rounded-full bg-[rgba(40,55,90,0.3)] blur-[80px]" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {blobs.map((b, i) => (
        <motion.div
          key={i}
          className={`absolute ${b.className} rounded-full blur-[100px] sm:blur-[120px]`}
          style={{
            y: b.y,
            x: b.x,
            scale: b.scale,
            backgroundColor: b.color,
            willChange: "transform",
          }}
        />
      ))}
    </div>
  );
}

/* ── Noise overlay ── */
function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.035]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "256px 256px",
      }}
    />
  );
}

/* ── Countdown timer ── */
const TARGET = new Date("2026-06-24T16:00:00Z").getTime(); // 24 июня 2026 19:00 МСК

function CountdownTimer() {
  const [diff, setDiff] = useState(Math.max(0, TARGET - Date.now()));
  const [prevSecs, setPrevSecs] = useState(-1);

  useEffect(() => {
    const id = setInterval(() => {
      const d = Math.max(0, TARGET - Date.now());
      setDiff(d);
      setPrevSecs((p) => {
        if (p !== -1 && Math.floor((d % 60000) / 1000) !== Math.floor((p % 60000) / 1000)) {
          return d;
        }
        return d === p ? p : d;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (diff <= 0) {
    return (
      <div className="text-center">
        <span className="gold-gradient font-display text-2xl sm:text-3xl md:text-4xl uppercase tracking-[0.15em] font-semibold">
          Мастермайнд начался
        </span>
      </div>
    );
  }

  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  const pad = (n: number) => String(n).padStart(2, "0");

  const blocks = [
    { value: days, label: "ДНИ" },
    { value: pad(hrs), label: "ЧАСЫ" },
    { value: pad(mins), label: "МИНУТЫ" },
    { value: pad(secs), label: "СЕКУНДЫ" },
  ];

  return (
    <div className="flex items-center justify-center">
      <div className="inline-grid grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {blocks.map((b, i) => (
          <div key={b.label} className="relative">
            <div className="relative rounded-xl sm:rounded-2xl border border-gold/25 bg-white/[0.04] backdrop-blur-xl px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8 text-center min-w-[64px] sm:min-w-[88px] md:min-w-[120px] overflow-hidden">
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
              <span
                className="relative z-10 font-display text-2xl sm:text-3xl md:text-5xl lg:text-6xl text-gold tabular-nums leading-none"
                style={i === 3 ? { animation: "pulse-glow 1s ease-in-out" } : undefined}
              >
                {b.value}
              </span>
              <div className="relative z-10 mt-1.5 sm:mt-2 md:mt-3 text-[8px] sm:text-[9px] md:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] text-gold/50 font-medium">
                {b.label}
              </div>
            </div>
            {i < 3 && (
              <span className="hidden sm:block absolute -right-2 sm:-right-3 md:-right-4 top-1/2 -translate-y-1/2 text-gold/30 text-lg md:text-2xl font-light">
                :
              </span>
            )}
          </div>
        ))}
      </div>
      <style>{}</style>
    </div>
  );
}

/* ── CTA button ── */
function CTAButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <MagneticButton
      type="button"
      onClick={onClick}
      className="group relative inline-flex items-center gap-2 overflow-hidden bg-gold px-6 sm:px-12 py-4 sm:py-5 text-primary-foreground text-[11px] uppercase tracking-[0.2em] font-semibold transition-all duration-500 hover:shadow-[0_0_40px_rgba(221,201,169,0.3)]"
    >
      <span className="relative z-10">{children}</span>
      <span aria-hidden className="relative z-10">
        →
      </span>
    </MagneticButton>
  );
}

/* ── Parallax Section wrapper ── */
function ParallaxSection({
  children,
  className = "",
  bg = false,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  bg?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={ref}
      id={id}
      style={{ opacity, willChange: "opacity" }}
      className={`relative overflow-hidden ${bg ? "bg-card/35 border-y border-border" : ""} ${className}`}
    >
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [30, -30]), willChange: "transform" }}
        className="absolute -top-20 -right-20 sm:-top-40 sm:-right-40 w-[20rem] sm:w-[35rem] h-[20rem] sm:h-[35rem] rounded-full bg-gold/[0.04] blur-[80px] sm:blur-[120px] pointer-events-none"
      />
      <motion.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [50, -50]), willChange: "transform" }}
        className="absolute bottom-0 -left-16 sm:-left-32 w-[15rem] sm:w-[25rem] h-[15rem] sm:h-[25rem] rounded-full bg-gold/[0.03] blur-[60px] sm:blur-[100px] pointer-events-none"
      />
      <div className="relative z-10">
        <motion.div style={{ y, willChange: "transform" }}>{children}</motion.div>
      </div>
    </motion.section>
  );
}

/* ── Stagger text reveal ── */
function StaggerText({ children, className = "" }: { children: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const words = children.split(" ");

  return (
    <div ref={ref} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
          transition={{ duration: 0.5, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block mr-[0.3em]"
          style={{ willChange: "transform, opacity" }}
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
}

/* ── Glass card ── */
function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <TiltCard className="h-full">
      <div
        className={`relative rounded-2xl border border-border bg-white/[0.02] backdrop-blur-xl p-5 sm:p-8 sm:pt-12 pt-10 overflow-hidden transition-colors duration-500 h-full flex flex-col ${
          hover ? "hover:border-gold/30" : ""
        } ${className}`}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />
        <div className="relative z-10">{children}</div>
      </div>
    </TiltCard>
  );
}

/* ── Counter animation ── */
function CountUp({
  target,
  suffix = "",
  prefix = "",
}: {
  target: string;
  suffix?: string;
  prefix?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const numericPart = useMemo(() => target.replace(/[^0-9]/g, ""), [target]);
  const num = useMemo(() => parseInt(numericPart) || 0, [numericPart]);
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { damping: 30, stiffness: 80 });
  const display = useTransform(spring, (v) => {
    const rounded = Math.round(v);
    return prefix + rounded.toLocaleString("ru-RU") + suffix;
  });
  const [text, setText] = useState(target);

  useEffect(() => {
    if (!isInView) return;
    // Если в строке нет числа (например «С 2018» оставляем как есть)
    if (!numericPart || isNaN(num)) {
      setText(target);
      return;
    }
    motionVal.set(num);
    const unsub = display.on("change", (v) => setText(v));
    return unsub;
  }, [isInView, numericPart, num, target, motionVal, display]);

  return (
    <div ref={ref} className="font-display text-xl md:text-2xl lg:text-3xl gold-gradient">
      {text}
    </div>
  );
}

/* ── Gradient divider ── */
function GradientDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />;
}

/* ── Mouse parallax orb for hero ── */
function HeroParallaxOrb({
  className,
  children,
}: {
  className: string;
  children?: React.ReactNode;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 20, damping: 30 });
  const springY = useSpring(y, { stiffness: 20, damping: 30 });

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      x.set((e.clientX / window.innerWidth - 0.5) * -30);
      y.set((e.clientY / window.innerHeight - 0.5) * -30);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [x, y]);

  return (
    <motion.div style={{ x: springX, y: springY }} className={className}>
      {children}
    </motion.div>
  );
}

/* ── Numbered card with mobile-safe numbering ── */
function NumberedCard({
  num,
  title,
  desc,
  titleColor,
}: {
  num: string;
  title: string;
  desc: string;
  titleColor?: string;
}) {
  return (
    <GlassCard>
      <span className="absolute top-5 right-5 sm:top-5 sm:right-6 font-display text-lg sm:text-2xl gold-gradient/40 text-gold/40 tabular-nums">
        {num}
      </span>
      <h3
        className={`font-display text-xl mb-3 text-foreground group-hover:text-gold transition-colors ${titleColor || ""}`}
      >
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </GlassCard>
  );
}

/* ── Gold particles in Hero ── */
function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const particlesRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      baseX: number;
      baseY: number;
    }>
  >([]);
  const isMobile = useRef(
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches,
  );
  const animFrameRef = useRef<number>(0);

  const initParticles = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    const count = isMobile.current ? 15 : 28;
    const particles: typeof particlesRef.current = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.2 - 0.1,
        size: Math.random() * 2 + 1.5,
        opacity: Math.random() * 0.5 + 0.2,
        baseX: x,
        baseY: y,
      });
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = container.offsetWidth * dpr;
      canvas.height = container.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      initParticles();
    };
    resize();
    window.addEventListener("resize", resize);

    if (!isMobile.current) {
      const onMove = (e: MouseEvent) => {
        const rect = container.getBoundingClientRect();
        mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };
      container.addEventListener("mousemove", onMove);
      return () => {
        window.removeEventListener("resize", resize);
        container.removeEventListener("mousemove", onMove);
        cancelAnimationFrame(animFrameRef.current);
      };
    }

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [initParticles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const loop = () => {
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particlesRef.current.forEach((p) => {
        // Mouse repulsion (desktop only)
        if (!isMobile.current) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120 && dist > 0) {
            const force = ((120 - dist) / 120) * 0.8;
            p.x += (dx / dist) * force;
            p.y += (dy / dist) * force;
          }
        }

        // Drift
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.y < -10) {
          p.y = h + 10;
          p.x = Math.random() * w;
        }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        // Draw
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(221, 201, 169, ${p.opacity})`;
        ctx.shadowColor = "rgba(221, 201, 169, 0.6)";
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

/* ── PAGE ── */
function MastermindPage() {
  const [joinOpen, setJoinOpen] = useState(false);
  const openForm = useCallback(() => setJoinOpen(true), []);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen text-foreground relative z-[1]">
      <NoiseOverlay />
      <ScrollMorphingBackground />
      <Nav />
      <ApplyModal open={joinOpen} onClose={() => setJoinOpen(false)} source="mm" />

      {/* ─── HERO ─── */}
      <section ref={heroRef} className="relative overflow-hidden min-h-screen flex items-center">
        {/* Background image with dark overlay */}
        <div className="absolute inset-0 z-0">
          <img src={heroImg} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/85" />
        </div>

        <HeroParallaxOrb className="absolute top-1/4 -right-20 sm:-right-40 w-[20rem] sm:w-[45rem] h-[20rem] sm:h-[45rem] rounded-full bg-gold/[0.07] blur-[80px] sm:blur-[150px] pointer-events-none" />
        <HeroParallaxOrb className="absolute top-1/2 -left-20 sm:-left-40 w-[15rem] sm:w-[35rem] h-[15rem] sm:h-[35rem] rounded-full bg-gold/[0.04] blur-[80px] sm:blur-[130px] pointer-events-none" />
        <motion.div
          className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[25rem] sm:w-[50rem] h-[15rem] sm:h-[30rem] rounded-full bg-gold/[0.03] blur-[80px] sm:blur-[120px] pointer-events-none"
          style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background pointer-events-none z-[1]" />
        <HeroParticles />

        <motion.div
          style={{
            y: heroY,
            opacity: heroOpacity,
            scale: heroScale,
            willChange: "transform, opacity",
          }}
          className="container-prose relative z-10 pt-24 sm:pt-32 md:pt-40 pb-20"
        >
          <div className="max-w-5xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="mb-8 flex items-center gap-4"
            >
              <span className="h-px w-16 bg-gradient-to-r from-gold to-transparent" />
              <span className="uppercase tracking-[0.4em] text-[10px] font-semibold text-gold">
                МАСТЕРМАЙНД
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[0.95] mb-6"
            >
              Ваш личный <span className="gold-gradient">совет директоров</span> на один вечер
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-sm md:text-xl text-muted-foreground leading-relaxed max-w-3xl mb-4"
            >
              Закрытый мастермайнд от инвестиционного клуба Гордость.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 mb-10"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-gold font-medium backdrop-blur-sm bg-white/[0.02]">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                24.06.2026 · 19:00 · Москва
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="py-6 md:py-10"
            >
              <CountdownTimer />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg md:text-xl text-foreground/90 leading-relaxed max-w-3xl mb-3"
            >
              Решите свою главную бизнес-задачу за 3 часа с помощью опыта, связей и капитала равных
              вам инвесторов.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="text-sm text-gold uppercase tracking-[0.2em] font-semibold mb-10"
            >
              Формат строго для инвесторов.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1 }}
            >
              <CTAButton onClick={openForm}>Участвовать в мастермайнде</CTAButton>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-5 h-8 rounded-full border border-gold/30 flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 rounded-full bg-gold/50" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── БЛОК 2: Что такое мастермайнд ─── */}
      <ParallaxSection className="py-20 md:py-28 border-t border-border">
        <div className="container-prose">
          <StaggerText className="text-[10px] uppercase tracking-[0.4em] font-semibold text-gold mb-4">
            О формате
          </StaggerText>
          <SectionTitle align="left" className="max-w-3xl">
            Что такое мастермайнд <span className="gold-gradient">клуба Гордость</span>
          </SectionTitle>
          <div className="mt-8 max-w-3xl space-y-6">
            <StaggerText className="text-lg md:text-xl text-foreground/90 leading-relaxed">
              Это прямой обмен ресурсами.
            </StaggerText>
            <StaggerText className="text-base md:text-lg text-muted-foreground leading-relaxed">
              При подготовке к мастермайнду мы свяжемся с каждым из кандидатов, чтобы подобрать
              максимально релевантных участников, которые будут полезны друг другу.
            </StaggerText>
          </div>
          <div className="mt-10">
            <CTAButton onClick={openForm}>Участвовать в мастермайнде</CTAButton>
          </div>
        </div>
      </ParallaxSection>

      {/* ─── БЛОК 3: Лидер мастермайнда ─── */}
      <ParallaxSection bg className="py-20 md:py-28">
        <div className="container-prose">
          <SectionLabel align="left">Лидер мастермайнда</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            Андрей <span className="gold-gradient">Плахотнюк</span>
          </SectionTitle>

          <div className="mt-8 grid md:grid-cols-[1fr_1.5fr] gap-8 items-start">
            <div className="rounded-2xl overflow-hidden border border-border aspect-[3/4] max-w-xs">
              <img src={founderImg} alt="Андрей Плахотнюк" className="w-full h-full object-cover" />
            </div>
            <div>
              <StaggerText className="text-lg text-muted-foreground leading-relaxed">
                Инвестор. Экономист и банкир. 15 лет в финансах: банки, страхование, инвестиции.
                Основатель клуба «Гордость» и сообщества «ИнвестБаня».
              </StaggerText>
              <div className="grid grid-cols-2 gap-4 mt-8 [&>*]:h-full">
                {[
                  { v: "6 000+", l: "проектов рассмотрено" },
                  { v: "5+ млрд ₽", l: "привлечённый капитал" },
                  { v: "1 200+", l: "резидентов «ИнвестБани»" },
                  { v: "С 2018", l: "года в инвестициях" },
                ].map((s) => (
                  <GlassCard className="p-4 md:p-6 text-center h-full" key={s.l}>
                    <CountUp target={s.v} />
                    <div className="text-[10px] md:text-[11px] uppercase tracking-widest text-muted-foreground mt-2">
                      {s.l}
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ParallaxSection>

      {/* ─── БЛОК 4: Как всё будет происходить ─── */}
      <ParallaxSection className="py-20 md:py-28">
        <div className="container-prose">
          <SectionLabel align="left">Процесс</SectionLabel>
          <SectionTitle align="left" className="max-w-4xl">
            Как всё будет <span className="gold-gradient">происходить</span>
          </SectionTitle>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-14 [&>*]:h-full">
            {[
              {
                n: "01",
                t: "Подготовка к встрече",
                d: "Все начнется еще до мастермайнда. Мы с вами свяжемся, чтобы помочь докрутить запрос и еще сильнее увеличить результативность мастермайнда",
              },
              {
                n: "02",
                t: "Взаимообмен и конфиденциальность",
                d: "Мастермайнд проходит в тщательно отобранном узком составе участников. У каждого свои задачи и свои ресурсы, вы познакомитесь с каждым, кто будет находиться за столом.",
              },
              {
                n: "03",
                t: "Фокус на вашей задаче",
                d: "Вы озвучиваете свой текущий барьер в бизнесе или инвестициях.",
              },
              {
                n: "04",
                t: "Коллективный опыт",
                d: "Участники за столом делятся тем, что сработало у них. Вы получаете готовые связки, контакты подрядчиков и альтернативные взгляды на вашу стратегию.",
              },
              {
                n: "05",
                t: "Изменения и результат",
                d: "Даже после мастермайнда мы продолжим действовать, чтобы вы действительно достигли позитивных изменений в вашей задаче.",
              },
            ].map((s) => (
              <GlassCard key={s.n}>
                <span className="absolute top-5 right-5 sm:right-6 font-display text-base sm:text-2xl text-gold/40 tabular-nums">
                  {s.n}
                </span>
                <h3 className="font-display text-xl mb-3 text-foreground group-hover:text-gold transition-colors">
                  {s.t}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </GlassCard>
            ))}
          </div>

          <div className="mt-10 rounded-2xl overflow-hidden border border-border max-w-md">
            <img src={boardroomImg} alt="" className="w-full h-auto" />
          </div>

          <div className="mt-12">
            <CTAButton onClick={openForm}>Участвовать в мастермайнде</CTAButton>
          </div>
        </div>
      </ParallaxSection>

      {/* ─── БЛОК 5: Кто может участвовать ─── */}
      <ParallaxSection bg className="py-20 md:py-28">
        <div className="container-prose">
          <SectionLabel align="left">Модерация</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            Кто может <span className="gold-gradient">участвовать</span>
          </SectionTitle>

          <div className="mt-8 max-w-3xl space-y-4">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Мы отбираем участников вручную. Для нас важны три вещи:
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-base text-foreground/90 leading-relaxed">
                <span className="text-gold mt-0.5 shrink-0 text-[8px]">◆</span>
                Подтверждённый опыт в инвестициях или управлении бизнесом
              </li>
              <li className="flex items-start gap-3 text-base text-foreground/90 leading-relaxed">
                <span className="text-gold mt-0.5 shrink-0 text-[8px]">◆</span>
                Готовность делиться ресурсами и связями
              </li>
              <li className="flex items-start gap-3 text-base text-foreground/90 leading-relaxed">
                <span className="text-gold mt-0.5 shrink-0 text-[8px]">◆</span>
                Совпадение ценностей: долгосрочное партнерство, не быстрые сделки
              </li>
            </ul>
          </div>

          <div className="mt-12">
            <CTAButton onClick={openForm}>Участвовать в мастермайнде</CTAButton>
          </div>
        </div>
      </ParallaxSection>

      {/* ─── БЛОК 6: Итог встречи ─── */}
      <ParallaxSection className="py-20 md:py-28">
        <div className="container-prose">
          <SectionLabel align="left">Результат</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            Итог <span className="gold-gradient">встречи</span>
          </SectionTitle>

          <div className="grid sm:grid-cols-3 gap-4 mt-14 [&>*]:h-full">
            {[
              {
                t: "Конкретный план действий",
                d: "Решение вашего запроса, основанное на опыте других равных инвесторов, которые имеют свежий взгляд на вашу ситуацию.",
              },
              {
                t: "Доступ к матрице контактов",
                d: "Прямые выходы на нужных вам людей, информацию, ресурсы, партнерства.",
              },
              {
                t: "Инвестиционные идеи",
                d: "Главная цель — генерирование новых идей для развития каждого участника, включая экспертный разбор реальных сделок.",
              },
            ].map((item, i) => (
              <GlassCard key={item.t}>
                <span className="absolute top-5 right-5 sm:top-6 sm:right-6 font-display text-xs text-gold/40 tabular-nums">
                  0{i + 1}
                </span>
                <h3 className="font-display text-xl mb-3 text-foreground">{item.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
              </GlassCard>
            ))}
          </div>

          <div className="mt-12">
            <CTAButton onClick={openForm}>Участвовать в мастермайнде</CTAButton>
          </div>
        </div>
      </ParallaxSection>

      {/* ─── БЛОК 7: Почему мастермайнд эффективен ─── */}
      <ParallaxSection bg className="py-20 md:py-28">
        <div className="container-prose">
          <SectionLabel align="left">Принципы</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            Почему мастермайнд <span className="gold-gradient">эффективен</span>
          </SectionTitle>

          <div className="grid sm:grid-cols-2 gap-4 mt-14 [&>*]:h-full">
            {[
              {
                t: "Группа равных",
                d: "Мастермайнд — это в первую очередь релевантный опыт, который поможет в достижении целей, реализации проектов и разрешении проблем.",
              },
              {
                t: "Конфиденциальность",
                d: "Все участники группы соблюдают строжайшую конфиденциальность в отношении любой информации",
              },
              {
                t: "Отсутствие критики",
                d: "Одним из важнейших принципов МастерМайнд группы является отсутствие какой-либо критики идей, которые генерируются участниками в ходе встречи",
              },
              {
                t: "Строгий тайминг",
                d: "Для того, чтобы встреча проходила продуктивно и эффективно, обязательным является отведение точного количества времени на каждое обсуждение.",
              },
            ].map((item, i) => (
              <GlassCard key={item.t}>
                <span className="absolute top-5 right-5 sm:top-6 sm:right-6 font-display text-xs text-gold/40 tabular-nums">
                  0{i + 1}
                </span>
                <h3 className="font-display text-lg text-gold mb-3">{item.t}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.d}</p>
              </GlassCard>
            ))}
          </div>

          <div className="mt-12">
            <CTAButton onClick={openForm}>Участвовать в мастермайнде</CTAButton>
          </div>
        </div>
      </ParallaxSection>

      {/* ─── БЛОК 8: Займите своё место ─── */}
      <ParallaxSection id="apply" className="py-20 md:py-28">
        <div className="container-prose">
          <SectionLabel align="left">Участие</SectionLabel>
          <SectionTitle align="left" className="max-w-3xl">
            Займите своё <span className="gold-gradient">место</span>
          </SectionTitle>

          <StaggerText className="mt-8 max-w-3xl text-lg text-muted-foreground leading-relaxed">
            Количество мест на ближайший мастермайнд строго ограничено форматом — не более 10
            человек, чтобы каждый получил время на разбор.
          </StaggerText>

          <div className="mt-12 max-w-2xl space-y-4">
            <p className="text-sm uppercase tracking-[0.2em] text-gold font-semibold mb-6">
              Как стать участником:
            </p>
            {[
              { n: "01", t: "Вы оставляете заявку" },
              { n: "02", t: "Мы проводим скоринг вашей анкеты и аудит репутации" },
              {
                n: "03",
                t: "Если ваши ценности и масштаб совпадают с нашими — модератор связывается с вами для подтверждения",
              },
            ].map((s) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-4"
              >
                <span className="font-display text-2xl gold-gradient tabular-nums shrink-0">
                  {s.n}
                </span>
                <p className="text-base text-foreground/90 leading-relaxed pt-1">{s.t}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-12">
            <CTAButton onClick={openForm}>Заполнить анкету и забронировать место</CTAButton>
          </div>
        </div>
      </ParallaxSection>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border py-14 md:py-16">
        <div className="container-prose">
          <div className="grid md:grid-cols-3 gap-10 mb-12">
            <div>
              <div className="font-display text-2xl md:text-3xl tracking-[0.28em] text-gold mb-3">
                ГОРДОСТЬ
              </div>
              <p className="text-sm text-muted-foreground">Правильные люди в правильном месте.</p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Контакты</div>
              <a
                href="https://t.me/gordost_robot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex rounded-full border border-gold/35 px-5 py-3 text-sm text-foreground hover:border-gold hover:text-gold transition-colors"
              >
                Telegram-бот
              </a>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-gold mb-3">Города</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>Москва</div>
                <div>Санкт-Петербург</div>
              </div>
            </div>
          </div>
          <GradientDivider />
          <div className="text-xs text-muted-foreground/70 leading-relaxed space-y-1 mt-8">
            <div>ИП Плахотнюк Андрей Витальевич</div>
            <div>
              125480, г. Москва, муниципальный округ Северное Тушино вн.тер.г., ул. Планерная, д. 5
            </div>
            <div>ИНН 280106776632 · ОГРНИП 325774600796691</div>
            <div className="mt-4">© {new Date().getFullYear()} Гордость. Все права защищены.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
