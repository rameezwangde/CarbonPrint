import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import { ArrowRight, BarChart3, TrendingUp, Users, Leaf, Zap, Globe, Sparkles, Target, Award, Heart } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

const Home: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [particles, setParticles] = useState<Array<{id: number, x: number, y: number, vx: number, vy: number}>>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  // Smooth mouse following
  const mouseX = useSpring(0, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(0, { stiffness: 150, damping: 15 });

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    // Create floating particles
    const createParticles = () => {
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      }));
      setParticles(newParticles);
    };

    createParticles();
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vx: particle.x > window.innerWidth || particle.x < 0 ? -particle.vx : particle.vx,
        vy: particle.y > window.innerHeight || particle.y < 0 ? -particle.vy : particle.vy,
      })));
    };

    const interval = setInterval(animateParticles, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 relative overflow-hidden">
      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-1 h-1 bg-emerald-300 rounded-full opacity-30"
          style={{
            left: particle.x,
            top: particle.y,
          }}
          animate={{
            scale: [0.5, 1, 0.5],
            opacity: [0.2, 0.6, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Interactive Background Elements */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: y1 }}
      >
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-200 to-emerald-300 rounded-full opacity-20 blur-xl"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, 180, 360],
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-20 blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-gradient-to-r from-green-200 to-green-300 rounded-full opacity-20 blur-xl"
          animate={{
            scale: [1, 1.4, 1],
            y: [0, -25, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-16 h-16 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full opacity-15 blur-lg"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Floating Icons with Enhanced Animations */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ y: y2 }}
      >
        <motion.div
          className="absolute top-32 right-1/4 text-emerald-400 opacity-40"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          whileHover={{ scale: 1.5, opacity: 0.8 }}
        >
          <Leaf size={50} />
        </motion.div>
        <motion.div
          className="absolute top-60 left-1/3 text-blue-400 opacity-40"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -10, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          whileHover={{ scale: 1.5, opacity: 0.8 }}
        >
          <Zap size={45} />
        </motion.div>
        <motion.div
          className="absolute bottom-60 right-1/3 text-green-400 opacity-40"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 15, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
          whileHover={{ scale: 1.5, opacity: 0.8 }}
        >
          <Globe size={55} />
        </motion.div>
        <motion.div
          className="absolute top-1/3 left-1/5 text-purple-400 opacity-30"
          animate={{
            y: [0, 10, 0],
            rotate: [0, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          whileHover={{ scale: 1.5, opacity: 0.8 }}
        >
          <Sparkles size={40} />
        </motion.div>
      </motion.div>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="pt-20 pb-32 relative"
        style={{ opacity }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Animated Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mr-2"
            >
              <Sparkles size={16} />
            </motion.div>
            Join 10,000+ users making a difference
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            className="text-6xl md:text-8xl font-bold text-gray-900 mb-8"
            whileHover={{ scale: 1.02 }}
            style={{ lineHeight: '1.2', paddingBottom: '0.2em' }}
          >
            <motion.span
              initial={{ opacity: 0, x: -100, rotateX: -90 }}
              animate={{ opacity: 1, x: 0, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              className="block"
              style={{ paddingBottom: '0.05em' }}
            >
              Carbon
            </motion.span>
            <motion.span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-blue-600 to-purple-600 block"
              initial={{ opacity: 0, x: 100, rotateX: 90 }}
              animate={{ opacity: 1, x: 0, rotateX: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.05,
                filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))"
              }}
              style={{ paddingTop: '0.05em', paddingBottom: '0.15em' }}
            >
              IQ
            </motion.span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed"
            whileHover={{ scale: 1.02 }}
          >
            🌱 Take our comprehensive survey to discover your carbon footprint and get personalized insights, 
            data visualization, and actionable recommendations for a sustainable future.
          </motion.p>

          {/* Enhanced CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.div
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsHovering(true)}
              onHoverEnd={() => setIsHovering(false)}
            >
              <Link
                to="/survey"
                className="group bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-12 py-6 rounded-2xl font-semibold text-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl transform hover:scale-105 relative overflow-hidden"
              >
                {/* Animated background gradient */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <motion.div
                  className="relative z-10"
                  animate={isHovering ? { rotate: [0, 10, -10, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Target size={24} />
                </motion.div>
                <span className="relative z-10">Start Your Carbon Journey</span>
                <motion.div
                  className="relative z-10"
                  animate={isHovering ? { x: [0, 5, 0] } : { x: 0 }}
                  transition={{ duration: 0.5, repeat: isHovering ? Infinity : 0 }}
                >
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/about"
                className="group border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-emerald-600 hover:text-white transition-all duration-300 flex items-center space-x-3"
              >
                <span>Learn More</span>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Globe className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: "10K+", label: "Users Tracked", icon: Users },
              { number: "50K+", label: "CO2 Saved (kg)", icon: Leaf },
              { number: "95%", label: "Satisfaction Rate", icon: Award }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-xl mb-4 mx-auto">
                  <stat.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <motion.div
                  className="text-3xl font-bold text-gray-900 mb-2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.6 + index * 0.1, type: "spring" }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Enhanced Mouse follower effect */}
          <motion.div
            className="fixed w-6 h-6 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full pointer-events-none z-50 mix-blend-difference"
            animate={{
              x: mouseX.get() - 12,
              y: mouseY.get() - 12,
            }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 28
            }}
          />
          <motion.div
            className="fixed w-2 h-2 bg-white rounded-full pointer-events-none z-50"
            animate={{
              x: mouseX.get() - 4,
              y: mouseY.get() - 4,
            }}
            transition={{
              type: "spring",
              stiffness: 1000,
              damping: 30
            }}
          />
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-32 bg-gradient-to-b from-white/50 to-emerald-50/50 backdrop-blur-sm relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        {/* Enhanced animated background pattern */}
        <motion.div
          className="absolute inset-0 opacity-10"
          initial={{ scale: 0, rotate: 0 }}
          whileInView={{ scale: 1, rotate: 360 }}
          transition={{ duration: 2, delay: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 animate-pulse" />
        </motion.div>

        {/* Floating geometric shapes */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <motion.div
            className="absolute top-20 left-20 w-16 h-16 border-2 border-emerald-300 rounded-lg opacity-20"
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute top-40 right-32 w-12 h-12 border-2 border-blue-300 rounded-full opacity-20"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-32 left-1/3 w-20 h-20 border-2 border-purple-300 rounded-lg opacity-20"
            animate={{ rotate: [360, 180, 0], y: [0, -20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-100 to-blue-100 text-emerald-700 rounded-full text-sm font-medium mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <Heart size={18} />
              </motion.div>
              Features that make a difference
            </motion.div>

            <motion.h2 
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              whileHover={{ 
                scale: 1.02,
                textShadow: "0 0 30px rgba(0, 0, 0, 0.1)"
              }}
            >
              Powerful Features for
              <motion.span 
                className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-blue-600 block"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Climate Action
              </motion.span>
            </motion.h2>
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
            >
              Our comprehensive platform provides the tools you need to measure, 
              understand, and reduce your carbon footprint effectively. 🌍
            </motion.p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            initial={{ opacity: 0, y: 80 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            {[
              {
                icon: Users,
                title: "Personal Analysis",
                description: "Get detailed insights into your individual carbon footprint based on lifestyle choices, consumption patterns, and daily activities.",
                color: "emerald",
                delay: 0.1
              },
              {
                icon: BarChart3,
                title: "Domain Analysis", 
                description: "Explore carbon footprint patterns across different domains and areas to identify key improvement opportunities.",
                color: "blue",
                delay: 0.2
              },
              {
                icon: TrendingUp,
                title: "Forecasts",
                description: "View predictive models and forecasts to understand future environmental impact trends and plan accordingly.",
                color: "purple",
                delay: 0.3
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 0.8, delay: feature.delay }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -15,
                  scale: 1.03,
                  rotateY: 5,
                  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
                }}
                className="group"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-gray-100 hover:border-emerald-200 transition-all duration-300 h-full">
                  <motion.div
                    className={`flex items-center justify-center w-20 h-20 bg-gradient-to-r from-${feature.color}-100 to-${feature.color}-200 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <feature.icon className={`w-10 h-10 text-${feature.color}-600`} />
                  </motion.div>
                  
                  <motion.h3 
                    className="text-2xl font-bold text-gray-900 mb-6 group-hover:text-emerald-600 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: feature.delay + 0.2 }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  <motion.p 
                    className="text-gray-600 leading-relaxed text-lg group-hover:text-gray-700 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: feature.delay + 0.3 }}
                  >
                    {feature.description}
                  </motion.p>

                  {/* Animated underline */}
                  <motion.div
                    className={`h-1 bg-gradient-to-r from-${feature.color}-400 to-${feature.color}-600 rounded-full mt-6`}
                    initial={{ width: 0 }}
                    whileInView={{ width: "100%" }}
                    transition={{ duration: 0.8, delay: feature.delay + 0.4 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Enhanced Call to Action Section */}
      <motion.section
        className="py-32 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 relative overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        {/* Dynamic animated background */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6)",
              "linear-gradient(45deg, #3b82f6, #8b5cf6, #10b981)",
              "linear-gradient(45deg, #8b5cf6, #10b981, #3b82f6)",
              "linear-gradient(45deg, #10b981, #3b82f6, #8b5cf6)"
            ]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Floating orbs */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <motion.div
            className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full blur-xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -25, 0],
              y: [0, 25, 0],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          <motion.div
            className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        
        {/* Animated wave effect */}
        <motion.div
          className="absolute top-0 left-0 w-full h-full bg-white opacity-5"
          animate={{
            x: ["-100%", "100%"],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mr-2"
            >
              <Sparkles size={18} />
            </motion.div>
            Ready to make a real impact?
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-bold text-white mb-8 leading-tight"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.span
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Ready to Make a
            </motion.span>
            <motion.span 
              className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              whileHover={{ 
                scale: 1.05,
                filter: "drop-shadow(0 0 20px rgba(255, 255, 255, 0.5))"
              }}
            >
              Real Difference?
            </motion.span>
          </motion.h2>
          
          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
          >
            🌟 Join thousands of users who are already tracking and reducing their carbon footprint. 
            Start your sustainability journey today and become part of the solution!
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <motion.div
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.4)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/survey"
                className="group bg-white text-emerald-600 px-12 py-6 rounded-2xl font-semibold text-xl hover:bg-emerald-50 transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-2xl relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
                <motion.div
                  className="relative z-10"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Target size={24} />
                </motion.div>
                <span className="relative z-10">Get Started Now</span>
                <motion.div
                  className="relative z-10"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/about"
                className="group border-2 border-white text-white px-10 py-4 rounded-2xl font-semibold text-lg hover:bg-white hover:text-emerald-600 transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm"
              >
                <span>Learn More</span>
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Globe className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            viewport={{ once: true }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-white/80"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Award className="w-5 h-5" />
              <span className="text-sm font-medium">Trusted by 10,000+ users</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Heart className="w-5 h-5" />
              <span className="text-sm font-medium">95% satisfaction rate</span>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <Leaf className="w-5 h-5" />
              <span className="text-sm font-medium">50,000+ kg CO2 saved</span>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;