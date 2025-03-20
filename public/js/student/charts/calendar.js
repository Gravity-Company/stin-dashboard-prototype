/**
 * ============================================================================
 * Public: Render Training Calendar with Mock Session Events
 * ============================================================================
 */
function renderCalendar(sessionData) {
  const calendarContainer = document.getElementById("calendar");
  if (!calendarContainer) {
    console.warn("Calendar container #calendar not found.");
    return;
  }

  const calendar = createCalendarInstance("#calendar");
  const events = mapSessionsToCalendarEvents(sessionData);

  calendar.clear(); // Reset old events
  calendar.createEvents(events);

  bindCalendarNavigation(calendar);
}

/**
 * ============================================================================
 * Helper: Initialize TUI Calendar instance with custom settings
 * ============================================================================
 */
function createCalendarInstance(containerSelector) {
  const Calendar = tui.Calendar;

  return new Calendar(containerSelector, {
    defaultView: "month",
    taskView: false,
    scheduleView: false,
    useCreationPopup: false,
    useDetailPopup: true,
    template: {
      milestone(schedule) {
        return `<span style="color: #fff; background-color: ${schedule.bgColor}">${schedule.title}</span>`;
      },
    },
  });
}

/**
 * ============================================================================
 * Helper: Map mock sessions to calendar event objects
 * ============================================================================
 */
function mapSessionsToCalendarEvents(sessions) {
  return sessions.map(session => ({
    id: session.scenarioId,
    calendarId: "1",
    title: getTaskCountLabel(session.steps?.[0]?.tasks?.length || 0),
    category: "time",
    start: session.date,
    bgColor: session.color || "#9CA3AF",
  }));
}

/**
 * ============================================================================
 * Helper: Generate task count label (e.g., "3 Tasks")
 * ============================================================================
 */
function getTaskCountLabel(count) {
  return `${count} Task${count === 1 ? "" : "s"}`;
}

/**
 * ============================================================================
 * Helper: Bind prev/today/next calendar navigation buttons
 * ============================================================================
 */
function bindCalendarNavigation(calendar) {
  const prevBtn = document.getElementById("prev-button");
  const todayBtn = document.getElementById("today-button");
  const nextBtn = document.getElementById("next-button");

  if (prevBtn) prevBtn.addEventListener("click", () => calendar.prev());
  if (todayBtn) todayBtn.addEventListener("click", () => calendar.today());
  if (nextBtn) nextBtn.addEventListener("click", () => calendar.next());
}
