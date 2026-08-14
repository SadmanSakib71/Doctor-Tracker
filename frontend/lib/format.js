export function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatGender(value) {
  if (!value) {
    return "—";
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatAge(value) {
  if (value === 0) {
    return "0";
  }

  if (value == null || value === "") {
    return "—";
  }

  return String(value);
}
