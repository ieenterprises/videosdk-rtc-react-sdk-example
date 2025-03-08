export const json_verify = (s) => {
  try {
    const parsed = JSON.parse(s);
    // Check if it's our chat message format (has text or fileAttachment properties)
    return typeof parsed === 'object' && (parsed.hasOwnProperty('text') || parsed.hasOwnProperty('fileAttachment'));
  } catch (e) {
    return false;
  }
};