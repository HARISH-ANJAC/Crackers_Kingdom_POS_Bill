import { Platform } from 'react-native';
const ReactNativeBlobUtil = Platform.OS !== 'web' ? require('react-native-blob-util').default || require('react-native-blob-util') : null;

/**
 * Simple CSV Parser that handles quoted values and commas
 */
export const parseCSV = (csvText: string): string[][] => {
  const result: string[][] = [];
  let row: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(currentVal.trim());
      if (row.length > 1 || row[0] !== '') {
        result.push(row);
      }
      row = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || row.length > 0) {
    row.push(currentVal.trim());
    result.push(row);
  }

  return result;
};

/**
 * Converts CSV rows to an array of objects based on headers
 */
export const csvToObjects = (rows: string[][]): any[] => {
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
  return rows.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, index) => {
      if (header && index < row.length) {
        let val: any = row[index];
        if (typeof val === 'string') {
            const lowerVal = val.trim().toLowerCase();
            // Handle boolean strings
            if (lowerVal === 'true' || lowerVal === 'active' || lowerVal === 'yes') val = true;
            else if (lowerVal === 'false' || lowerVal === 'inactive' || lowerVal === 'no') val = false;
            // Handle numbers
            else if (val.trim() !== '' && !isNaN(Number(val.trim()))) val = Number(val.trim());
            else val = val.trim();
        }
        obj[header] = val;
      }
    });
    return obj;
  });
};

/**
 * Reads a file and returns its content as text
 */
export const readFileAsText = async (fileUri: string): Promise<string> => {
  if (Platform.OS === 'web') {
    // For web, we usually get a File object from the picker, but the picker shim might return a URI
    // If it's a data URI or blob URL, we fetch it
    const response = await fetch(fileUri);
    return await response.text();
  } else {
    // For native, use ReactNativeBlobUtil or FS
    try {
        // Remove 'file://' prefix if present for some native libs
        const path = fileUri.startsWith('file://') ? fileUri.replace('file://', '') : fileUri;
        // Read file using react-native-blob-util which is already verified to be in the project
        const content = await ReactNativeBlobUtil.fs.readFile(path, 'utf8');
        return content;
    } catch (error) {
        console.error('Error reading file:', error);
        throw new Error('Failed to read file content');
    }
  }
};

/**
 * Validates a row against required fields and formats
 */
export const validateRow = (item: any, requiredFields: string[]): { isValid: boolean; errors: string[]; warnings: string[] } => {
    const errors: string[] = [];
    const warnings: string[] = [];

    requiredFields.forEach(field => {
        if (!item[field] && item[field] !== 0 && item[field] !== false) {
            errors.push(`${field} is required`);
        }
    });

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Normalizes a string for better matching (lowercase, no special chars)
 */
export const normalizeForMatch = (str: string): string => {
    return String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
};

/**
 * Finds a match in a list of entities by name or slug
 */
export const findMatch = (list: any[], value: string): any | null => {
    if (!value) return null;
    const normalizedValue = normalizeForMatch(value);
    return list.find(item => 
        normalizeForMatch(item.name) === normalizedValue || 
        normalizeForMatch(item.slug) === normalizedValue ||
        normalizeForMatch(item.id) === normalizedValue
    ) || null;
};

/**
 * Gets a value from an object using a list of possible aliased keys
 */
export const getAliasedValue = (item: any, aliases: string[]) => {
    for (const alias of aliases) {
        const normalizedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (item[normalizedAlias] !== undefined) return item[normalizedAlias];
    }
    return undefined;
};
