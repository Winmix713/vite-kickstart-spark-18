// components
import { Text } from 'recharts';

// utils
import dayjs from 'dayjs';

// represent large numbers in a shortened format
export const numFormatter = (num: number, decimals = 0): string => {
  if (num > 999 && num < 1000000) {
    return (num / 1000).toFixed(decimals) + 'k';
  } else if (num > 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num < 900) {
    return num.toString();
  }
  return num.toString();
};

// random integer generator
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// add zero to numbers less than 10
export function addZero(num: number): string {
  return num < 10 ? '0' + num : num.toString();
}

// grid y-axis or x-axis points generator for recharts
/**
 *
 * @param id - container id
 * @param gutter - grid gutter
 * @param axis - 'x' or 'y'
 * @returns {*[]} - array of grid points
 */
export const generateGridPoints = (id: string, gutter = 20, axis: 'x' | 'y' = 'y'): number[] => {
  const element = document.getElementById(id);
  if (!element) return [];
  
  const gridWidth = element.offsetWidth;
  const gridHeight = element.offsetHeight;

  const points: number[] = [];
  for (let i = 0; i < (axis === 'y' ? gridWidth : gridHeight); i += gutter) {
    points.push(i);
  }
  return points;
};

// prevent default behavior for all forms and links with href="#"
export const preventDefault = () => {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', e => e.preventDefault());
  });
  document.querySelectorAll('a[href="#"]').forEach(a => {
    a.addEventListener('click', e => e.preventDefault());
  });
};

// get array of month days (date and weekday)
export const getMonthDays = (month = dayjs().month(), year = dayjs().year()) => {
  const days: Array<{ date: string; weekday: string }> = [];
  const daysInMonth = dayjs(`${year}-${month + 1}`).daysInMonth();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      date: dayjs(`${year}-${month + 1}-${i}`).format('DD'),
      weekday: dayjs(`${year}-${month + 1}-${i}`).format('dd')
    });
  }
  return days;
};

/**
 * render polar angle axis
 */
export const renderPolarAngleAxis = ({ payload, x, y, cx, cy, ...rest }: any) => {
  // This function returns JSX for Recharts components
  // Implementation will be in the component files where it's used
  return null;
};

/**
 * modify card number
 */
export const modifyCardNumber = (cardNumber: string): string => {
  const lastDigits = cardNumber.substring(8);
  const maskedDigits = "**** ";

  // Combine the modified parts to form the final card number
  const modifiedCardNumber = maskedDigits + lastDigits.slice(-4);

  return modifiedCardNumber;
};