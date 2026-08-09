import React from 'react';
import { motion } from 'framer-motion';

export const FloatingCardsDeco = () => (
  <div className="absolute -right-16 top-10 pointer-events-none w-32 h-40 hidden lg:block" style={{ perspective: '1000px' }}>
    <motion.div 
      animate={{ y: [0, -10, 0], rotateZ: [10, 12, 10] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="absolute inset-0 bg-[url('https://placehold.co/200x300/1a1a2e/cyan?text=Card')] bg-cover rounded-xl border border-cyan-400/50 shadow-[0_0_30px_rgba(34,211,238,0.3)]"
      style={{ transform: 'rotateY(-20deg) rotateX(10deg)' }}
    />
    <motion.div 
      animate={{ y: [0, 10, 0], rotateZ: [-5, -7, -5] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute -bottom-10 -left-10 w-24 h-32 bg-[url('https://placehold.co/200x300/1a1a2e/fuchsia?text=Rare')] bg-cover rounded-xl border border-fuchsia-400/50 shadow-[0_0_30px_rgba(217,70,239,0.3)]"
      style={{ transform: 'rotateY(15deg) rotateX(-5deg)' }}
    />
  </div>
);
