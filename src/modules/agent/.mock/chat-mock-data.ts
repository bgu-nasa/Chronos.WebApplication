export const mockProposal = {
    hardConstraints: [
        { key: "avoid_weekday", value: "Friday" },
        { key: "forbidden_timerange", value: "All days before 08:00" },
    ],
    softPreferences: [
        { key: "preferred_weekdays", value: "Monday, Wednesday" },
        { key: "preferred_time_morning", value: "true" },
        { key: "preferred_timerange", value: "Thursday 12:00 - 16:00" },
    ],
};

export const initialMockMessages = [
    {
        role: "agent" as const,
        content: "Hi! I can help you create scheduling constraints and preferences. Tell me about your scheduling needs.",
        timestamp: new Date(Date.now() - 600000).toISOString(),
    },
    {
        role: "user" as const,
        content: "I absolutely cannot work on Fridays. That's my day to recover from the week.",
        timestamp: new Date(Date.now() - 540000).toISOString(),
    },
    {
        role: "agent" as const,
        content: "Totally understandable. Fridays are sacred. What about the rest of the week?",
        timestamp: new Date(Date.now() - 480000).toISOString(),
    },
    {
        role: "user" as const,
        content: "Mornings on Monday and Wednesday would be great. I'm a morning person... on those days at least.",
        timestamp: new Date(Date.now() - 420000).toISOString(),
    },
    {
        role: "agent" as const,
        content: "A selective morning person, I respect that. So Monday and Wednesday mornings are preferred. Anything else?",
        timestamp: new Date(Date.now() - 360000).toISOString(),
    },
    {
        role: "user" as const,
        content: "Please nothing before 8:00. I need at least 3 cups of coffee before I can function.",
        timestamp: new Date(Date.now() - 300000).toISOString(),
    },
    {
        role: "agent" as const,
        content: "Noted — no slots before 8:00 AM. Coffee-dependent scheduling is my specialty.",
        timestamp: new Date(Date.now() - 240000).toISOString(),
    },
    {
        role: "user" as const,
        content: "Also, can you avoid scheduling me in Building 72? The elevator there has been broken since 2019.",
        timestamp: new Date(Date.now() - 180000).toISOString(),
    },
    {
        role: "agent" as const,
        content: "I'll do my best, but location preferences are a different feature. For now I can help with time-based constraints and preferences. Let's focus on those!",
        timestamp: new Date(Date.now() - 120000).toISOString(),
    },
    {
        role: "user" as const,
        content: "Fine, let's also say I prefer afternoons on Thursday. But only if it's not too late — nothing after 16:00.",
        timestamp: new Date(Date.now() - 60000).toISOString(),
    },
    {
        role: "agent" as const,
        content: "Here's what I've gathered from our conversation. Please review:",
        timestamp: new Date().toISOString(),
    },
];

export const mockAgentReplies = [
    "Interesting! I've noted that down. Anything else you'd like to add?",
    "Sure, I can work with that. Any other preferences?",
    "Good to know. Is there anything else bothering you about the current schedule?",
    "Noted! I'm building up a pretty clear picture of your ideal week.",
    "That makes sense. Let me know when you're ready and I'll summarize everything for you.",
];
