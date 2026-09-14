import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export const formatMessageTime = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(parsedDate)) {
    return format(parsedDate, 'HH:mm');
  }
  
  if (isYesterday(parsedDate)) {
    return 'Yesterday';
  }
  
  return format(parsedDate, 'MMM dd');
};

export const formatMessageTimeFull = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, 'PPP p');
};

export const formatRelativeTime = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(parsedDate, { addSuffix: true });
};

export const formatTime = (date, timeFormat = 'HH:mm') => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, timeFormat);
};

export const formatDate = (date, dateFormat = 'PPP') => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, dateFormat);
};

export const getMessageGroupDate = (date) => {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  
  if (isToday(parsedDate)) {
    return 'Today';
  }
  
  if (isYesterday(parsedDate)) {
    return 'Yesterday';
  }
  
  return format(parsedDate, 'EEEE, MMMM d');
};
