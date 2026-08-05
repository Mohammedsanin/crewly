import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Hash, MessageCircle, Plus, ShieldAlert, Check, ShieldCheck, UserPlus, Trash2, LogIn } from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { UserAvatar } from '../common/UserAvatar';

interface TeamChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamChatDrawer: React.FC<TeamChatDrawerProps> = ({ isOpen, onClose }) => {
  const {
    chatMessages,
    sendChatMessage,
    syncChatMessages,
    employees,
    currentUser,
    chatChannels,
    createChatChannel,
    activeRolePerspective,
    chatConnections,
    sendChatRequest,
    acceptChatRequest,
    declineChatRequest,
    setCurrentUser,
  } = useERP();

  const [activeChannel, setActiveChannel] = useState<string>('#general');
  const [inputText, setInputText] = useState('');
  const [isCreatingChannel, setIsCreatingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [reactions, setReactions] = useState<Record<string, string[]>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync messages periodically when open
  useEffect(() => {
    if (!isOpen) return;
    syncChatMessages(activeChannel);

    const interval = setInterval(() => {
      syncChatMessages(activeChannel);
    }, 2000);

    return () => clearInterval(interval);
  }, [isOpen, activeChannel]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isOpen, activeChannel]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendChatMessage(activeChannel, inputText.trim());
    setInputText('');
  };

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    createChatChannel(newChannelName.trim());
    setActiveChannel(`#${newChannelName.trim().toLowerCase()}`);
    setNewChannelName('');
    setIsCreatingChannel(false);
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    setReactions((prev) => {
      const active = prev[msgId] || [];
      if (active.includes(emoji)) {
        return { ...prev, [msgId]: active.filter((e) => e !== emoji) };
      }
      return { ...prev, [msgId]: [...active, emoji] };
    });
  };

  const filteredMessages = chatMessages.filter((m) => m.channel === activeChannel);

  // Check connection status for DM channels
  const isDM = !activeChannel.startsWith('#');
  const otherMember = isDM
    ? employees.find((e) => activeChannel.includes(e.id))
    : null;

  const dmConnection = otherMember
    ? chatConnections.find(
        (c) =>
          (c.senderId === currentUser?.id && c.receiverId === otherMember.id) ||
          (c.senderId === otherMember.id && c.receiverId === currentUser?.id)
      )
    : null;

  const incomingRequests = chatConnections.filter(
    (c) => c.receiverId === currentUser?.id && c.status === 'pending'
  );

  // Department Badges color mapping
  const getDeptBadgeStyles = (dept: string) => {
    const d = (dept || '').toLowerCase();
    if (d.includes('eng')) return 'bg-indigo-50 text-indigo-755 border-indigo-150';
    if (d.includes('design') || d.includes('art')) return 'bg-purple-50 text-purple-755 border-purple-150';
    if (d.includes('prod') || d.includes('manage')) return 'bg-cyan-50 text-cyan-755 border-cyan-150';
    if (d.includes('sale') || d.includes('market')) return 'bg-emerald-50 text-emerald-755 border-emerald-150';
    return 'bg-slate-55 text-slate-650 border-slate-150';
  };

  const getConnectionBadge = (empId: string) => {
    const conn = chatConnections.find(
      (c) =>
        (c.senderId === currentUser?.id && c.receiverId === empId) ||
        (c.senderId === empId && c.receiverId === currentUser?.id)
    );
    if (!conn) return null;
    if (conn.status === 'accepted') return <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    if (conn.status === 'pending') {
      if (conn.senderId === empId) {
        return (
          <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-200 shrink-0 animate-pulse" title="Sent you an invite">
            Invite
          </span>
        );
      }
      return (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 animate-ping" title="Request Pending" />
      );
    }
    return null;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 cursor-pointer"
          />

          {/* Slide-out Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 240 }}
            className="fixed top-0 right-0 h-screen w-full sm:w-[520px] bg-white border-l border-slate-150 shadow-2xl z-50 flex overflow-hidden select-none"
          >
            {/* Premium Creative White/Indigo Left Pane */}
            <div className="w-[185px] bg-[#f8fafc]/95 border-r border-slate-200/80 p-4 flex flex-col justify-between h-full shrink-0">
              
              {/* Top Section: Channels */}
              <div className="flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Channels</h4>
                  {activeRolePerspective === 'admin' && (
                    <button
                      onClick={() => setIsCreatingChannel(!isCreatingChannel)}
                      className="p-1 rounded-lg hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                      title="Create Custom Channel"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Inline Channel Creation Input */}
                <AnimatePresence>
                  {isCreatingChannel && (
                    <motion.form
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      onSubmit={handleCreateChannel}
                      className="mb-4 p-2 rounded-xl border border-indigo-100 bg-white shadow-2xs space-y-2"
                    >
                      <input
                        type="text"
                        placeholder="new-channel"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                        className="w-full bg-slate-55 border border-slate-205 rounded-lg px-2 py-1 text-[11px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-400"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setIsCreatingChannel(false)}
                          className="px-2 py-0.5 text-[9px] font-bold text-slate-400 hover:text-slate-650 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newChannelName.trim()}
                          className="px-2.5 py-0.5 rounded-md bg-indigo-650 text-white text-[9px] font-black hover:bg-indigo-600 transition-all cursor-pointer disabled:opacity-50"
                        >
                          Create
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* Channels List */}
                <div className="space-y-1 overflow-y-auto max-h-[300px] scrollbar-hide">
                  {chatChannels.map((chan) => (
                    <button
                      key={chan}
                      onClick={() => setActiveChannel(chan)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-black flex items-center gap-2.5 transition-all cursor-pointer border ${
                        activeChannel === chan
                          ? 'bg-indigo-50 border-indigo-150 text-indigo-700 shadow-3xs'
                          : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-200/50 hover:text-slate-800'
                      }`}
                    >
                      <Hash className={`w-3.5 h-3.5 shrink-0 ${activeChannel === chan ? 'text-indigo-650' : 'text-slate-400'}`} />
                      <span className="truncate">{chan.substring(1)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bottom Section: Roster Profiles Pushed Down */}
              <div className="flex flex-col min-h-0 pt-4 border-t border-slate-200 mt-auto">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-1">Roster Profiles</h4>
                <div className="space-y-2 overflow-y-auto max-h-[220px] scrollbar-hide">
                  {employees
                    .filter((e) => e.id !== currentUser?.id)
                    .map((emp) => {
                      const dmChan = `dm-${[currentUser?.id, emp.id].sort().join('-')}`;
                      const isSelected = activeChannel === dmChan;
                      return (
                        <button
                          key={emp.id}
                          onClick={() => setActiveChannel(dmChan)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 group/roster ${
                            isSelected
                              ? 'bg-indigo-50/50 border-indigo-200 text-indigo-900 shadow-3xs'
                              : 'bg-white hover:bg-slate-50 border-slate-200/80 text-slate-700 shadow-3xs'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 w-full">
                            <div className="relative shrink-0">
                              <UserAvatar src={emp.avatar} name={emp.name} className="w-6 h-6 rounded-lg border border-slate-200 text-[10px]" />
                              {/* Green pulse ring dot indicator */}
                              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white animate-pulse" />
                            </div>
                            <div className="truncate flex-grow flex items-center justify-between gap-1">
                              <div className="truncate">
                                <p className="text-[11px] font-black leading-none truncate group-hover/roster:text-indigo-600 transition-colors">
                                  {emp.name}
                                </p>
                                <span className={`inline-block text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded border mt-1.5 leading-none shrink-0 ${getDeptBadgeStyles(emp.department)}`}>
                                  {emp.department}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {getConnectionBadge(emp.id)}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

            </div>

            {/* Main Chat Flow Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#fbfbfb]">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between bg-white shadow-3xs">
                <div className="flex items-center gap-3 truncate">
                  <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/60 shrink-0 shadow-3xs">
                    {activeChannel.startsWith('#') ? <Hash className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <h3 className="text-[13px] font-black text-slate-800 tracking-tight leading-none truncate">
                      {activeChannel.startsWith('#')
                        ? activeChannel
                        : `${employees.find((e) => activeChannel.includes(e.id))?.name || 'Private DM'}`}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Real-time team synchronization</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-650 transition-colors cursor-pointer border border-slate-150 bg-white shadow-3xs"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Incoming DM Requests Notification Banner */}
              {incomingRequests.length > 0 && (
                <div className="px-5 py-3.5 bg-amber-50 border-b border-amber-200 flex flex-col gap-2 shrink-0 animate-fade-in">
                  <div className="flex items-center gap-2 text-xs font-black text-amber-800">
                    <ShieldAlert className="w-4 h-4 text-amber-600 animate-bounce" />
                    <span>Incoming Connection Invitations ({incomingRequests.length})</span>
                  </div>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto scrollbar-hide">
                    {incomingRequests.map((conn) => {
                      const sender = employees.find((e) => e.id === conn.senderId);
                      return (
                        <div key={conn.id} className="flex items-center justify-between bg-white border border-amber-200/80 p-2.5 rounded-2xl shadow-3xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <UserAvatar src={sender?.avatar} name={sender?.name || 'User'} className="w-5.5 h-5.5 rounded-lg border border-slate-200 text-[10px]" />
                            <span className="text-[11px] font-black text-slate-800 truncate">
                              {sender?.name || 'Someone'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => declineChatRequest(conn.id)}
                              className="px-2.5 py-1 rounded-xl border border-slate-200 text-[10px] font-black text-slate-500 hover:bg-slate-50 cursor-pointer"
                            >
                              Decline
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                acceptChatRequest(conn.id);
                                const dmChan = `dm-${[currentUser?.id, conn.senderId].sort().join('-')}`;
                                setActiveChannel(dmChan);
                              }}
                              className="px-3.5 py-1 rounded-xl bg-indigo-650 hover:bg-indigo-600 text-white text-[10px] font-black transition-all cursor-pointer shadow-sm shadow-indigo-650/10"
                            >
                              Accept
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Message History OR Chat Request Panel */}
              {isDM && otherMember && (!dmConnection || dmConnection.status !== 'accepted') ? (
                /* Chat Request Blocking UI (Stalking Prevention) */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/40">
                  <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-650 mb-4 shadow-sm">
                    <ShieldAlert className="w-7 h-7" />
                  </div>

                  <h3 className="text-[14px] font-black text-slate-800 tracking-tight">Private Connection Required</h3>
                  <p className="text-[11px] text-slate-500 max-w-[280px] mt-1.5 leading-relaxed">
                    To connect with <strong className="text-slate-700">{otherMember.name}</strong>, you must send a chat invitation first. They will need to accept before you can communicate.
                  </p>

                  <div className="mt-6 w-full max-w-[280px]">
                    {!dmConnection ? (
                      /* Send request action */
                      <button
                        onClick={() => sendChatRequest(otherMember.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all cursor-pointer shadow-md shadow-indigo-600/10"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Send Connection Request</span>
                      </button>
                    ) : dmConnection.status === 'pending' && dmConnection.senderId === currentUser?.id ? (
                      /* Invitation sent - pending accept */
                      <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-2xl text-[11px] text-amber-800 font-bold flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-550 animate-ping" />
                        <span>Connection invitation sent... pending approval</span>
                      </div>
                    ) : dmConnection.status === 'pending' && dmConnection.senderId === otherMember.id ? (
                      /* Invitation received - accept/decline action */
                      <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3">
                        <p className="text-[11px] text-slate-655 font-bold">
                          {otherMember.name} has requested to chat with you.
                        </p>
                        <div className="flex items-center gap-2 justify-center">
                          <button
                            onClick={() => declineChatRequest(dmConnection.id)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-[11px] font-black text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => acceptChatRequest(dmConnection.id)}
                            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-black transition-all cursor-pointer shadow-sm shadow-indigo-600/10"
                          >
                            Accept Request
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Declined / Blocks */
                      <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-2xl text-[11px] text-rose-800 font-bold">
                        Connection Request Declined
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Regular Channels or Approved DMs Chat Flow */
                <>
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {filteredMessages.map((msg, idx) => {
                      const isMe = msg.senderId === currentUser?.id;
                      const senderEmp = employees.find((e) => e.id === msg.senderId);
                      const msgReactions = reactions[msg.id] || [];

                      return (
                        <div key={msg.id || idx} className={`flex items-start gap-3 group relative ${isMe ? 'flex-row-reverse' : ''}`}>
                          <UserAvatar src={msg.senderAvatar} name={msg.senderName} className="w-7 h-7 rounded-xl text-[10px] shrink-0 border border-slate-200" />
                          
                          <div className="max-w-[72%]">
                            {!isMe && (
                              <div className="flex items-center gap-1.5 mb-1.5 ml-1">
                                <span className="text-[10px] font-black text-slate-700">
                                  {msg.senderName}
                                </span>
                                {senderEmp && (
                                  <span className="text-[8px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded border bg-indigo-50/50 text-indigo-655 border-indigo-100">
                                    {senderEmp.role}
                                  </span>
                                )}
                              </div>
                            )}

                            <div className="relative">
                              <div
                                className={`p-3 rounded-2xl border text-xs leading-relaxed transition-all shadow-3xs ${
                                  isMe
                                    ? 'bg-indigo-600 border-indigo-700 text-white rounded-tr-xs'
                                    : 'bg-white border-slate-150 text-slate-700 rounded-tl-xs hover:border-slate-250'
                                }`}
                              >
                                {msg.text}
                              </div>

                              {/* Quick Reactions bar on hover */}
                              <div className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-1.5 py-1 rounded-xl bg-white border border-slate-200 shadow-lg z-25 ${isMe ? 'right-full mr-2' : 'left-full ml-2'}`}>
                                {['👍', '❤️', '🔥', '🚀'].map((emoji) => (
                                  <button
                                    key={emoji}
                                    onClick={() => toggleReaction(msg.id, emoji)}
                                    className="hover:scale-120 text-xs transition-transform p-0.5 cursor-pointer"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Display Reactions */}
                            {msgReactions.length > 0 && (
                              <div className={`flex flex-wrap gap-1 mt-1.5 ${isMe ? 'justify-end' : ''}`}>
                                {msgReactions.map((emoji, eIdx) => (
                                  <span key={eIdx} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-50 border border-slate-150 text-[10px] font-bold">
                                    {emoji}
                                  </span>
                                ))}
                              </div>
                            )}

                            <span className={`text-[9px] text-slate-400 font-semibold block mt-1 ${isMe ? 'text-right mr-1' : 'ml-1'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />

                    {filteredMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400 select-none">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-2 text-slate-400">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-extrabold text-slate-600">No messages yet</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Start the conversation by typing below!</p>
                      </div>
                    )}
                  </div>

                  {/* Message Entry Input Bar */}
                  <form onSubmit={handleSend} className="p-4 border-t border-slate-150 flex items-center gap-2 bg-white">
                    <input
                      type="text"
                      placeholder="Type your message..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100/60 transition-all placeholder-slate-400 font-medium"
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim()}
                      className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-all shadow-xs cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
