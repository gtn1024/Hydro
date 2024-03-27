import $ from 'jquery';
import React, { Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import ReactTooltip from 'react-tooltip';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { NamedPage } from 'vj/misc/Page';

function shiftDate(date, numDays) {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + numDays);
  return newDate;
}

function getRange(count) {
  return Array.from({ length: count }, (_, i) => i);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const today = new Date();
const dayCount = 365 + (today.getDay() + 7) % 7;

export default new NamedPage('user_detail', () => {
  const randomValues = getRange(400).map(index => {
    return {
      date: shiftDate(today, -index),
      count: getRandomInt(1, 3),
    };
  });

  const root = ReactDOM.createRoot(document.querySelector('#calendar__graph'));
  root.render(<Fragment>
    <CalendarHeatmap
      startDate={shiftDate(today, -dayCount)}
      endDate={today}
      values={randomValues}
      classForValue={value => {
        if (!value) {
          return 'color-empty';
        }
        return `color-github-${value.count}`;
      }}
      tooltipDataAttrs={value => {
        return {
          'data-tip': `${value.date.toISOString().slice(0, 10)} has count: ${value.count}`,
        };
      }}
      showWeekdayLabels={true}
      onClick={value => alert(`Clicked on value with count: ${value.count}`)}
    />
    <ReactTooltip />
  </Fragment>)
});
