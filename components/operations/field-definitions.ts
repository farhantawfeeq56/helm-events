export const getFields = (collectionName: string): any[] => {
  switch (collectionName) {
    case "speakers":
      return [
        { name: "fullName", label: "Full Name", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "company", label: "Company", type: "text" },
        { name: "topic", label: "Topic", type: "text" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Confirmed", value: "Confirmed" },
            { label: "Pending", value: "Pending" },
            { label: "Withdrawn", value: "Withdrawn" },
          ],
        },
      ];
    case "attendees":
      return [
        { name: "fullName", label: "Full Name", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "organization", label: "Organization", type: "text" },
        {
          name: "ticketType",
          label: "Ticket Type",
          type: "select",
          options: [
            { label: "VIP", value: "VIP" },
            { label: "General", value: "General" },
            { label: "Student", value: "Student" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Registered", value: "Registered" },
            { label: "Checked-in", value: "Checked-in" },
            { label: "Cancelled", value: "Cancelled" },
          ],
        },
      ];
    case "volunteers":
      return [
        { name: "fullName", label: "Full Name", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "role", label: "Role", type: "text" },
        { name: "shift", label: "Shift", type: "text" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "Active" },
            { label: "Pending", value: "Pending" },
            { label: "Inactive", value: "Inactive" },
          ],
        },
      ];
    case "sponsors":
      return [
        { name: "companyName", label: "Company Name", type: "text" },
        {
          name: "tier",
          label: "Tier",
          type: "select",
          options: [
            { label: "Platinum", value: "Platinum" },
            { label: "Gold", value: "Gold" },
            { label: "Silver", value: "Silver" },
            { label: "Bronze", value: "Bronze" },
          ],
        },
        { name: "contact", label: "Contact Person", type: "text" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Active", value: "Active" },
            { label: "Pending", value: "Pending" },
          ],
        },
      ];
    case "events":
      return [
        { name: "name", label: "Event Name", type: "text" },
        { name: "venue", label: "Venue", type: "text" },
        { name: "city", label: "City", type: "text" },
        { name: "startDate", label: "Start Date", type: "text", placeholder: "YYYY-MM-DD" },
        { name: "endDate", label: "End Date", type: "text", placeholder: "YYYY-MM-DD" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Planning", value: "planning" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Live", value: "live" },
            { label: "Completed", value: "completed" },
          ],
        },
      ];
    case "sessions":
      return [
        { name: "title", label: "Title", type: "text" },
        { name: "track", label: "Track", type: "text" },
        { name: "startTime", label: "Start Time", type: "text", placeholder: "YYYY-MM-DD HH:MM" },
        { name: "endTime", label: "End Time", type: "text", placeholder: "YYYY-MM-DD HH:MM" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Draft", value: "draft" },
            { label: "Confirmed", value: "confirmed" },
            { label: "Live", value: "live" },
            { label: "Completed", value: "completed" },
          ],
        },
      ];
    case "rooms":
      return [
        { name: "name", label: "Room Name", type: "text" },
        { name: "capacity", label: "Capacity", type: "number" },
        { name: "location", label: "Location", type: "text" },
        { name: "setupStyle", label: "Setup Style", type: "text" },
      ];
    case "organizers":
      return [
        { name: "fullName", label: "Full Name", type: "text" },
        { name: "email", label: "Email", type: "email" },
        { name: "phone", label: "Phone", type: "text" },
        { name: "organization", label: "Organization", type: "text" },
        { name: "role", label: "Role", type: "text" },
      ];
    case "facilities":
      return [
        { name: "name", label: "Facility Name", type: "text" },
        { name: "type", label: "Type", type: "text" },
        { name: "address", label: "Address", type: "text" },
        { name: "capacity", label: "Capacity", type: "number" },
        { name: "contactName", label: "Contact Name", type: "text" },
        { name: "contactEmail", label: "Contact Email", type: "email" },
      ];
    case "logs":
      return [
        { name: "method", label: "Method", type: "text" },
        { name: "path", label: "Path", type: "text" },
        { name: "status", label: "Status", type: "number" },
        { name: "duration", label: "Duration", type: "text" },
      ];
    case "health":
      return [
        { name: "service", label: "Service", type: "text" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "Operational", value: "Operational" },
            { label: "Degraded", value: "Degraded" },
            { label: "Down", value: "Down" },
          ],
        },
        { name: "uptime", label: "Uptime", type: "text" },
      ];
    case "analytics":
      return [
        { name: "name", label: "Metric Name", type: "text" },
        { name: "value", label: "Value", type: "text" },
        { name: "change", label: "Change", type: "text" },
        {
          name: "trend",
          label: "Trend",
          type: "select",
          options: [
            { label: "Up", value: "up" },
            { label: "Down", value: "down" },
            { label: "Neutral", value: "neutral" },
          ],
        },
      ];
    default:
      return [];
  }
};

export const getSearchKey = (collectionName: string): string => {
  switch (collectionName) {
    case "speakers":
    case "attendees":
    case "volunteers":
    case "organizers":
      return "fullName";
    case "sponsors":
      return "companyName";
    case "events":
    case "rooms":
    case "facilities":
    case "analytics":
      return "name";
    case "sessions":
      return "title";
    case "logs":
      return "path";
    case "health":
      return "service";
    default:
      return "name";
  }
};
