import { Message } from "@/redux/slices/chat";

export const groupMessage = (messages: Message[], hasMore: boolean): Message[] => {
  const newMessages: Message[] = [];
  let group: Date;

  messages.forEach((m, i) => {
    const date = new Date(m.createdAt * 1000);
    if (!group) {
      group = date;
      newMessages.push(m);
      if (i === messages.length - 1 && !hasMore) {
        newMessages.push({
          ...m,
          id: m.id + 0.5,
          messageType: "MESSAGE_TYPE_TIMELINE",
        });
      }
    } else {
      if (
        group.getDate() === date.getDate() &&
        group.getMonth() === date.getMonth() &&
        group.getFullYear() === date.getFullYear()
      ) {
        newMessages.push(m);
      } else {
        newMessages.push(
          {
            ...newMessages[newMessages.length - 1],
            id: newMessages[newMessages.length - 1].id + 0.5,
            createdAt: group.getTime() / 1000,
            messageType: "MESSAGE_TYPE_TIMELINE",
          },
          m
        );
        group = date;
      }
      if (i === messages.length - 1 && !hasMore) {
        newMessages.push({
          ...m,
          id: m.id + 0.5,
          messageType: "MESSAGE_TYPE_TIMELINE",
        });
      }
    }
  });

  return newMessages;
};
