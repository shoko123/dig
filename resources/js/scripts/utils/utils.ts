function assert(condition: unknown, msg?: string): asserts condition {
  if (condition === false) throw new Error(msg)
}

function dateStringFromDate(date: Date) {
  return date ? date.toISOString().split('T')[0] : 'Not Given'
}

export { assert, dateStringFromDate }
