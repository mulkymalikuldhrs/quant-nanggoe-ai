
import React, { useEffect, useRef } from 'react';
import { SwarmAgent, AgentState } from '../types';

interface Props {
  agents: SwarmAgent[];
  state: AgentState;
}

const SwarmGraph: React.FC<Props> = ({ agents, state }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getAgentStatus = (agentId: string) => {
    const task = state.tasks.find(t => t.agentId === agentId);
    if (!task) return 'idle';
    return task.status;
  };

  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 80;
      let animationFrameId: number;
      let tick = 0;

      const render = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          tick++;

          // Draw Core (Alpha Prime)
          ctx.beginPath();
          const corePulse = 18 + Math.sin(tick * 0.1) * 2;
          ctx.arc(centerX, centerY, corePulse, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(59, 130, 246, 0.2)'; // Blue glow
          ctx.fill();
          
          ctx.beginPath();
          ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
          ctx.fillStyle = '#3b82f6';
          ctx.fill();

          // Draw Agents
          agents.forEach((agent, index) => {
              const total = agents.length;
              const angle = (index * (360 / total)) * (Math.PI / 180) - (Math.PI / 2);
              const x = centerX + radius * Math.cos(angle);
              const y = centerY + radius * Math.sin(angle);
              
              const status = getAgentStatus(agent.id);
              const isActive = status === 'active';
              const isDone = status === 'completed';
              const isRejected = status === 'rejected';

              let color = '#94a3b8'; // gray
              if (isActive) color = '#3b82f6'; // blue
              if (isDone) color = '#10b981'; // green
              if (isRejected) color = '#ef4444'; // red

              // Connection Line
              ctx.beginPath();
              ctx.moveTo(centerX, centerY);
              ctx.lineTo(x, y);
              ctx.strokeStyle = isActive ? 'rgba(59, 130, 246, 0.6)' : 'rgba(226, 232, 240, 0.5)';
              ctx.lineWidth = isActive ? 2 : 1;
              if (agent.isTemporary) ctx.setLineDash([4, 4]);
              else ctx.setLineDash([]);
              ctx.stroke();

              // Data Packet (if active)
              if (isActive) {
                  const t = (tick % 60) / 60;
                  const packX = centerX + (x - centerX) * t;
                  const packY = centerY + (y - centerY) * t;
                  
                  ctx.beginPath();
                  ctx.arc(packX, packY, 3, 0, Math.PI * 2);
                  ctx.fillStyle = color;
                  ctx.fill();
              }

              // Agent Node
              const nodeSize = isActive ? 12 : 8;
              ctx.beginPath();
              ctx.arc(x, y, nodeSize, 0, Math.PI * 2);
              ctx.fillStyle = '#f8fafc';
              ctx.strokeStyle = color;
              ctx.lineWidth = 2;
              ctx.fill();
              ctx.stroke();

              // Ripple effect for active agents
              if (isActive) {
                  ctx.beginPath();
                  ctx.arc(x, y, nodeSize + (tick % 20), 0, Math.PI * 2);
                  ctx.strokeStyle = `rgba(59, 130, 246, ${1 - (tick % 20)/20})`;
                  ctx.stroke();
              }

              // Label
              ctx.font = '9px Inter';
              ctx.fillStyle = '#64748b';
              ctx.textAlign = 'center';
              ctx.fillText(agent.name.split(' ')[0].toUpperCase(), x, y + 25);
          });

          animationFrameId = requestAnimationFrame(render);
      };

      render();

      return () => cancelAnimationFrame(animationFrameId);
  }, [agents, state]);

  return (
    <div className="relative w-full h-[200px] flex items-center justify-center bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
      <canvas ref={canvasRef} width={400} height={200} className="relative z-10" />
    </div>
  );
};

export default SwarmGraph;
