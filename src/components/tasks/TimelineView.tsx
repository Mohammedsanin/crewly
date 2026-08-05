import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, MessageSquare, AlertCircle } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Task } from '../../types';
import { UserAvatar } from '../common/UserAvatar';

export const TimelineView: React.FC = () => {
  const { tasks, setSelectedTaskId } = useERP();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Generate 14 days centered around the currentDate
  const getTimelineDays = (centerDate: Date) => {
    const days: Date[] = [];
    const start = new Date(centerDate.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days back
    for (let i = 0; i < 14; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      days.push(d);
    }
    return days;
  };

  const timelineDays = getTimelineDays(currentDate);
  const startRange = timelineDays[0];
  const endRange = timelineDays[timelineDays.length - 1];

  // Group tasks by client
  const clientsMap: Record<string, Task[]> = {};
  tasks.forEach((t) => {
    const name = t.clientName || 'Internal / General Operations';
    if (!clientsMap[name]) clientsMap[name] = [];
    clientsMap[name].push(t);
  });

  const handlePrev = () => {
    setCurrentDate((prev) => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const handleNext = () => {
    setCurrentDate((prev) => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to check if a task falls within the active 14-day timeline window
  const getTaskGridPlacement = (task: Task) => {
    const dueTime = new Date(task.dueDate).getTime();
    const startTime = dueTime - 5 * 24 * 60 * 60 * 1000; // Assume 6-day duration

    // Find grid column indices
    const startIdx = timelineDays.findIndex((d) => {
      const dStr = d.toISOString().split('T')[0];
      const sStr = new Date(startTime).toISOString().split('T')[0];
      return dStr === sStr;
    });

    const endIdx = timelineDays.findIndex((d) => {
      const dStr = d.toISOString().split('T')[0];
      const tStr = new Date(dueTime).toISOString().split('T')[0];
      return dStr === tStr;
    });

    if (startIdx === -1 && endIdx === -1) {
      // Out of range check
      if (startTime < startRange.getTime() && dueTime > endRange.getTime()) {
        return { start: 1, span: 14 };
      }
      return null;
    }

    const startCol = startIdx !== -1 ? startIdx + 1 : 1;
    const endCol = endIdx !== -1 ? endIdx + 1 : 14;
    const span = Math.max(1, endCol - startCol + 1);

    return { start: startCol, span };
  };

  const priorityColor: Record<string, string> = {
    high: 'bg-rose-500/10 text-rose-700 border-rose-200 hover:bg-rose-500/15',
    urgent: 'bg-red-600/10 text-red-800 border-red-300 hover:bg-red-600/15 animate-pulse',
    medium: 'bg-indigo-500/10 text-indigo-700 border-indigo-200 hover:bg-indigo-500/15',
    low: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200',
  };

  return (
    <div className="glass-card rounded-3xl border border-indigo-100 bg-white shadow-xl overflow-hidden flex flex-col">
      {/* Timeline Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight">Project Gantt Timeline</h3>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              {startRange.toLocaleDateString([], { month: 'short', day: 'numeric' })} –{' '}
              {endRange.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-3xs">
          <button
            onClick={handlePrev}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 hover:bg-slate-50 text-xs font-bold text-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-slate-50 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header Row Days */}
          <div className="grid grid-cols-12 border-b border-slate-100">
            <div className="col-span-3 p-4 bg-slate-50/50 font-black text-[10px] uppercase text-slate-400 tracking-wider border-r border-slate-100">
              Project Stream / Client
            </div>
            <div className="col-span-9 grid grid-cols-14">
              {timelineDays.map((day, idx) => {
                const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                return (
                  <div
                    key={idx}
                    className={`p-3 text-center flex flex-col items-center justify-center border-r border-slate-100 last:border-r-0 ${isToday ? 'bg-indigo-50/60' : ''}`}
                  >
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-indigo-600' : 'text-slate-400'}`}>
                      {day.toLocaleDateString([], { weekday: 'narrow' })}
                    </span>
                    <span className={`text-xs font-black mt-1 ${isToday ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs' : 'text-slate-800'}`}>
                      {day.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Group Client Streams */}
          <div className="divide-y divide-slate-100">
            {Object.keys(clientsMap).map((clientName) => {
              const clientTasks = clientsMap[clientName];
              return (
                <div key={clientName} className="grid grid-cols-12 items-stretch min-h-[80px]">
                  {/* Left Side Client Name */}
                  <div className="col-span-3 p-4 bg-slate-50/20 flex flex-col justify-center border-r border-slate-100">
                    <span className="text-xs font-black text-slate-800 tracking-tight leading-snug">
                      {clientName}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold mt-0.5">
                      {clientTasks.length} task{clientTasks.length !== 1 ? 's' : ''} active
                    </span>
                  </div>

                  {/* Right Side Gantt Grid Bars */}
                  <div className="col-span-9 grid grid-cols-14 relative bg-slate-50/5 p-4 gap-y-2">
                    {/* Vertical grid line indicators */}
                    <div className="absolute inset-0 grid grid-cols-14 pointer-events-none">
                      {timelineDays.map((_, idx) => (
                        <div key={idx} className="border-r border-slate-100/60 h-full last:border-r-0" />
                      ))}
                    </div>

                    {/* Render Task Bars */}
                    <div className="col-span-14 flex flex-col gap-2.5 relative z-10">
                      {clientTasks.map((task) => {
                        const placement = getTaskGridPlacement(task);
                        if (!placement) return null; // Outside active window

                        return (
                          <div
                            key={task.id}
                            style={{
                              gridColumnStart: placement.start,
                              gridColumnEnd: `span ${placement.span}`,
                            }}
                            className="grid"
                          >
                            <motion.div
                              whileHover={{ scale: 1.01, y: -1 }}
                              onClick={() => setSelectedTaskId(task.id)}
                              className={`p-2 rounded-xl border shadow-2xs hover:shadow-sm cursor-pointer transition-all flex items-center justify-between gap-3 text-left ${priorityColor[task.priority]}`}
                            >
                              <div className="truncate flex-1">
                                <span className="text-[11px] font-black block truncate leading-tight">
                                  {task.title}
                                </span>
                                <span className="text-[9px] font-bold block mt-0.5 opacity-80 leading-none">
                                  Due {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {task.comments && task.comments.length > 0 && (
                                  <div className="flex items-center text-[10px] font-bold gap-0.5 opacity-70">
                                    <MessageSquare className="w-3 h-3" />
                                    <span>{task.comments.length}</span>
                                  </div>
                                )}
                                <UserAvatar src="" name={task.assignedTo} className="w-5 h-5 rounded-lg border border-white/20 text-[9px]" />
                              </div>
                            </motion.div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {Object.keys(clientsMap).length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5 text-slate-300" />
                <span>No tasks available in this timeline window. Add or schedule deliverables.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
