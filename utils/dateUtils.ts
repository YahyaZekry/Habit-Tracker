export const formatDate = (date: Date): string => {
  // Create a new date object to avoid modifying the input
  const d = new Date(date);
  // Set time to midnight UTC to ensure consistent date handling
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
};

export const getDayName = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

export const getMonthName = (date: Date): string => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[date.getMonth()];
};

export const getShortMonthName = (date: Date): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return months[date.getMonth()];
};

export const getDaysInMonth = (date: Date): number => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
};

export const getWeekDates = (startOfWeek: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startOfWeek);
  currentDate.setUTCHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

export const getMonthDates = (month: number, year: number): Date[] => {
  const dates: Date[] = [];
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  
  // Get first day of week (Sunday) of the month's first week
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  
  // Get last day of week (Saturday) of the month's last week
  const endDate = new Date(lastDay);
  if (endDate.getDay() < 6) {
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
  }
  
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setUTCHours(0, 0, 0, 0);
  d2.setUTCHours(0, 0, 0, 0);
  return d1.getTime() === d2.getTime();
};

export const isSameMonth = (date1: Date, date2: Date): boolean => {
  return (
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  );
};

export const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  result.setUTCHours(0, 0, 0, 0);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  return result;
};